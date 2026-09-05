"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import {
  Menu,
  Search,
  Command,
  RefreshCw,
  Plus,
  Sparkles,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { invalidateAppCache } from "@/lib/supabase/queries";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { LayeratLogo } from "@/components/ui/layerat-logo";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, activeRole, refreshFromDb, isLoadingDb } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Generate readable title from pathname
  const getPageMeta = () => {
    if (pathname === "/dashboard") return { title: "Overview & Vitality Hub", section: "Module 1" };
    if (pathname.startsWith("/dashboard/settings")) return { title: "Operations & Platform Settings", section: "Module 2" };
    if (pathname.startsWith("/dashboard/featured")) return { title: "Editorial & Featured Showcase", section: "Module 3" };
    if (pathname.startsWith("/dashboard/creators")) return { title: "Creators & Studios Directory", section: "Community" };
    if (pathname.startsWith("/dashboard/roles")) return { title: "Admin Team & Role Governance", section: "Governance" };
    if (pathname.startsWith("/dashboard/users")) return { title: "Creators & Studios Directory", section: "Community" };
    if (pathname.startsWith("/dashboard/collections")) return { title: "Curated Collections Studio", section: "Module 5" };
    if (pathname.startsWith("/dashboard/moderation")) return { title: "Moderation & Safety Queue", section: "Module 6" };
    if (pathname.startsWith("/dashboard/taxonomy")) return { title: "Taxonomy & Discipline Engine", section: "Module 7" };
    if (pathname.startsWith("/dashboard/legal")) return { title: "Dynamic Legal & Policy Documents", section: "Module 8" };
    // Legacy fallbacks
    if (pathname.startsWith("/dashboard/projects")) return { title: "Editorial & Featured Showcase", section: "Module 3" };
    if (pathname.startsWith("/dashboard/cms")) return { title: "Dynamic Legal & Policy Documents", section: "Module 8" };
    if (pathname.startsWith("/dashboard/comments")) return { title: "Moderation & Safety Queue", section: "Module 6" };
    return { title: "Layerat Admin Console", section: "Platform" };
  };

  const meta = getPageMeta();

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      invalidateAppCache();
      await refreshFromDb();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 sm:px-6">
        {/* Left: Mobile Toggle, Official Layerat Logo & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white lg:hidden cursor-pointer shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Official Layerat Header Logo */}
          <Link
            href="/dashboard"
            className="flex items-center hover:opacity-85 transition-opacity shrink-0 py-0.5"
            title="Layerat Dashboard Overview"
          >
            <LayeratLogo variant="full" className="h-6 sm:h-7 w-auto" />
          </Link>

          {/* Elegant Monochromatic Divider */}
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block shrink-0" />

          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold hidden md:inline">
              {meta.section}
            </span>
            <ChevronRight className="h-3 w-3 text-neutral-400 hidden md:inline" />
            <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Super Admin Status Tag */}
          <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-[11px] font-mono font-bold text-neutral-900 dark:text-neutral-100 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white animate-ping" />
            <span>{user?.customBadge || (activeRole === "admin" ? "SuperAdmin" : `${activeRole} Tier`)}</span>
          </span>

          {/* Command Bar Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCommandMenuOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-2xs"
            title="Open Command Menu (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <span>Command palette...</span>
            <kbd className="rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Purge Cache & Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingDb}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            title="Purge Supabase cache & reload live data"
          >
            <RefreshCw
              className={cn("h-4 w-4", (isRefreshing || isLoadingDb) && "animate-spin text-black dark:text-white")}
            />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Popover */}
          <NotificationsPopover />

          {/* Manage Monographs CTA Button */}
          <Link
            href="/dashboard/projects"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-black dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Manage Monographs</span>
          </Link>
        </div>
      </header>

      {/* Interactive Command Menu Modal */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
      />
    </>
  );
}
