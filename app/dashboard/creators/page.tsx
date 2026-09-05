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
  const totalMonographs = projects.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
              )}
            >
              Creators &amp; Studios
            </h1>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-mono font-bold">
              {creators.length} Studios
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Independent designers, creative studios, and practitioners showcasing work on Layerat.
          </p>
        </div>

        {/* Vitality Summary Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono">
            <span className="text-neutral-400">Verified:</span>{" "}
            <span className="font-bold text-neutral-900 dark:text-white">{verifiedCount}</span>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono">
            <span className="text-neutral-400">Online:</span>{" "}
            <span className="font-bold text-neutral-900 dark:text-white">{onlineCount}</span>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono">
            <span className="text-neutral-400">Monographs:</span>{" "}
            <span className="font-bold text-neutral-900 dark:text-white">{totalMonographs}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by studio name, @username, city, or discipline..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-9 pr-8 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Verified Status Pills */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setFilterVerified("all")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
              filterVerified === "all"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            )}
          >
            All Studios ({creators.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterVerified("verified")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
              filterVerified === "verified"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Verified ({verifiedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterVerified("unverified")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
              filterVerified === "unverified"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
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
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
            filterOnline
              ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
              : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", filterOnline ? "bg-white dark:bg-black" : "bg-neutral-400")} />
          <span>Online Now ({onlineCount})</span>
        </button>
      </div>

      {/* Main Creators Table */}
      <CreatorTable creators={filteredCreators} projects={projects} />
    </div>
  );
}
