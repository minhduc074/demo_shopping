import { ResetPasswordForm } from "@/components/forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 shadow-[var(--shadow-ambient)] md:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--primary)]">Thiết lập lại</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Mật khẩu mới</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Liên kết đặt lại mật khẩu cần token hợp lệ được tạo trong bảng password_reset_tokens.</p>
        <div className="mt-8">{token ? <ResetPasswordForm token={token} /> : <p>Token không hợp lệ.</p>}</div>
      </div>
    </main>
  );
}
