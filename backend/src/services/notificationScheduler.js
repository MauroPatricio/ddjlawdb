import { Setting } from '../models/Setting.js';
import { Information } from '../models/Information.js';
import { sendEmail } from './emailService.js';

export const getOrInitSettings = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({
      notificationEmail: 'nhiquelaservicos@gmail.com',
      sendHour: '09:00',
      period: 'Diário',
      daysBeforeExpiration: 30,
      notificationsEnabled: true,
    });
  }
  return setting;
};

export const checkExpiringRecords = async (daysThreshold = 30) => {
  const today = new Date();
  const futureThreshold = new Date();
  futureThreshold.setDate(today.getDate() + Number(daysThreshold));

  // Procurar informações cuja expiração esteja entre hoje (ou no passado recente) e a data limite
  const expiringRecords = await Information.find({
    expirationDate: {
      $lte: futureThreshold,
    },
  }).sort({ expirationDate: 1 });

  return expiringRecords;
};

export const runExpirationCheck = async (force = false) => {
  try {
    const setting = await getOrInitSettings();

    if (!setting.notificationsEnabled && !force) {
      console.log('ℹ️ Envio de notificações desativado nas configurações do sistema.');
      return { sent: false, reason: 'disabled' };
    }

    if (!setting.notificationEmail) {
      console.log('ℹ️ Nenhum email de notificação configurado no sistema.');
      return { sent: false, reason: 'no_email' };
    }

    const days = setting.daysBeforeExpiration || 30;
    const records = await checkExpiringRecords(days);

    if (records.length === 0 && !force) {
      console.log(`ℹ️ Nenhum registo a expirar nos próximos ${days} dias.`);
      return { sent: false, count: 0, reason: 'no_expiring_records' };
    }

    // Formatar email HTML
    const formattedRows = records
      .map((item) => {
        const expDate = item.expirationDate
          ? new Date(item.expirationDate).toISOString().split('T')[0]
          : 'N/A';
        const diffDays = item.expirationDate
          ? Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
          : 0;

        const badgeColor = diffDays < 0 ? '#ef4444' : diffDays <= 7 ? '#f97316' : '#eab308';
        const statusLabel = diffDays < 0 ? 'Já Expirado' : `Expira em ${diffDays} dias`;

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold;">${item.infoRef}</td>
            <td style="padding: 10px;">${item.brand}</td>
            <td style="padding: 10px;">${item.owner}</td>
            <td style="padding: 10px;">${item.clazz}</td>
            <td style="padding: 10px; color: #475569;">${expDate}</td>
            <td style="padding: 10px;">
              <span style="background-color: ${badgeColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${statusLabel}
              </span>
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">DDJ LAW - SIGINFO</h2>
          <p style="margin: 5px 0 0; font-size: 14px; color: #94a3b8;">Alerta de Registos a Expirar (${days} dias de antecedência)</p>
        </div>

        <div style="padding: 20px;">
          <p>Exmo(a). Utilizador,</p>
          <p>Identificamos <strong>${records.length}</strong> registo(s) de Propriedade Industrial que requerem atenção ou renovação:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; text-align: left;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #334155;">
                <th style="padding: 10px;">Ref.</th>
                <th style="padding: 10px;">Marca</th>
                <th style="padding: 10px;">Proprietário</th>
                <th style="padding: 10px;">Classe</th>
                <th style="padding: 10px;">Data Expiração</th>
                <th style="padding: 10px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${formattedRows || '<tr><colSpan="6" style="padding:15px;text-align:center;color:#64748b;">Nenhum registo prestes a expirar.</td></tr>'}
            </tbody>
          </table>

          <div style="margin-top: 25px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #0284c7; font-size: 12px; color: #475569;">
            💡 <strong>Configuração do Alerta:</strong> Frequência ${setting.period} às ${setting.sendHour}. Para alterar as preferências de envio, aceda ao separador Configurações no sistema.
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
          &copy; ${new Date().getFullYear()} DDJ LAW DB SIGINFO. Todos os direitos reservados.
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: setting.notificationEmail,
      subject: `⚠️ DDJ LAW SIGINFO: Alerta de ${records.length} registo(s) prestes a expirar`,
      html: htmlContent,
    });

    setting.lastNotificationSentAt = new Date();
    await setting.save();

    return {
      sent: true,
      count: records.length,
      email: setting.notificationEmail,
      result,
    };
  } catch (err) {
    console.error('❌ Erro na execução da verificação de expiração:', err.message);
    throw err;
  }
};

let schedulerInterval = null;

export const startNotificationScheduler = () => {
  console.log('⏰ A iniciar serviço agendador de notificações de expiração...');

  // Executar uma verificação inicial após 10 segundos
  setTimeout(() => {
    runExpirationCheck().catch((err) => console.error('Erro na verificação de expiração inicial:', err.message));
  }, 10000);

  // Intervalo periódico de verificação a cada 1 hora
  if (!schedulerInterval) {
    schedulerInterval = setInterval(() => {
      const now = new Date();
      // Podemos verificar se a hora atual coincide com a hora configurada no sistema
      getOrInitSettings()
        .then((setting) => {
          if (!setting.notificationsEnabled || !setting.sendHour) return;
          const currentHour = `${String(now.getHours()).padStart(2, '0')}:00`;
          const targetHourPrefix = setting.sendHour.split(':')[0] + ':00';

          if (currentHour === targetHourPrefix) {
            runExpirationCheck();
          }
        })
        .catch((err) => console.error('Erro no agendador de expiração:', err.message));
    }, 60 * 60 * 1000);
  }
};
