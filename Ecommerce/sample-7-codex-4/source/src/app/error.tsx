"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dbHint =
    error.message.includes('role "postgres" does not exist') || error.message.includes("DATABASE_URL")
      ? "Kết nối PostgreSQL đang sai. Hãy tạo source/.env.local với DATABASE_URL đúng user/database thực tế của bạn."
      : "Ứng dụng đã chặn lỗi và không dùng dữ liệu giả. Kiểm tra log server để biết truy vấn hoặc schema nào đang sai.";

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-[var(--shadow-ambient)]">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--primary)]">Lỗi hệ thống</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Không thể đọc dữ liệu từ PostgreSQL</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{dbHint}</p>
        <pre className="mt-6 overflow-auto rounded-2xl bg-[var(--surface-low)] p-4 text-xs leading-6 text-[var(--foreground)]">{error.message}</pre>
        <button onClick={reset} className="editorial-gradient mt-6 rounded-full px-5 py-3 font-semibold text-white">
          Thử lại
        </button>
      </div>
    </main>
  );
}
