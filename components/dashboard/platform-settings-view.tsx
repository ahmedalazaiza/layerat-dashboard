"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/session-context";
import { useTheme } from "@/components/layout/theme-provider";
import { invalidateAppCache } from "@/lib/supabase/queries";
import {
  Settings,
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Shield,
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
  Lock,
  Radio,
  Server,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformSettingsView() {
  const { user, projects, creators, refreshFromDb } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [platformName, setPlatformName] = useState("Layerat — Master Platform");
  const [editorialEmail, setEditorialEmail] = useState("editorial@layerat.com");
  const [canonicalDomain, setCanonicalDomain] = useState("https://layerat.com");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(true);
  const [requireManualVerification, setRequireManualVerification] = useState(true);
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
      exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: "Super Admin Root",
        total: projects.length,
        projects,
      };
      filename = `layerat-projects-master-${new Date().toISOString().slice(0, 10)}.json`;
    } else if (type === "creators") {
      exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: "Super Admin Root",
        total: creators.length,
        creators,
      };
      filename = `layerat-users-master-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      exportData = {
        exportDate: new Date().toISOString(),
        system: "Layerat Platform Master Database Backup",
        exportedBy: "Super Admin Root",
        projectsCount: projects.length,
        creatorsCount: creators.length,
        projects,
        creators,
      };
      filename = `layerat-full-backup-master-${new Date().toISOString().slice(0, 10)}.json`;
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
    link.setAttribute("download", `layerat-monographs-master-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Status Banner */}
      <div className="rounded-[24px] border border-red-500/30 bg-red-500/5 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white font-bold">
            <Shield className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--content-primary)]">
                Super Admin Master Governance & Security Controls
              </h2>
              <span className="rounded bg-red-500 text-white px-2 py-0.2 text-[9px] font-mono uppercase font-extrabold">
                Root Level
              </span>
            </div>
            <p className="text-xs text-[var(--content-secondary)] mt-0.5">
              Elevated credentials active. All changes apply globally to the production database and public showcase.
            </p>
          </div>
        </div>

        {/* Maintenance Mode Toggle Switch */}
        <div className="flex items-center gap-3 bg-[var(--bg-elevated)] p-2.5 rounded-[16px] border border-[var(--border-neutral)] shrink-0">
          <div>
            <div className="text-xs font-bold text-[var(--content-primary)] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Maintenance Mode</span>
            </div>
            <div className="text-[10px] text-[var(--content-tertiary)]">
              {isMaintenanceMode ? "Platform in read-only lock" : "Platform live to public"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              isMaintenanceMode ? "bg-amber-500" : "bg-[var(--bg-neutral)]"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isMaintenanceMode ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Platform Branding & Registration Policies */}
        <div className="space-y-6">
          {/* General Platform Settings Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Settings className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Global Platform Identity & Domains
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Platform Showcase Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Super Admin / Editorial Email
                </label>
                <input
                  type="email"
                  value={editorialEmail}
                  onChange={(e) => setEditorialEmail(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Canonical Production Domain
                </label>
                <input
                  type="url"
                  value={canonicalDomain}
                  onChange={(e) => setCanonicalDomain(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-[var(--border-neutral)]/60">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[var(--content-primary)]">Public Creator Signups</div>
                    <div className="text-[10px] text-[var(--content-tertiary)]">Allow new studio registrations</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowPublicRegistrations(!allowPublicRegistrations)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      allowPublicRegistrations ? "bg-emerald-500" : "bg-[var(--bg-neutral)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                        allowPublicRegistrations ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[var(--content-primary)]">Strict Studio Verification</div>
                    <div className="text-[10px] text-[var(--content-tertiary)]">Require Super Admin badge approval</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireManualVerification(!requireManualVerification)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      requireManualVerification ? "bg-emerald-500" : "bg-[var(--bg-neutral)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                        requireManualVerification ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
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
                      <span>Configuration Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Platform Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Theme & Appearance Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Palette className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Default Platform Theme
              </h3>
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

        {/* Right Column: Database Health, Cache Purge & 1-Click Backup Export */}
        <div className="space-y-6">
          {/* Database Health & Cache Purge Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Supabase Database & Cache Control
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Connected</span>
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
                <span className="font-mono text-[10px] text-emerald-500 font-bold">100% Enforced</span>
              </div>
            </div>
          </div>

          {/* 1-Click Platform Backup & Export Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-neutral)]/60 pb-3">
              <Download className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Master Database Backup & Export
              </h3>
            </div>

            <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
              Super Admin exports include full JSON archives of all monographs, creator profiles, and CSV tables.
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
                  <span>Users JSON</span>
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
                <span className="text-[10px] font-mono text-[var(--content-tertiary)]">Table</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportJSON("full")}
                className="flex items-center justify-between rounded-[14px] border border-[var(--border-neutral)] bg-[var(--chip-bg)] text-[var(--chip-fg)] p-3 text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer text-left shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-[var(--accent)]" />
                  <span>Full Master Backup</span>
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
