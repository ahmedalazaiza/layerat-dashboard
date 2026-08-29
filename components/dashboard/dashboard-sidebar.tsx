"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Tags,
  Image as ImageIcon,
  Sparkles,
  Bell,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({
  isMobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, projects, unreadNotificationsCount } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      label: "Core Hub",
      items: [
        {
          label: "Overview & Analytics",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: undefined,
        },
        {
          label: "Projects & Cases",
          href: "/dashboard/projects",
          icon: FolderKanban,
          badge: projects.length.toString(),
        },
        {
          label: "Creators Directory",
          href: "/dashboard/creators",
          icon: Users,
          badge: undefined,
        },
      ],
    },
    {
      label: "Curation & Content",
      items: [
        {
          label: "Critiques & Comments",
          href: "/dashboard/comments",
          icon: MessageSquare,
          badge: undefined,
        },
        {
          label: "Master Taxonomy",
          href: "/dashboard/taxonomy",
          icon: Tags,
          badge: "13 Disciplines",
        },
        {
          label: "Media & Storage Vault",
          href: "/dashboard/media",
          icon: ImageIcon,
          badge: undefined,
        },
      ],
    },
    {
      label: "Intelligence & System",
      items: [
        {
          label: "AI Creative Lab",
          href: "/dashboard/ai-lab",
          icon: Sparkles,
          highlight: true,
        },
        {
          label: "Announcements",
          href: "/dashboard/notifications",
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : undefined,
        },
        {
          label: "Settings & Backup",
          href: "/dashboard/settings",
          icon: Settings,
          badge: undefined,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[var(--border-neutral)] bg-[var(--bg-screen)] transition-all duration-300 ease-in-out select-none",
          // Mobile state
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed state
          isCollapsed ? "lg:w-[76px]" : "lg:w-68"
        )}
      >
        {/* Top Header: Brand & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border-neutral)]">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90",
              isCollapsed && "lg:justify-center lg:w-full"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-[var(--base-contrast)] dark:text-[var(--primary-forest-green)] font-black text-lg shadow-xs">
              L<span className="text-[var(--accent)] dark:text-[var(--primary-forest-green)]">.</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className={cn(bricolage.className, "text-base font-bold tracking-tight text-[var(--content-primary)] leading-none")}>
                  Layerat<span className="text-[var(--accent)]">.</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--content-tertiary)] mt-0.5">
                  Studio Hub
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Quick Action: New Project CTA */}
        <div className="p-3">
          <Link
            href="/me/projects/new"
            onClick={onMobileClose}
            className={cn(
              "group flex items-center justify-center gap-2 rounded-[14px] bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[var(--primary-forest-green)] font-bold transition-all shadow-xs hover:opacity-95 active:scale-[0.98]",
              isCollapsed ? "h-11 w-full p-0" : "h-10 px-3.5 text-xs w-full"
            )}
            title="Create New Project"
          >
            <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
            {(!isCollapsed || isMobileOpen) && <span>New Case Study</span>}
          </Link>
        </div>

        {/* Navigation Links Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[12px] px-3 py-2 text-xs font-semibold transition-all duration-150",
                      isActive
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                        : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]",
                      isCollapsed && "lg:justify-center lg:px-2"
                    )}
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-[var(--accent)]"
                          : item.highlight
                          ? "text-[var(--accent)]"
                          : "text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)]"
                      )}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {(!isCollapsed || isMobileOpen) && item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold shrink-0",
                          isActive
                            ? "bg-white/20 text-white dark:bg-black/20 dark:text-[var(--primary-forest-green)]"
                            : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] border border-[var(--border-neutral)]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[var(--accent)]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: User Identity & Site Link */}
        <div className="border-t border-[var(--border-neutral)] p-3 bg-[var(--bg-elevated)]/60 divide-y divide-[var(--border-neutral)]/60">
          {/* Quick Exit to Public Site */}
          <div className="pb-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors",
                isCollapsed && "lg:justify-center lg:px-0"
              )}
              title="Return to Public Platform"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
              {(!isCollapsed || isMobileOpen) && <span>Live Platform</span>}
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {user ? (
              <div
                className={cn(
                  "flex items-center gap-2.5 min-w-0 flex-1",
                  isCollapsed && "lg:justify-center"
                )}
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] shrink-0">
                  <Image
                    src={getValidAvatarUrl(user.avatarUrl)}
                    alt={user.displayName}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                  <OnlineBadge isOnline={user.isOnline} size="sm" className="absolute bottom-0 right-0 z-10" />
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[var(--content-primary)] truncate">
                        {user.displayName}
                      </span>
                      {user.isVerified !== false && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--content-tertiary)] truncate">
                      @{user.username}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[var(--content-tertiary)]">Guest Mode</div>
            )}

            {/* Logout Action */}
            {(!isCollapsed || isMobileOpen) && user && (
              <button
                type="button"
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--content-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
