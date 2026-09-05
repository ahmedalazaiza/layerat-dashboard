"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Users,
  ShieldAlert,
  Tags,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { LayeratLogo, LayeratIcon } from "@/components/ui/layerat-logo";
import { getValidAvatarUrl } from "@/lib/avatar";
import { canAccessModule, canMutateModule, BlueprintModule, RBAC_MATRIX } from "@/lib/roles";
import { UserRole } from "@/lib/types";
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
  const {
    user,
    logout,
    projects,
    creators,
    reports,
    collections,
    activeRole,
    setActiveRole,
  } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const featuredCount = projects.filter((p) => p.featured || p.featuredOrder !== null).length;

  const blueprintNavGroups: {
    label: string;
    items: {
      label: string;
      href: string;
      module: BlueprintModule;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      label: "Editorial & Content",
      items: [
        {
          label: "Overview & Vitality",
          href: "/dashboard",
          module: "analytics",
          icon: LayoutDashboard,
        },
        {
          label: "Featured Showcase",
          href: "/dashboard/featured",
          module: "featured",
          icon: Sparkles,
          badge: `${featuredCount}`,
        },
        {
          label: "Curated Collections",
          href: "/dashboard/collections",
          module: "collections",
          icon: Layers,
          badge: `${collections.length}`,
        },
      ],
    },
    {
      label: "Community & Studios",
      items: [
        {
          label: "Creators & Studios",
          href: "/dashboard/creators",
          module: "creators",
          icon: Users,
          badge: `${creators.length}`,
        },
        {
          label: "Moderation Queue",
          href: "/dashboard/moderation",
          module: "moderation",
          icon: ShieldAlert,
          badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : undefined,
          badgeColor: "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold",
        },
      ],
    },
    {
      label: "Platform & Governance",
      items: [
        {
          label: "Admin & Roles",
          href: "/dashboard/roles",
          module: "roles",
          icon: ShieldCheck,
          badge: "RBAC",
        },
        {
          label: "Taxonomy Engine",
          href: "/dashboard/taxonomy",
          module: "taxonomy",
          icon: Tags,
          badge: "13",
        },
        {
          label: "Legal & Policies",
          href: "/dashboard/legal",
          module: "legal",
          icon: FileText,
          badge: "3",
        },
        {
          label: "Platform Operations",
          href: "/dashboard/settings",
          module: "settings",
          icon: Sliders,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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
        {/* Top Header: Official Layerat Logo & Brand */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90",
              isCollapsed && "lg:justify-center lg:w-full"
            )}
          >
            {isCollapsed ? (
              <LayeratIcon size="sm" />
            ) : (
              <LayeratLogo variant="full" size="md" />
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 ml-1"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Active Role Simulator & Preview Pill */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="mx-3 mt-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
                Active Persona
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold uppercase">
                {activeRole}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["admin", "curator", "moderator", "member"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRole(r)}
                  className={cn(
                    "text-[10px] py-1 rounded font-mono font-bold capitalize transition-all cursor-pointer",
                    activeRole === r
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs"
                      : "bg-white/70 dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800/60"
                  )}
                >
                  {r.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action: New Monograph */}
        <div className="p-3">
          <Link
            href="/me/projects/new"
            onClick={onMobileClose}
            className={cn(
              "group flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold transition-all shadow-xs active:scale-[0.98]",
              isCollapsed ? "h-11 w-full p-0" : "h-9 px-3 text-xs w-full"
            )}
            title="Publish Monograph"
          >
            <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
            {(!isCollapsed || isMobileOpen) && <span>Publish Monograph</span>}
          </Link>
        </div>

        {/* Navigation Links Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {blueprintNavGroups.map((group) => (
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
                const hasAccess = canAccessModule(activeRole, item.module);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[12px] px-3 py-2 text-xs font-semibold transition-all duration-150",
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900",
                      !hasAccess && "opacity-55",
                      isCollapsed && "lg:justify-center lg:px-2"
                    )}
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-white dark:text-black"
                          : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                      )}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex items-center gap-1 shrink-0">
                        {!hasAccess && (
                          <Lock className="h-3 w-3 text-neutral-400" />
                        )}
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                              item.badgeColor ||
                                (isActive
                                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700")
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: User Profile Card */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-950">
          <div className="pt-1 flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2.5 min-w-0 flex-1",
                isCollapsed && "lg:justify-center"
              )}
            >
              <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-neutral-300 dark:ring-neutral-700 shrink-0">
                <Image
                  src={getValidAvatarUrl(user?.avatarUrl)}
                  alt={user?.displayName || "Admin User"}
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
                      {user?.displayName || "Admin User"}
                    </span>
                    <VerifiedBadge size="sm" />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate capitalize font-medium">
                    {user?.customBadge || (activeRole === "admin" ? "SuperAdmin" : `${activeRole} Tier`)}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action */}
            {(!isCollapsed || isMobileOpen) && (
              <button
                type="button"
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
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
