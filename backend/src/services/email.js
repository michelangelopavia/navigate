const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  // Omesso del tutto se SMTP_USER non è configurato (es. Mailhog in locale),
  // altrimenti nodemailer tenta comunque l'autenticazione e fallisce con
  // "Missing credentials for PLAIN" anche con user/pass vuoti.
  ...(process.env.SMTP_USER && {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }),
});

const sendEmail = async ({ to, subject, body }) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html: body,
  });
};

module.exports = { sendEmail };
