"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/session-context";
import { useTheme } from "@/components/layout/theme-provider";
import { invalidateAppCache } from "@/lib/supabase/queries";
import { canMutateModule } from "@/lib/roles";
import {
  Sliders,
  Database,
  RefreshCw,
  Download,
  Shield,
  Save,
  Check,
  Megaphone,
  ExternalLink,
  Lock,
  HardDrive,
  Layers,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformSettingsView() {
  const {
    user,
    projects,
    creators,
    refreshFromDb,
    platformSettings,
    updatePlatformSettings,
    activeRole,
  } = useSession();

  const { theme, resolvedTheme, setTheme } = useTheme();

  // Local editable form state initialized from session platformSettings
  const [bannerActive, setBannerActive] = useState(platformSettings.announcementBannerActive);
  const [bannerText, setBannerText] = useState(platformSettings.announcementBannerText);
  const [bannerLink, setBannerLink] = useState(platformSettings.announcementBannerLink);
  const [allowSignups, setAllowSignups] = useState(platformSettings.allowSignups);
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(platformSettings.maintenanceMessage);
  const [enableCollections, setEnableCollections] = useState(platformSettings.enableCollections);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(platformSettings.maxUploadSizeMb);

  const [isPurgingCache, setIsPurgingCache] = useState(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEdit = canMutateModule(activeRole, "settings");

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setIsSaving(true);
      await updatePlatformSettings({
        announcementBannerActive: bannerActive,
        announcementBannerText: bannerText,
        announcementBannerLink: bannerLink,
        allowSignups,
        maintenanceMode,
        maintenanceMessage,
        enableCollections,
        maxUploadSizeMb: Number(maxUploadSizeMb),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let exportData: any = {};
    let filename = "layerat-export.json";

    if (type === "projects") {
      exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: user?.displayName || "Admin",
        total: projects.length,
        projects,
      };
      filename = `layerat-monographs-${new Date().toISOString().slice(0, 10)}.json`;
    } else if (type === "creators") {
      exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: user?.displayName || "Admin",
        total: creators.length,
        creators,
      };
      filename = `layerat-users-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      exportData = {
        exportDate: new Date().toISOString(),
        system: "Layerat Platform Master Database Backup",
        exportedBy: user?.displayName || "Admin",
        platformSettings,
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

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6">
      {/* RBAC Permission Banner */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Read-Only Mode:</span> Platform operations mutation is restricted to the <strong className="uppercase font-mono font-bold">Admin</strong> role. Your active persona is <span className="uppercase font-mono font-bold underline">{activeRole}</span>.
          </div>
        </div>
      )}

      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-bold">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Operations & Operational Parameters
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                Module 2
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Live announcement banner, registration freeze gates, emergency maintenance mode, and payload constraints.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 shrink-0">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <Check className="h-4 w-4" />
              <span>Saved & Synced!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={!canEdit || isSaving}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black disabled:opacity-50 px-5 py-2 text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Parameters</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: GLOBAL ANNOUNCEMENT BANNER & LIVE PREVIEW */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Global Announcement Banner
            </h3>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-neutral-500">Active on Public Site</span>
            <input
              type="checkbox"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
              disabled={!canEdit}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
            />
          </label>
        </div>

        {/* Live Interactive Preview Bar */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            Live Preview (How visitors see it on Layerat):
          </div>
          <div
            className={cn(
              "rounded-xl p-3 flex items-center justify-between text-xs transition-all",
              bannerActive
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs border border-neutral-800 dark:border-neutral-200"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700"
            )}
          >
            <div className="flex items-center gap-2 font-medium truncate">
              <span className="h-2 w-2 rounded-full bg-white dark:bg-black animate-pulse" />
              <span className="truncate">{bannerText || "No announcement text configured"}</span>
            </div>
            {bannerLink && (
              <a
                href={bannerLink}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 ml-3 text-[11px] font-mono underline font-bold hover:opacity-80 flex items-center gap-1"
              >
                Learn More <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Announcement Message
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              disabled={!canEdit}
              placeholder="e.g. Layerat v2.4 Live: New Curated Collections Studio"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Target Link URL
            </label>
            <input
              type="text"
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
              disabled={!canEdit}
              placeholder="e.g. https://layerat.com/explore"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ACCESS GATES, MAINTENANCE & CURATED COLLECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Gates & Controls */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Registration & Feature Flags
          </h3>

          <div className="space-y-3">
            {/* Allow Signups Toggle */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 cursor-pointer">
              <input
                type="checkbox"
                checked={allowSignups}
                onChange={(e) => setAllowSignups(e.target.checked)}
                disabled={!canEdit}
                className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
              />
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Allow Public Creator Registrations
                </div>
                <div className="text-[11px] text-neutral-500">
                  When enabled, visitors can sign up as new creators. Uncheck to freeze all new user registrations.
                </div>
              </div>
            </label>

            {/* Enable Collections Flag */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 cursor-pointer">
              <input
                type="checkbox"
                checked={enableCollections}
                onChange={(e) => setEnableCollections(e.target.checked)}
                disabled={!canEdit}
                className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
              />
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Enable Curated Collections Studio
                </div>
                <div className="text-[11px] text-neutral-500">
                  Allows editorial staff to assemble and display multi-project anthologies on the homepage.
                </div>
              </div>
            </label>

            {/* Upload Limit Slider */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100" />
                  Maximum Upload Size per Media Asset
                </span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100 font-extrabold">
                  {maxUploadSizeMb} MB
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={maxUploadSizeMb}
                onChange={(e) => setMaxUploadSizeMb(Number(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>5 MB</span>
                <span>25 MB (Recommended)</span>
                <span>100 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Maintenance Mode */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              Emergency Maintenance Gate
            </h3>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">Maintenance Active</span>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                disabled={!canEdit}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
              />
            </label>
          </div>

          <p className="text-xs text-neutral-500">
            When activated, all public routes show an emergency holding screen with your custom maintenance message. Super Admins retain full console access.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Custom Maintenance Message
            </label>
            <textarea
              rows={3}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              disabled={!canEdit}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {maintenanceMode && (
            <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-3 text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Public access is currently suspended. Visitors see this holding message.</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: DATA BACKUPS & QUERY CACHE ENGINE */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
          Data Backups & In-Memory Cache Purge
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleExportJSON("projects")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="text-left">
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Export Monographs</div>
              <div className="text-[10px] text-neutral-400 font-mono">{projects.length} rows (JSON)</div>
            </div>
            <Download className="h-4 w-4 text-neutral-400" />
          </button>

          <button
            type="button"
            onClick={() => handleExportJSON("creators")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="text-left">
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Export Creators</div>
              <div className="text-[10px] text-neutral-400 font-mono">{creators.length} profiles (JSON)</div>
            </div>
            <Download className="h-4 w-4 text-neutral-400" />
          </button>

          <button
            type="button"
            onClick={() => handleExportJSON("full")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="text-left">
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Full DB Backup</div>
              <div className="text-[10px] text-neutral-400 font-mono">Master Snapshot</div>
            </div>
            <Download className="h-4 w-4 text-neutral-400" />
          </button>

          <button
            type="button"
            onClick={handlePurgeCache}
            disabled={isPurgingCache}
            className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <div className="text-left">
              <div className="font-bold text-neutral-900 dark:text-neutral-100">
                {cachePurgedSuccess ? "Cache Purged!" : "Purge Query Cache"}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">Invalidate & Reload</div>
            </div>
            <RefreshCw className={cn("h-4 w-4 text-neutral-400", isPurgingCache && "animate-spin text-neutral-900 dark:text-white")} />
          </button>
        </div>
      </div>
    </form>
  );
}
