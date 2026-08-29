"use client";

import React from "react";
import { bricolage } from "@/lib/fonts";
import { PlatformSettingsView } from "@/components/dashboard/platform-settings-view";
import { Settings, Database, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardSettingsPage() {
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
              Platform Settings & System Backup
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              System Control
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Configure platform branding, database caching, theme defaults, and execute 1-click structured data backups.
          </p>
        </div>
      </div>

      {/* Settings View Component */}
      <PlatformSettingsView />
    </div>
  );
}
