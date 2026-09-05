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
  Users,
  Sparkles,
  Layers,
  Heart,
  Eye,
  ShieldAlert,
  HardDrive,
  TrendingUp,
  FolderKanban,
  FileText,
  Sliders,
  Tags,
  ArrowUpRight,
  RefreshCw,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const {
    user,
    projects,
    creators,
    notifications,
    reports,
    collections,
    categories,
    vitalityMetrics,
    refreshFromDb,
  } = useSession();

  const [isPurging, setIsPurging] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  // Aggregate Metrics Calculations
  const stats = useMemo(() => {
    const publishedCount = projects.filter((p) => p.published !== false).length;
    const draftCount = projects.filter((p) => p.published === false).length;
    const featuredCount = projects.filter((p) => p.featured || p.featuredOrder !== null).length;
    const totalLikes = projects.reduce((acc, p) => acc + (p.appreciations || 0), 0);
    const totalComments = projects.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
    const totalViews = projects.reduce((acc, p) => acc + (p.viewCount || 0), 0);
    const totalCreators = creators.length;
    const activeCreators = vitalityMetrics.activeCreators30D;
    const pendingReports = reports.filter((r) => r.status === "pending").length;
    const storageMb = vitalityMetrics.storageConsumedMb || Math.round(projects.reduce((acc, p) => acc + (p.galleryImages?.length || 1), 0) * 3.5);

    // Engagement-to-publishing ratio
    const totalEngagement = totalLikes + totalComments;
    const engagementRatio = publishedCount > 0 ? (totalEngagement / publishedCount).toFixed(1) : "0.0";

    return {
      publishedCount,
      draftCount,
      featuredCount,
      totalLikes,
      totalComments,
      totalViews,
      totalCreators,
      activeCreators,
      pendingReports,
      storageMb,
      engagementRatio,
    };
  }, [projects, creators, reports, vitalityMetrics]);

  // Discipline Breakdown
  const disciplineDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = projects.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

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
      {/* Top Banner: Layerat Master Overview Header */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-0.5 text-xs font-bold shadow-xs">
                <Activity className="h-3.5 w-3.5" />
                <span>Layerat Blueprint Module 1</span>
              </span>
              <span className="rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white animate-ping" />
                <span>Ecosystem Live</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Engine v2026.1
              </span>
            </div>

            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
              )}
            >
              Master Overview & Vitality Analytics
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Real-time administrative telemetry monitoring creator growth velocity, monograph publishing rates, 13-discipline catalog distribution, and safety reports.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleQuickPurge}
              disabled={isPurging}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Purge cached state and reload from Supabase"
            >
              <RefreshCw className={cn("h-4 w-4", isPurging && "animate-spin text-neutral-900 dark:text-white")} />
              <span>{purgedSuccess ? "Cache Synced!" : "Sync Telemetry"}</span>
            </button>

            <Link
              href="/dashboard/featured"
              className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black px-4 py-2 text-xs font-bold active:scale-95 transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              <span>Curation Showcase</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 7 Blueprint Vitality Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-500 dark:text-neutral-400">
            7 Key Vitality Metrics
          </h2>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold">
            Live Stream Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Registered Creators */}
          <StatsCard
            title="Registered Creators"
            value={stats.totalCreators}
            subValue={`${stats.activeCreators} Active past 30 days`}
            icon={Users}
          />

          {/* 2. Published Monographs */}
          <StatsCard
            title="Published Monographs"
            value={stats.publishedCount}
            subValue={`${stats.featuredCount} Featured Showcase (${stats.draftCount} in draft)`}
            icon={FolderKanban}
          />

          {/* 3. Total Appreciations Given */}
          <StatsCard
            title="Community Appreciations"
            value={stats.totalLikes.toLocaleString()}
            subValue={`${stats.engagementRatio} per monograph ratio`}
            icon={Heart}
          />

          {/* 4. Total Public Views Recorded */}
          <StatsCard
            title="Public Impressions & Views"
            value={stats.totalViews.toLocaleString()}
            subValue="Catalog view count"
            icon={Eye}
          />

          {/* 5. Active Creators (30 Days) */}
          <StatsCard
            title="30-Day Active Creators"
            value={stats.activeCreators}
            subValue="Actively publishing / curating"
            icon={Activity}
          />

          {/* 6. Pending Safety Reports (Highlight in Amber/Red if > 0) */}
          <Link
            href="/dashboard/moderation"
            className={cn(
              "rounded-2xl p-5 border transition-all duration-200 block",
              stats.pendingReports > 0
                ? "bg-red-500/10 border-red-500/40 hover:border-red-500"
                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold">
                Safety Queue
              </span>
              <div
                className={cn(
                  "p-2 rounded-xl",
                  stats.pendingReports > 0
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                )}
              >
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={cn(
                  "text-2xl sm:text-3xl font-extrabold tracking-tight font-mono",
                  stats.pendingReports > 0 ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"
                )}
              >
                {stats.pendingReports}
              </div>
              <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                <span>{stats.pendingReports > 0 ? "Action Required" : "Queue Empty"}</span>
                <span className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 flex items-center gap-1 font-semibold">
                  Review <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* 7. Estimated Media Storage Consumed */}
          <StatsCard
            title="Media Storage Vault"
            value={`${stats.storageMb > 1024 ? (stats.storageMb / 1024).toFixed(1) + " GB" : stats.storageMb + " MB"}`}
            subValue="CDN & Image bucket assets"
            change="+5.4%"
            trend="up"
            icon={HardDrive}
            sparklineData={[20, 25, 28, 32, 35, 40, 44]}
          />

          {/* 8. Curated Collections Card */}
          <Link
            href="/dashboard/collections"
            className="rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold">
                Curated Collections
              </span>
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-mono">
                {collections.length}
              </div>
              <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                <span>Editorial anthologies</span>
                <span className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 flex items-center gap-1 font-semibold">
                  Studio <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Blueprint Navigation Grid: All 8 Modules Direct Access */}
      <div>
        <div className="mb-3 px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-500 dark:text-neutral-400">
            Layerat Blueprint Modules Matrix
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "M1", title: "Overview & Telemetry", href: "/dashboard", icon: Activity, desc: "Vitality metrics & charts" },
            { id: "M2", title: "Platform Settings", href: "/dashboard/settings", icon: Sliders, desc: "Banner, maintenance & uploads" },
            { id: "M3", title: "Featured Showcase", href: "/dashboard/featured", icon: Sparkles, desc: "Homepage order & badges" },
            { id: "M4", title: "Creators & Studios", href: "/dashboard/creators", icon: Users, desc: "Profiles, verification & studios" },
            { id: "M5", title: "Collections Studio", href: "/dashboard/collections", icon: Layers, desc: "Visual multi-project picker" },
            { id: "M6", title: "Moderation Queue", href: "/dashboard/moderation", icon: ShieldAlert, desc: "Reports & 1-click safety" },
            { id: "M7", title: "Taxonomy Engine", href: "/dashboard/taxonomy", icon: Tags, desc: "13 Master Disciplines" },
            { id: "M8", title: "Legal & Policies", href: "/dashboard/legal", icon: FileText, desc: "Terms, privacy & versioning" },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 transition-all hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    {mod.id}
                  </span>
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {mod.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {mod.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dual Section: Publishing Analytics Chart & 13 Disciplines Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart projects={projects} />
        </div>

        {/* 13 Master Disciplines Distribution */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Discipline Distribution
              </h3>
              <p className="text-[11px] text-neutral-400">
                13 Master Disciplines across catalog
              </p>
            </div>
            <Link
              href="/dashboard/taxonomy"
              className="text-xs font-mono text-neutral-900 dark:text-neutral-100 hover:underline flex items-center gap-1 font-semibold"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
            {disciplineDistribution.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
                    {d.name}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, d.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Total Catalog: {projects.length} monographs</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100 font-bold">
              {stats.engagementRatio}x Engagement
            </span>
          </div>
        </div>
      </div>

      {/* Dual Section: Top Monographs & Real-time Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMonographs projects={projects} />
        <LiveActivityStream notifications={notifications} />
      </div>
    </div>
  );
}

