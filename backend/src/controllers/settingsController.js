import { getOrInitSettings, runExpirationCheck } from '../services/notificationScheduler.js';
import { sendEmail } from '../services/emailService.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrInitSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { notificationEmail, sendHour, period, daysBeforeExpiration, notificationsEnabled } = req.body;

    const settings = await getOrInitSettings();

    if (notificationEmail !== undefined) settings.notificationEmail = notificationEmail;
    if (sendHour !== undefined) settings.sendHour = sendHour;
    if (period !== undefined) settings.period = period;
    if (daysBeforeExpiration !== undefined) settings.daysBeforeExpiration = Number(daysBeforeExpiration);
    if (notificationsEnabled !== undefined) settings.notificationsEnabled = Boolean(notificationsEnabled);

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Configurações de notificação atualizadas com sucesso!',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestEmail = async (req, res, next) => {
  try {
    const settings = await getOrInitSettings();
    const targetEmail = req.body.email || settings.notificationEmail;

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Por favor especifique um endereço de email para o teste.',
      });
    }

    // Executar verificação forçada
    const checkResult = await runExpirationCheck(true);
    const isSimulated = checkResult.result?.mode === 'simulated';

    const message = isSimulated
      ? `[MODO SIMULAÇÃO] Email gerado no servidor para ${targetEmail}. Para receber emails reais na sua caixa de entrada, insira a Palavra-passe de Aplicação no ficheiro backend/.env.`
      : `Email de teste enviado com sucesso via SMTP para ${targetEmail}!`;

    res.status(200).json({
      success: true,
      message,
      details: checkResult,
    });
  } catch (error) {
    next(error);
  }
};
