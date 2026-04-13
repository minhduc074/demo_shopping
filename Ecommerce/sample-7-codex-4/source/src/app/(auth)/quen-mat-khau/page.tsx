import { ForgotPasswordForm } from "@/components/forms";

export default function ForgotPasswordPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 shadow-[var(--shadow-ambient)] md:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--primary)]">Khôi phục truy cập</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Quên mật khẩu</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Nếu SMTP được cấu hình, hệ thống sẽ gửi email đặt lại mật khẩu thật.</p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
