"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import {
  Trophy,
  Heart,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface TopMonographsProps {
  projects: Project[];
}

export function TopMonographs({ projects }: TopMonographsProps) {
  const topProjects = [...projects]
    .sort((a, b) => (b.appreciations || 0) - (a.appreciations || 0))
    .slice(0, 5);

  return (
    <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Top Performing Monographs
          </h2>
        </div>
        <Link
          href="/dashboard/projects"
          className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>View All Projects</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Projects List */}
      <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-900">
        {topProjects.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No projects available yet.
          </div>
        ) : (
          topProjects.map((project, idx) => (
            <div
              key={project.id}
              className="group flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 px-2 rounded-[16px]"
            >
              {/* Left: Rank, Thumbnail, & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {idx + 1}
                </span>

                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
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
                    href="/dashboard/projects"
                    className="block truncate text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:opacity-75 transition-opacity"
                  >
                    {project.title}
                  </Link>

                  <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
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

              {/* Right: Metrics & Badges */}
              <div className="flex items-center gap-3 shrink-0">
                {project.featured && (
                  <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span className="hidden sm:inline">Staff Pick</span>
                  </span>
                )}

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{project.appreciations || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{project.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
