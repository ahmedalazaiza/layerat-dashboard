"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CommentModerationList } from "@/components/dashboard/comment-moderation-list";
import { MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardCommentsPage() {
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
              Critiques & Discussions Moderation
            </h1>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Review community feedback, pin standout design critiques, and moderate discussions across all case studies.
          </p>
        </div>
      </div>

      {/* Moderation Stream List */}
      <CommentModerationList projects={projects} />
    </div>
  );
}
