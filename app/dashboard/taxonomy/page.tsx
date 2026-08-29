"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { TaxonomyManager } from "@/components/dashboard/taxonomy-manager";
import { Tags, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardTaxonomyPage() {
  const { projects } = useSession();

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
              Master Taxonomy & Design Disciplines
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              13 Master Disciplines
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Browse and manage Layerat&apos;s 13 creative domains, sub-specializations, methodology tags, and software tool stacks.
          </p>
        </div>
      </div>

      {/* Main Taxonomy Explorer */}
      <TaxonomyManager projects={projects} />
    </div>
  );
}
