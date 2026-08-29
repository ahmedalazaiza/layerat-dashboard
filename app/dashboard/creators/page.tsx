"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CreatorTable } from "@/components/dashboard/creator-table";
import {
  Users,
  Search,
  ShieldCheck,
  Globe,
  Plus,
  Sparkles,
  MapPin,
  X,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardCreatorsPage() {
  const { creators, projects } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterOnline, setFilterOnline] = useState(false);

  // Dynamic filter
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.displayName.toLowerCase().includes(q);
        const matchUser = c.username.toLowerCase().includes(q);
        const matchBio = c.bio?.toLowerCase().includes(q);
        const matchCity = c.city?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q);
        const matchSkill = c.skills?.some((s) => s.toLowerCase().includes(q));

        if (!matchName && !matchUser && !matchBio && !matchCity && !matchSkill) return false;
      }

      if (filterVerified === "verified" && !c.isVerified) return false;
      if (filterVerified === "unverified" && c.isVerified) return false;
      if (filterOnline && !c.isOnline) return false;

      return true;
    });
  }, [creators, searchQuery, filterVerified, filterOnline]);

  const verifiedCount = creators.filter((c) => c.isVerified).length;
  const onlineCount = creators.filter((c) => c.isOnline).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-neutral)]/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl font-bold tracking-tight text-[var(--content-primary)]"
              )}
            >
              Creators & Studios Directory
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              {filteredCreators.length} / {creators.length} Studios
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Manage creator profiles, toggle verified studio badges, inspect locations, and review published monographs.
          </p>
        </div>

        {/* Public Directory Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/creators"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] active:scale-95 transition-all shadow-xs"
          >
            <Globe className="h-4 w-4 text-[var(--content-tertiary)]" />
            <span>Public Directory</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by studio name, @username, city, or discipline..."
            className="w-full rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] pl-9 pr-8 py-1.5 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Verified Status Pills */}
        <div className="flex items-center gap-1 bg-[var(--bg-neutral)] p-1 rounded-full border border-[var(--border-neutral)]">
          <button
            type="button"
            onClick={() => setFilterVerified("all")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
              filterVerified === "all"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            All Studios ({creators.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterVerified("verified")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1",
              filterVerified === "verified"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>Verified ({verifiedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterVerified("unverified")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
              filterVerified === "unverified"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            Unverified
          </button>
        </div>

        {/* Online Filter Toggle */}
        <button
          type="button"
          onClick={() => setFilterOnline(!filterOnline)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
            filterOnline
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              : "border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", filterOnline ? "bg-emerald-500 animate-pulse" : "bg-[var(--content-tertiary)]")} />
          <span>Online Now ({onlineCount})</span>
        </button>
      </div>

      {/* Main Creators Table */}
      <CreatorTable creators={filteredCreators} projects={projects} />
    </div>
  );
}
