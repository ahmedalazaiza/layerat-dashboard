import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Admin Console Login · Layerat",
  description: "Secure administrative access for Layerat platform governance and operations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-black" />}>
      <LoginClient />
    </Suspense>
  );
}
