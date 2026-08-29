"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { isSuperAdminEmail } from "@/lib/auth-security";

export function LoginClient() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;
  const isSuperAdminCandidate = isSuperAdminEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (isSuperAdminEmail(email)) {
          router.push("/dashboard");
        } else {
          router.push("/me");
        }
      } else {
        setErrorMessage(res.error || "Invalid email or password. Please check your credentials.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          className="justify-center mb-4"
          items={[
            { label: "Sign-In", isCurrent: true },
          ]}
        />

        <Card elevated className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-[24px] p-2 shadow-xl">
          <CardHeader className="text-center pb-4 pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 mx-auto mb-3 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
              <span>{isSuperAdminCandidate ? "Super Admin Access" : "Welcome Back"}</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight"
              )}
            >
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
              {isSuperAdminCandidate
                ? "Enter your master credentials to access the root administration console."
                : "Manage your portfolio, publish new work, and track appreciations."}
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3.5 text-xs text-neutral-900 dark:text-neutral-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 block mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmedazy.uxui@gmail.com"
                    autoComplete="email"
                    className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:border-black dark:focus:border-white"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:border-black dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Authenticating Master Session..." : "Log in to Platform"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-neutral-900 dark:text-neutral-100 underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
