import nodemailer from "nodemailer";
import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../config";

function buildTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.log(`[EMAIL_NOT_CONFIGURED] to=${to} reset=${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Reset your password",
    text: `We received a password reset request. Use this link: ${resetUrl}`,
    html: `<p>We received a password reset request.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}
