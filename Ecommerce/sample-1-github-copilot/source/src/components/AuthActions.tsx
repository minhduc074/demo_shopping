"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthActions() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (userEmail) {
    return (
      <div className="flex gap-4 items-center">
        <span className="text-white/90 text-sm truncate max-w-[120px]">
          {userEmail.split("@")[0]}
        </span>
        <button
          onClick={handleSignOut}
          className="text-white/90 text-sm font-medium hover:text-white/70 transition-opacity"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link
        href="/login"
        className="text-white/90 text-sm font-medium hover:text-white/70 transition-opacity"
      >
        Register
      </Link>
      <Link
        href="/login"
        className="text-white/90 text-sm font-medium hover:text-white/70 transition-opacity"
      >
        Login
      </Link>
    </div>
  );
}
