import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error('Endereço de email de destino não especificado.');
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  const isPlaceholder =
    !SMTP_USER ||
    !SMTP_PASS ||
    SMTP_USER.includes('seu_email') ||
    SMTP_PASS.includes('sua_palavra_passe');

  const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && !isPlaceholder);

  if (!isSmtpConfigured) {
    console.log('----------------------------------------------------');
    console.log('📧 [Modo Simulação / Log] Email a enviar:');
    console.log(`De: ${SMTP_FROM || 'DDJ LAW SIGINFO <nhiquelaservicos@gmail.com>'}`);
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo Textual:\n${text || html}`);
    console.log('----------------------------------------------------');
    return {
      success: true,
      mode: 'simulated',
      message: 'Email simulado e registado no sistema (Configure o seu email e senha de aplicação no backend/.env para envios reais).',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM || `DDJ LAW SIGINFO <${SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log(`✅ Email enviado com sucesso para ${to}. ID: ${info.messageId}`);
    return {
      success: true,
      mode: 'real',
      messageId: info.messageId,
      message: 'Email enviado com sucesso via SMTP!',
    };
  } catch (err) {
    console.error(`❌ Erro ao enviar email via SMTP: ${err.message}`);
    throw err;
  }
};
