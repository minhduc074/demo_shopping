import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUserProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCurrentUserProfile();
  if (profile) redirect("/");

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[1.25rem] bg-white shadow-[0_20px_50px_rgba(45,47,47,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="signature-gradient hidden p-10 text-white lg:flex lg:flex-col lg:justify-end">
          <h1 className="mt-4 text-5xl font-black tracking-[-0.05em]">
            Sign in with your database-backed account.
          </h1>
        </div>
        <div className="flex items-center justify-center p-8 lg:p-12">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
