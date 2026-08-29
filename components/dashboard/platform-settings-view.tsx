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
  Shield,
  Moon,
  Sun,
  Laptop,
  Save,
  Check,
  Server,
  Lock,
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Platform Security & System Administration
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                Root Admin
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Manage database backups, in-memory query caches, registration gates, and system maintenance.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 shrink-0">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <Check className="h-4 w-4" />
              <span>Saved!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save System Config</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Configuration (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* General Platform Parameters */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-900 pb-3">
              Platform Domain & Canonical Routing
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Platform Display Title
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Official Editorial Contact Email
                </label>
                <input
                  type="email"
                  value={editorialEmail}
                  onChange={(e) => setEditorialEmail(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Canonical Production Domain
                </label>
                <input
                  type="url"
                  value={canonicalDomain}
                  onChange={(e) => setCanonicalDomain(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* User Registration & Access Gates */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-900 pb-3">
              Access Governance & Security Gates
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-[14px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPublicRegistrations}
                  onChange={(e) => setAllowPublicRegistrations(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Open Public Creator Onboarding
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Allow new designers and studios to create free public accounts.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-[14px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireManualVerification}
                  onChange={(e) => setRequireManualVerification(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Manual Verified Studio Approval
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Require Super Admin approval before granting official verification badges.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-[14px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMaintenanceMode}
                  onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    System Maintenance Lock
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Temporarily restrict public access with a maintenance banner.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Cache, DB Backups & Telemetry (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Cache & Engine Performance */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-900 pb-3">
              Cache & Realtime Invalidation
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Flush in-memory Supabase cached datasets to force immediate refresh from postgres tables across all routes.
            </p>

            <button
              type="button"
              onClick={handlePurgeCache}
              disabled={isPurgingCache}
              className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPurgingCache && "animate-spin")} />
              <span>{cachePurgedSuccess ? "Cache Purged Successfully!" : "Purge All In-Memory Caches"}</span>
            </button>
          </div>

          {/* Database Backup Exports */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Database Backups & JSON Dumps
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleExportJSON("projects")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-center"
              >
                <Download className="h-4 w-4 text-neutral-500 mb-1" />
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Monographs</span>
                <span className="text-[10px] font-mono text-neutral-400">({projects.length} records)</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportJSON("creators")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-center"
              >
                <Download className="h-4 w-4 text-neutral-500 mb-1" />
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Studios</span>
                <span className="text-[10px] font-mono text-neutral-400">({creators.length} users)</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportJSON("full")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer text-center shadow-xs"
              >
                <Download className="h-4 w-4 mb-1" />
                <span className="text-xs font-bold">Full Database</span>
                <span className="text-[10px] font-mono opacity-80">Full Schema</span>
              </button>
            </div>
          </div>

          {/* Theme Mode Selector */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-900 pb-3">
              Dashboard Color Mode
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light Mode", icon: Sun },
                { id: "dark", label: "Dark Mode", icon: Moon },
                { id: "system", label: "System Auto", icon: Laptop },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
