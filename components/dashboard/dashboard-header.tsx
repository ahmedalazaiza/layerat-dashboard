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
  Home,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { invalidateAppCache } from "@/lib/supabase/queries";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, refreshFromDb, isLoadingDb } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Generate readable title from pathname
  const getPageMeta = () => {
    if (pathname === "/dashboard") return { title: "Super Admin Command Center", section: "Platform Hub" };
    if (pathname.startsWith("/dashboard/projects")) return { title: "Platform Monographs & Content Moderation", section: "Projects" };
    if (pathname.startsWith("/dashboard/creators")) return { title: "User & Studio Accounts Management", section: "Community" };
    if (pathname.startsWith("/dashboard/comments")) return { title: "Critiques & Discussion Stream Moderation", section: "Moderation" };
    if (pathname.startsWith("/dashboard/cms")) return { title: "Master Platform CMS & Content Studio", section: "CMS" };
    if (pathname.startsWith("/dashboard/taxonomy")) return { title: "Master Taxonomy & 13 Disciplines CRUD", section: "Taxonomy" };
    if (pathname.startsWith("/dashboard/media")) return { title: "Storage Buckets & Infrastructure Vault", section: "Storage" };
    if (pathname.startsWith("/dashboard/ai-lab")) return { title: "AI Creative Director Engine & Diagnostics", section: "Intelligence" };
    if (pathname.startsWith("/dashboard/notifications")) return { title: "Global Announcements & Push Dispatcher", section: "Broadcasts" };
    if (pathname.startsWith("/dashboard/settings")) return { title: "Super Admin Security & System Backup", section: "Security" };
    return { title: "Super Admin Console", section: "System" };
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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/90 backdrop-blur-md px-4 sm:px-6">
        {/* Left: Mobile Toggle & Super Admin Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-[var(--content-primary)]" />
              <span className="hidden sm:inline font-bold">Admin Console</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-[var(--content-tertiary)]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] hidden md:inline">
              {meta.section}
            </span>
            <ChevronRight className="h-3 w-3 text-[var(--content-tertiary)] hidden md:inline" />
            <h1 className="text-sm font-bold text-[var(--content-primary)] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Super Admin Status Tag */}
          <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-3 py-1 text-[11px] font-mono font-bold text-[var(--content-primary)] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Root Admin</span>
          </span>

          {/* Command Bar Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCommandMenuOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1.5 text-xs text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-all cursor-pointer shadow-2xs"
            title="Open Command Menu (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
            <span>Command palette...</span>
            <kbd className="rounded bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--content-tertiary)]">
              ⌘K
            </kbd>
          </button>

          {/* Purge Cache & Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingDb}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer disabled:opacity-50"
            title="Purge Supabase in-memory cache & reload live data"
          >
            <RefreshCw
              className={cn("h-4 w-4", (isRefreshing || isLoadingDb) && "animate-spin text-[var(--accent)]")}
            />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Popover */}
          <NotificationsPopover />

          {/* Create Monograph CTA Button */}
          <Link
            href="/me/projects/new"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Publish Monograph</span>
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
