"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { TopMonographs } from "@/components/dashboard/top-monographs";
import { LiveActivityStream } from "@/components/dashboard/live-activity-stream";
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
  Zap,
  Activity,
  Layers,
  Database,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user, projects, creators, notifications, isLoadingDb } = useSession();

  // Aggregate Metrics Calculations
  const stats = useMemo(() => {
    const publishedCount = projects.filter((p) => p.published !== false).length;
    const draftCount = projects.filter((p) => p.published === false).length;
    const totalLikes = projects.reduce((acc, p) => acc + (p.appreciations || 0), 0);
    const totalComments = projects.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
    const totalCreators = creators.length;
    const verifiedCreators = creators.filter((c) => c.isVerified).length;

    return {
      publishedCount,
      draftCount,
      totalLikes,
      totalComments,
      totalCreators,
      verifiedCreators,
    };
  }, [projects, creators]);

  return (
    <div className="space-y-8">
      {/* Studio Banner & Welcome */}
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-neutral)] p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                <Zap className="h-3 w-3" />
                <span>Studio Intelligence Active</span>
              </span>
              <span className="text-xs text-[var(--content-tertiary)] font-mono">
                v1.2.0 Production
              </span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--content-primary)]"
              )}
            >
              Welcome to Layerat Studio, {user?.displayName || "Creator"}.
            </h1>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-2xl">
              Real-time platform metrics, portfolio monograph curation, critique streams, and AI Creative Director tools.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/me/projects/new"
              className="flex items-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create Monograph</span>
            </Link>

            <Link
              href="/dashboard/ai-lab"
              className="flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] active:scale-95 transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <span>AI Studio Lab</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Mesh Glow */}
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Monographs"
          value={projects.length}
          subValue={`${stats.publishedCount} Live / ${stats.draftCount} Draft`}
          change="+14.2%"
          trend="up"
          icon={FolderKanban}
          sparklineData={[20, 30, 45, 50, 65, 80, 100]}
        />
        <StatsCard
          title="Total Appreciations"
          value={stats.totalLikes.toLocaleString()}
          subValue="Live Community Hearts"
          change="+28.6%"
          trend="up"
          icon={Heart}
          accentColor="#F43F5E"
          sparklineData={[40, 35, 60, 75, 70, 85, 95]}
        />
        <StatsCard
          title="Critiques & Comments"
          value={stats.totalComments.toLocaleString()}
          subValue="Design Feedback"
          change="+18.9%"
          trend="up"
          icon={MessageSquare}
          accentColor="#F59E0B"
          sparklineData={[15, 25, 30, 50, 45, 70, 85]}
        />
        <StatsCard
          title="Creators Collective"
          value={stats.totalCreators}
          subValue={`${stats.verifiedCreators} Verified Studios`}
          change="+8.4%"
          trend="up"
          icon={Users}
          accentColor="#10B981"
          sparklineData={[20, 35, 40, 55, 65, 80, 90]}
        />
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Projects Manager",
            desc: "Kanban & data tables",
            href: "/dashboard/projects",
            icon: FolderKanban,
          },
          {
            label: "Creators Directory",
            desc: "Studios & verifications",
            href: "/dashboard/creators",
            icon: Users,
          },
          {
            label: "Critiques Stream",
            desc: "Discussions moderation",
            href: "/dashboard/comments",
            icon: MessageSquare,
          },
          {
            label: "Master Taxonomy",
            desc: "13 Disciplines & tools",
            href: "/dashboard/taxonomy",
            icon: Layers,
          },
          {
            label: "Media Vault",
            desc: "CDN storage buckets",
            href: "/dashboard/media",
            icon: Database,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col justify-between rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 transition-all duration-200 hover:border-[var(--content-primary)] hover:shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-[var(--content-primary)] truncate">
                  {action.label}
                </div>
                <div className="text-[10px] text-[var(--content-tertiary)] truncate">
                  {action.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Interactive Analytics & Distribution Chart */}
      <AnalyticsChart projects={projects} />

      {/* Dual Section: Top Monographs & Real-time Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMonographs projects={projects} />
        <LiveActivityStream notifications={notifications} />
      </div>
    </div>
  );
}
