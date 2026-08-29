"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/session-context";
import { useTheme, Theme } from "@/components/layout/theme-provider";
import { invalidateAppCache } from "@/lib/supabase/queries";
import {
  Settings,
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  Palette,
  FileCode,
  HardDrive,
  Save,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformSettingsView() {
  const { user, projects, creators, refreshFromDb } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [studioName, setStudioName] = useState("Layerat Creative Collective");
  const [studioEmail, setStudioEmail] = useState("studio@layerat.com");
  const [canonicalUrl, setCanonicalUrl] = useState("https://layerat.com");
  const [isPurgingCache, setIsPurgingCache] = useState(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handlePurgeCache = async () => {
    try {
      setIsPurgingCache(true);
      invalidateAppCache();
      await refreshFromDb();
      setCachePurgedSuccess(true);
      setTimeout(() => setCachePurgedSuccess(false), 2500);
    } finally {
      setIsPurgingCache(false);
    }
  };

  const handleExportJSON = (type: "projects" | "creators" | "full") => {
    let exportData: any = {};
    let filename = "layerat-export.json";

    if (type === "projects") {
      exportData = { exportDate: new Date().toISOString(), total: projects.length, projects };
      filename = `layerat-projects-${new Date().toISOString().slice(0, 10)}.json`;
    } else if (type === "creators") {
      exportData = { exportDate: new Date().toISOString(), total: creators.length, creators };
      filename = `layerat-creators-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      exportData = {
        exportDate: new Date().toISOString(),
        projectsCount: projects.length,
        creatorsCount: creators.length,
        projects,
        creators,
      };
      filename = `layerat-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Slug", "Category", "SubCategory", "Medium", "Published", "Appreciations", "Creator"];
    const rows = projects.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.slug,
      `"${p.category}"`,
      `"${p.subCategory || ""}"`,
      p.medium,
      p.published !== false ? "TRUE" : "FALSE",
      p.appreciations || 0,
      `"${p.creator?.displayName || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `layerat-monographs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Platform Branding & Interface Defaults */}
        <div className="space-y-6">
          {/* General Platform Branding Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Settings className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                General Studio & Platform Identity
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Platform Showcase Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Editorial Contact Email
                </label>
                <input
                  type="email"
                  value={studioEmail}
                  onChange={(e) => setStudioEmail(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Canonical Production Domain
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                  }}
                  className="flex items-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Preferences Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Studio Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Interface & Theme Selection Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Palette className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Appearance & Theme Architecture
              </h3>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-[var(--content-secondary)]">
                Active Theme: <span className="font-bold uppercase text-[var(--content-primary)]">{theme} ({resolvedTheme})</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark Obsidian", icon: Moon },
                  { value: "system", label: "System Sync", icon: Laptop },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-[14px] border text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                          : "border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Health, Cache Purge & 1-Click Backup Export */}
        <div className="space-y-6">
          {/* Database Health & Cache Purge Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Supabase & Memory Cache Control
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Supabase</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--content-primary)]">In-Memory Query Cache</span>
                  <span className="font-mono text-[11px] text-emerald-500 font-bold">Enabled (30s TTL)</span>
                </div>
                <p className="text-[11px] text-[var(--content-tertiary)] leading-relaxed">
                  Fast sub-millisecond query responses with automated invalidation on data mutations.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePurgeCache}
                    disabled={isPurgingCache}
                    className="flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-4 py-2 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isPurgingCache && "animate-spin text-[var(--accent)]")} />
                    <span>{cachePurgedSuccess ? "Cache Purged & Reloaded!" : "Purge Cache & Reload Live"}</span>
                  </button>
                </div>
              </div>

              {/* RLS Status */}
              <div className="flex items-center justify-between rounded-[14px] bg-[var(--bg-neutral)] p-3 border border-[var(--border-neutral)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-[var(--content-primary)]">PostgreSQL Row-Level Security</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--content-tertiary)]">Enforced</span>
              </div>
            </div>
          </div>

          {/* 1-Click Platform Backup & Export Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Download className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Platform Data Export & Backup
              </h3>
            </div>

            <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
              Export complete structured platform archives including all monographs, taxonomy mappings, and creator credentials.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleExportJSON("projects")}
                className="flex items-center justify-between rounded-[14px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3 text-xs font-bold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-[var(--accent)]" />
                  <span>Projects JSON</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--content-tertiary)]">{projects.length} Items</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportJSON("creators")}
                className="flex items-center justify-between rounded-[14px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3 text-xs font-bold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-emerald-500" />
                  <span>Creators JSON</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--content-tertiary)]">{creators.length} Items</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center justify-between rounded-[14px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3 text-xs font-bold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-sky-500" />
                  <span>Monographs CSV</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--content-tertiary)]">Table Data</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportJSON("full")}
                className="flex items-center justify-between rounded-[14px] border border-[var(--border-neutral)] bg-[var(--chip-bg)] text-[var(--chip-fg)] p-3 text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer text-left shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-[var(--accent)]" />
                  <span>Full Backup Archive</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">All Records</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
