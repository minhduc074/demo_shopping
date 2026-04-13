import Link from "next/link";
import { LoginForm } from "@/components/forms";

export default function LoginPage() {
  return (
    <main className="section-shell grid min-h-screen items-center py-10 md:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden min-h-[620px] rounded-[32px] bg-[linear-gradient(135deg,rgba(178,34,3,0.92),rgba(255,119,91,0.88))] p-12 text-white md:flex md:flex-col md:justify-between">
        <div>
          <p className="font-display text-4xl font-bold italic">The Editorial</p>
          <p className="mt-6 max-w-md font-display text-5xl font-semibold leading-tight">Đăng nhập để tiếp tục hành trình mua sắm được tuyển chọn.</p>
        </div>
        <p className="max-w-md text-sm leading-7 text-white/78">Thiết kế bám theo Stitch: hero split-layout, soft glass cảm giác cao cấp và CTA gradient rõ vai trò.</p>
      </div>
      <div className="mx-auto w-full max-w-xl rounded-[32px] bg-white p-8 shadow-[var(--shadow-ambient)] md:-ml-10 md:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--primary)]">Tài khoản</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Chào mừng trở lại</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Đăng nhập bằng email và mật khẩu đã lưu trong PostgreSQL.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/quen-mat-khau" className="font-semibold text-[var(--primary)]">Quên mật khẩu?</Link>
          <Link href="/dang-ky" className="font-semibold">Tạo tài khoản</Link>
        </div>
      </div>
    </main>
  );
}
