"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { LayeratLogo, LayeratIcon } from "@/components/ui/layerat-logo";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { user, isAuthReady, login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect straight to the dashboard
  useEffect(() => {
    if (isAuthReady && user) {
      router.replace(redirectPath);
    }
  }, [isAuthReady, user, redirectPath, router]);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.replace(redirectPath);
      } else {
        if (res.error?.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Email not confirmed in database. Please confirm the account in Supabase SQL Editor."
          );
        } else {
          setErrorMessage(
            res.error || "Authentication failed. Invalid email or password."
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated or still reading session, show subtle loading state
  if (!isAuthReady || user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <LayeratIcon size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <FadeIn className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <LayeratLogo size="lg" className="justify-center mb-2" />
        </div>

        {/* Login Form Card */}
        <Card
          elevated
          className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl p-2 shadow-sm"
        >
          <CardHeader className="text-center pb-3 pt-4">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl font-bold text-neutral-900 dark:text-white tracking-tight"
              )}
            >
              Sign in
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-1 pb-4 px-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3 text-xs text-neutral-900 dark:text-neutral-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@layerat.com"
                    autoComplete="email"
                    className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white h-10 text-xs rounded-xl pr-9"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white h-10 text-xs rounded-xl pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black py-2.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}


