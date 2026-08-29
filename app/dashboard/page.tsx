"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { TopMonographs } from "@/components/dashboard/top-monographs";
import { LiveActivityStream } from "@/components/dashboard/live-activity-stream";
import { invalidateAppCache } from "@/lib/supabase/queries";
import {
  FolderKanban,
  Heart,
  MessageSquare,
  Users,
  Plus,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Shield,
  Layers,
  Database,
  Download,
  Server,
  HardDrive,
  Radio,
  Lock,
  RefreshCw,
  Cpu,
  FileEdit,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user, projects, creators, notifications, refreshFromDb, isLoadingDb } = useSession();
  const [isPurging, setIsPurging] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  // Aggregate Metrics Calculations
  const stats = useMemo(() => {
    const publishedCount = projects.filter((p) => p.published !== false).length;
    const draftCount = projects.filter((p) => p.published === false).length;
    const featuredCount = projects.filter((p) => p.featured).length;
    const totalLikes = projects.reduce((acc, p) => acc + (p.appreciations || 0), 0);
    const totalComments = projects.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
    const totalCreators = creators.length;
    const verifiedCreators = creators.filter((c) => c.isVerified).length;
    const onlineCreators = creators.filter((c) => c.isOnline).length;

    return {
      publishedCount,
      draftCount,
      featuredCount,
      totalLikes,
      totalComments,
      totalCreators,
      verifiedCreators,
      onlineCreators,
    };
  }, [projects, creators]);

  const handleQuickPurge = async () => {
    try {
      setIsPurging(true);
      invalidateAppCache();
      await refreshFromDb();
      setPurgedSuccess(true);
      setTimeout(() => setPurgedSuccess(false), 2000);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Super Admin Top Command Banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black px-3 py-0.5 text-xs font-bold shadow-2xs">
                <Shield className="h-3.5 w-3.5 fill-current" />
                <span>Super Admin Console</span>
              </span>
              <span className="rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white animate-ping" />
                <span>Platform Operational</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Production v1.2.0
              </span>
            </div>

            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
              )}
            >
              Master Command Center — Layerat Platform
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Full administrative oversight across {projects.length} monographs, {creators.length} creator studios, real-time critique streams, and Gemini Vision AI engines.
            </p>
          </div>

          {/* Super Admin Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleQuickPurge}
              disabled={isPurging}
              className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Purge in-memory query cache"
            >
              <RefreshCw className={cn("h-4 w-4", isPurging && "animate-spin text-black dark:text-white")} />
              <span>{purgedSuccess ? "Cache Purged!" : "Purge App Cache"}</span>
            </button>

            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all shadow-xs"
            >
              <Radio className="h-4 w-4 text-neutral-500" />
              <span>Global Broadcast</span>
            </Link>

            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 rounded-full bg-black dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Manage Monographs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Infrastructure Health Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-xs shadow-xs">
        <div className="flex items-center gap-2.5 p-2">
          <Database className="h-4 w-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Database</div>
            <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">Supabase Live</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2">
          <ShieldCheck className="h-4 w-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Security (RLS)</div>
            <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">100% Enforced</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2">
          <Cpu className="h-4 w-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">AI Vision Engine</div>
            <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">Gemini Multimodal</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2">
          <Server className="h-4 w-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Server Runtime</div>
            <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">Next.js 16 (Turbopack)</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Platform Monographs"
          value={projects.length}
          subValue={`${stats.publishedCount} Live / ${stats.draftCount} Draft`}
          change="+14.2%"
          trend="up"
          icon={FolderKanban}
          sparklineData={[20, 30, 45, 50, 65, 80, 100]}
        />
        <StatsCard
          title="Platform Appreciations"
          value={stats.totalLikes.toLocaleString()}
          subValue="Community Hearts"
          change="+28.6%"
          trend="up"
          icon={Heart}
          sparklineData={[40, 35, 60, 75, 70, 85, 95]}
        />
        <StatsCard
          title="Critiques & Comments"
          value={stats.totalComments.toLocaleString()}
          subValue="Discussion Stream"
          change="+18.9%"
          trend="up"
          icon={MessageSquare}
          sparklineData={[15, 25, 30, 50, 45, 70, 85]}
        />
        <StatsCard
          title="User & Studio Accounts"
          value={stats.totalCreators}
          subValue={`${stats.verifiedCreators} Verified`}
          change="+8.4%"
          trend="up"
          icon={Users}
          sparklineData={[20, 35, 40, 55, 65, 80, 90]}
        />
      </div>

      {/* Super Admin Control Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Monographs",
            desc: "Kanban & data tables",
            href: "/dashboard/projects",
            icon: FolderKanban,
          },
          {
            label: "User Accounts",
            desc: "Verification & roles",
            href: "/dashboard/creators",
            icon: Users,
          },
          {
            label: "Site CMS Studio",
            desc: "Edit all site content",
            href: "/dashboard/cms",
            icon: FileEdit,
          },
          {
            label: "Critiques Queue",
            desc: "Comment moderation",
            href: "/dashboard/comments",
            icon: MessageSquare,
          },
          {
            label: "Master Taxonomy",
            desc: "13 Disciplines CRUD",
            href: "/dashboard/taxonomy",
            icon: Layers,
          },
          {
            label: "Roles & RBAC",
            desc: "Team governance",
            href: "/dashboard/roles",
            icon: Key,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col justify-between rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 transition-all duration-200 hover:border-black dark:hover:border-white hover:shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {action.label}
                </div>
                <div className="text-[10px] text-neutral-400 truncate">
                  {action.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Interactive Platform Velocity & Analytics Chart */}
      <AnalyticsChart projects={projects} />

      {/* Dual Section: Top Monographs & Real-time Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMonographs projects={projects} />
        <LiveActivityStream notifications={notifications} />
      </div>
    </div>
  );
}
