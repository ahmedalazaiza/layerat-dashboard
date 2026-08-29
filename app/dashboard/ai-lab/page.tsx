"use client";

import React from "react";
import { bricolage } from "@/lib/fonts";
import { AILabTester } from "@/components/dashboard/ai-lab-tester";
import { Sparkles, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardAILabPage() {
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
              AI Creative Director Studio & Lab
            </h1>
            <span className="rounded-full bg-[var(--accent)] text-black px-2.5 py-0.5 text-xs font-mono font-bold">
              Gemini Vision Powered
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Multimodal visual intelligence engine for automated design taxonomy classification, title crafting, and editorial case study generation.
          </p>
        </div>
      </div>

      {/* AI Tester Workbench */}
      <AILabTester />
    </div>
  );
}
