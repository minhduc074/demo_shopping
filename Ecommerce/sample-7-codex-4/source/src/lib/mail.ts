import nodemailer from "nodemailer";
import { absoluteUrl } from "@/lib/utils";
import { env, hasSmtpConfig } from "@/lib/env";
import { AppError } from "@/lib/errors";

function getTransporter() {
  if (!hasSmtpConfig()) {
    throw new AppError("Chưa cấu hình SMTP để gửi email đặt lại mật khẩu.", 500);
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(email: string, token: string, fullName: string) {
  const transporter = getTransporter();
  const resetUrl = absoluteUrl(`/dat-lai-mat-khau?token=${token}`);

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Đặt lại mật khẩu The Editorial",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; padding: 24px; color: #2d2f2f;">
        <h1 style="font-family: 'Be Vietnam Pro', Inter, Arial, sans-serif;">Xin chào ${fullName},</h1>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản The Editorial.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#b22203,#ff775b);color:#fff;text-decoration:none;font-weight:700;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Liên kết có hiệu lực trong 30 phút.</p>
      </div>
    `,
  });
}
