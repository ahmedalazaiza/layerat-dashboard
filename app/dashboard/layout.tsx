"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LayeratIcon } from "@/components/ui/layerat-logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthReady, isLoadingDb } = useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication Guard: Redirect to /login if unauthenticated after auth check
  useEffect(() => {
    if (isAuthReady && !isLoadingDb && !user) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
    }
  }, [isAuthReady, isLoadingDb, user, pathname, router]);

  // Loading Screen while verifying session
  if (!user && (!isAuthReady || isLoadingDb)) {
    return (
      <div className="min-h-screen bg-[var(--bg-screen)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="animate-pulse">
            <LayeratIcon size="lg" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wider text-neutral-900 dark:text-white uppercase">
              Authenticating Console Session
            </div>
            <div className="text-[11px] text-neutral-400">
              Verifying administrative credentials...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated and auth is ready, render null while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-screen)] text-[var(--content-primary)] flex flex-col">
      {/* Collapsible / Responsive Master Sidebar */}
      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area Offset for Sidebar */}
      <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-68">
        {/* Master Header */}
        <DashboardHeader
          onMobileMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
