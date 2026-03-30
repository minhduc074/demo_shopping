"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setError("Check your email for the confirmation link!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "facebook" | "apple") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <input
            className="w-full px-3 py-3 bg-white border border-outline-variant/30 rounded-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline/60 text-sm"
            placeholder="Email/Phone number/Username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <input
            className="w-full px-3 py-3 bg-white border border-outline-variant/30 rounded-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline/60 text-sm"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>

        {error && (
          <p className="text-xs text-error-dim">{error}</p>
        )}

        <button
          className="w-full bg-shopee hover:bg-primary text-white font-medium py-3 rounded-sm shadow-sm active:scale-[0.98] transition-all text-sm uppercase tracking-wide disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <div className="flex justify-between mt-3 text-[12px]">
        <a className="text-blue-700 hover:text-blue-800" href="#">
          Forgot Password?
        </a>
        <a className="text-blue-700 hover:text-blue-800" href="#">
          Login with SMS
        </a>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-outline-variant font-medium">OR</span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleOAuth("facebook")}
          className="flex items-center justify-center py-2 px-4 border border-outline-variant/20 rounded-sm hover:bg-surface-container-low transition-colors"
        >
          <span className="text-blue-600 font-bold text-lg">f</span>
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center py-2 px-4 border border-outline-variant/20 rounded-sm hover:bg-surface-container-low transition-colors"
        >
          <span className="font-bold text-lg">G</span>
        </button>
        <button
          onClick={() => handleOAuth("apple")}
          className="flex items-center justify-center py-2 px-4 border border-outline-variant/20 rounded-sm hover:bg-surface-container-low transition-colors"
        >
          <span className="font-bold text-lg"></span>
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-outline">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <button onClick={() => setIsSignUp(false)} className="text-shopee font-medium hover:underline">
              Log In
            </button>
          </>
        ) : (
          <>
            New to Shopee?{" "}
            <button onClick={() => setIsSignUp(true)} className="text-shopee font-medium hover:underline">
              Sign Up
            </button>
          </>
        )}
      </div>
    </>
  );
}
