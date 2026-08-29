"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import {
  Trophy,
  Heart,
  MessageSquare,
  ExternalLink,
  Star,
  Eye,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface TopMonographsProps {
  projects: Project[];
}

export function TopMonographs({ projects }: TopMonographsProps) {
  // Sort projects by appreciations descending
  const topProjects = [...projects]
    .sort((a, b) => (b.appreciations || 0) - (a.appreciations || 0))
    .slice(0, 5);

  return (
    <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold text-[var(--content-primary)]">
            Top Performing Monographs
          </h2>
        </div>
        <Link
          href="/dashboard/projects"
          className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1 transition-colors"
        >
          <span>View All Projects</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Projects List */}
      <div className="mt-4 divide-y divide-[var(--border-neutral)]/50">
        {topProjects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--content-tertiary)]">
            No projects available yet.
          </div>
        ) : (
          topProjects.map((project, idx) => (
            <div
              key={project.id}
              className="group flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[var(--bg-neutral)]/40 px-2 rounded-[16px]"
            >
              {/* Left: Rank, Thumbnail, & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-neutral)] font-mono text-xs font-bold text-[var(--content-secondary)]">
                  {idx + 1}
                </span>

                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-neutral)] border border-[var(--border-neutral)]">
                  <Image
                    src={project.coverImage || "/placeholder.jpg"}
                    alt={project.title}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/project/${project.slug}`}
                    className="block truncate text-xs font-bold text-[var(--content-primary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {project.title}
                  </Link>

                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--content-tertiary)]">
                    <span className="truncate">{project.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="relative h-3.5 w-3.5 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={getValidAvatarUrl(project.creator?.avatarUrl)}
                          alt={project.creator?.displayName || "Creator"}
                          fill
                          sizes="14px"
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate">
                        {project.creator?.displayName || "Anonymous"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Metrics & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 text-xs font-mono font-semibold text-[var(--content-secondary)]">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                    <span>{project.appreciations || 0}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                    <span>{project.comments?.length || 0}</span>
                  </div>
                </div>

                <Link
                  href={`/project/${project.slug}`}
                  target="_blank"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                  title="Open live case study"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
