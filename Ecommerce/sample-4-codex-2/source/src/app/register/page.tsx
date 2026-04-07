import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/forms";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="content-shell">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_16px_40px_rgba(45,47,47,0.06)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[--primary]">Register</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[--ink]">Create a customer account</h1>
        <p className="mt-4 text-sm leading-6 text-[--muted]">This form hits a real Prisma-backed API route and stores the user in PostgreSQL with a bcrypt password hash.</p>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
