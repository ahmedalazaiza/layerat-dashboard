"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Shield,
  Radio,
  Lock,
  FileEdit,
  Key,
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
  const { user, logout, projects, creators, unreadNotificationsCount } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      label: "Master Command",
      items: [
        {
          label: "Master Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: undefined,
        },
        {
          label: "Monographs",
          href: "/dashboard/projects",
          icon: FolderKanban,
          badge: projects.length.toString(),
        },
        {
          label: "Users & Studios",
          href: "/dashboard/creators",
          icon: Users,
          badge: `${creators.length}`,
        },
      ],
    },
    {
      label: "Content & Moderation",
      items: [
        {
          label: "Site CMS Studio",
          href: "/dashboard/cms",
          icon: FileEdit,
          badge: "Editor",
        },
        {
          label: "Critiques Moderation",
          href: "/dashboard/comments",
          icon: MessageSquare,
          badge: undefined,
        },
        {
          label: "Taxonomy & Disciplines",
          href: "/dashboard/taxonomy",
          icon: Tags,
          badge: "13",
        },
        {
          label: "Storage & CDN Vault",
          href: "/dashboard/media",
          icon: ImageIcon,
          badge: undefined,
        },
      ],
    },
    {
      label: "System & Governance",
      items: [
        {
          label: "AI Director Engine",
          href: "/dashboard/ai-lab",
          icon: Sparkles,
        },
        {
          label: "Global Broadcasts",
          href: "/dashboard/notifications",
          icon: Radio,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : undefined,
        },
        {
          label: "Roles & Permissions",
          href: "/dashboard/roles",
          icon: Key,
          badge: "RBAC",
        },
        {
          label: "System & Security",
          href: "/dashboard/settings",
          icon: Settings,
          badge: "Admin",
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
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all duration-300 ease-in-out select-none",
          // Mobile state
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed state
          isCollapsed ? "lg:w-[76px]" : "lg:w-68"
        )}
      >
        {/* Top Header: Brand & Super Admin Shield */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-80",
              isCollapsed && "lg:justify-center lg:w-full"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-lg shadow-xs">
              <Shield className="h-4.5 w-4.5 fill-current" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className={cn(bricolage.className, "text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-none")}>
                  Layerat<span className="font-black">.</span>
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider font-bold text-neutral-600 dark:text-neutral-400">
                    SUPER ADMIN
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Super Admin Status Indicator Pill */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="mx-3 mt-3 rounded-[14px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-neutral-900 dark:text-neutral-100">
                Root Access Granted
              </span>
            </div>
            <Lock className="h-3 w-3 text-neutral-400" />
          </div>
        )}

        {/* Quick Action: New Monograph / Case Study */}
        <div className="p-3">
          <Link
            href="/me/projects/new"
            onClick={onMobileClose}
            className={cn(
              "group flex items-center justify-center gap-2 rounded-[14px] bg-black dark:bg-white text-white dark:text-black font-bold transition-all shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98]",
              isCollapsed ? "h-11 w-full p-0" : "h-10 px-3.5 text-xs w-full"
            )}
            title="Create New Monograph"
          >
            <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
            {(!isCollapsed || isMobileOpen) && <span>Publish Monograph</span>}
          </Link>
        </div>

        {/* Navigation Links Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-bold">
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
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900",
                      isCollapsed && "lg:justify-center lg:px-2"
                    )}
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-white dark:text-black"
                          : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
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
                            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: Super Admin Profile Card & Site Link */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800">
          {/* Quick Exit to Public Site */}
          <div className="pb-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors",
                isCollapsed && "lg:justify-center lg:px-0"
              )}
              title="Return to Public Platform"
            >
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              {(!isCollapsed || isMobileOpen) && <span>Public Platform View</span>}
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2.5 min-w-0 flex-1",
                isCollapsed && "lg:justify-center"
              )}
            >
              <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 shrink-0">
                <Image
                  src={getValidAvatarUrl(user?.avatarUrl)}
                  alt={user?.displayName || "Super Admin"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
                <OnlineBadge isOnline={true} size="sm" className="absolute bottom-0 right-0 z-10" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {user?.displayName || "Super Admin"}
                    </span>
                    <VerifiedBadge size="sm" />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">
                    @root_superadmin
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action */}
            {(!isCollapsed || isMobileOpen) && (
              <button
                type="button"
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                title="Sign out of Super Admin"
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
