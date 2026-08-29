"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { MediaGrid } from "@/components/dashboard/media-grid";
import { Image as ImageIcon, Database, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardMediaPage() {
  const { projects, creators } = useSession();

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
              Media & Storage Vault
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              Supabase Storage
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Central repository for high-resolution project cover images, 2px continuous gallery stacks, and studio avatar assets.
          </p>
        </div>
      </div>

      {/* Media Explorer Grid */}
      <MediaGrid projects={projects} creators={creators} />
    </div>
  );
}
