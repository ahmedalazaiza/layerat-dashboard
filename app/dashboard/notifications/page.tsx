"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { BroadcastComposer } from "@/components/dashboard/broadcast-composer";
import { Bell, Radio, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardNotificationsPage() {
  const { notifications, projects } = useSession();

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
              Announcements & Broadcasts Center
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              Dispatch Desk
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Dispatch platform announcements, editorial release pulses, and manage real-time creator notification streams.
          </p>
        </div>
      </div>

      {/* Broadcast Center Component */}
      <BroadcastComposer notifications={notifications} projects={projects} />
    </div>
  );
}
