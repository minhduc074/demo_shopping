"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { email, password, fullName } : { email, password }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Authentication failed");
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={submit}>
      <div>
        <h2 className="text-2xl font-semibold">{mode === "login" ? "Sign in to your account" : "Create an account"}</h2>
      </div>
      <div className="space-y-4">
        {mode === "register" && (
          <input required type="text" placeholder="Full name" className="field" value={fullName} onChange={e => setFullName(e.target.value)} disabled={busy} />
        )}
        <input required type="email" placeholder="Email address" className="field" value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        <input required minLength={8} type="password" placeholder="Password" className="field" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">
        {mode === "login" ? "Sign In" : "Register"}
      </Button>
      <div className="text-center text-sm text-[var(--color-text-muted)]">
        {mode === "login" ? (
          <>Don't have an account? <Link href="/register" className="text-[var(--color-primary)] font-semibold hover:underline">Register</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">Log in</Link></>
        )}
      </div>
    </form>
  );
}
