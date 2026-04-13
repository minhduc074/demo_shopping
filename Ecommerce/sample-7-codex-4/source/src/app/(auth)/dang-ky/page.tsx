import Link from "next/link";
import { RegisterForm } from "@/components/forms";

export default function RegisterPage() {
  return (
    <main className="section-shell grid min-h-screen items-center py-10 md:grid-cols-[0.95fr_1.05fr]">
      <div className="mx-auto w-full max-w-xl rounded-[32px] bg-white p-8 shadow-[var(--shadow-ambient)] md:mr-[-40px] md:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--primary)]">Tạo tài khoản</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Bắt đầu mua sắm có tổ chức</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Thông tin tài khoản được lưu vào bảng users, không dùng mock hoặc seed UI.</p>
        <div className="mt-8">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm">Đã có tài khoản? <Link href="/dang-nhap" className="font-semibold text-[var(--primary)]">Đăng nhập</Link></p>
      </div>
      <div className="hidden min-h-[620px] rounded-[32px] bg-[var(--surface-low)] p-12 md:flex md:flex-col md:justify-between">
        <div className="rounded-[24px] bg-white p-8 shadow-[var(--shadow-soft)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--primary)]">Editorial Commerce</p>
          <p className="mt-4 font-display text-4xl font-semibold">Thiết kế gọn, rõ luồng, sẵn cho mở rộng.</p>
        </div>
        <p className="max-w-md text-sm leading-7 text-[var(--muted)]">Tài khoản mới sẽ tự tạo session DB và gắn cookie bảo mật ngay sau khi đăng ký thành công.</p>
      </div>
    </main>
  );
}
