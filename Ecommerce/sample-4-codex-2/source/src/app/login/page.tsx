import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/forms";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="content-shell">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_16px_40px_rgba(45,47,47,0.06)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[--primary]">Login</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[--ink]">Sign in to the curated storefront</h1>
        <p className="mt-4 text-sm leading-6 text-[--muted]">Demo customer: `lan@thecurator.local` / `demo1234`. Demo admin: `admin@thecurator.local` / `admin1234`.</p>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
