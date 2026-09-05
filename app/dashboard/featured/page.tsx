"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { canMutateModule } from "@/lib/roles";
import { Project, ProjectBadge } from "@/lib/types";
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Search,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Award,
  Filter,
  AlertTriangle,
  FolderKanban,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE_OPTIONS: { id: ProjectBadge; label: string; color: string }[] = [
  { id: "Staff Pick", label: "Staff Pick", color: "bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white" },
  { id: "Project of the Day", label: "Project of the Day", color: "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-neutral-700 dark:border-neutral-300" },
  { id: "Best of Month", label: "Best of Month", color: "bg-neutral-700 text-white dark:bg-neutral-300 dark:text-black border-neutral-600 dark:border-neutral-400" },
  { id: null, label: "No Badge", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700" },
];

export default function FeaturedShowcasePage() {
  const {
    projects,
    updateFeaturedOrder,
    setProjectBadge,
    toggleProjectPublish,
    activeRole,
  } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const canEdit = canMutateModule(activeRole, "featured");

  // Sorted list of currently featured projects (1, 2, 3...)
  const featuredQueue = useMemo(() => {
    return projects
      .filter((p) => p.featured || (p.featuredOrder !== null && p.featuredOrder !== undefined))
      .sort((a, b) => ((a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)));
  }, [projects]);

  // Catalog projects available to be added to the featured showcase
  const availableCatalog = useMemo(() => {
    const featuredIds = new Set(featuredQueue.map((p) => p.id));
    return projects
      .filter((p) => !featuredIds.has(p.id))
      .filter((p) => {
        if (selectedDiscipline !== "all" && p.category !== selectedDiscipline) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCreator = p.creator?.displayName?.toLowerCase().includes(q);
          const matchSlug = p.slug.toLowerCase().includes(q);
          return matchTitle || matchCreator || matchSlug;
        }
        return true;
      });
  }, [projects, featuredQueue, selectedDiscipline, searchQuery]);

  // Unique disciplines for filter
  const disciplines = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const handleMoveUp = async (index: number) => {
    if (!canEdit || index <= 0) return;
    const current = featuredQueue[index];
    const prev = featuredQueue[index - 1];

    await updateFeaturedOrder(current.id, index);
    await updateFeaturedOrder(prev.id, index + 1);
  };

  const handleMoveDown = async (index: number) => {
    if (!canEdit || index >= featuredQueue.length - 1) return;
    const current = featuredQueue[index];
    const next = featuredQueue[index + 1];

    await updateFeaturedOrder(current.id, index + 2);
    await updateFeaturedOrder(next.id, index + 1);
  };

  const handleRemoveFromFeatured = async (projectId: string) => {
    if (!canEdit) return;
    await updateFeaturedOrder(projectId, null);
  };

  const handleAddToFeatured = async (projectId: string) => {
    if (!canEdit) return;
    const nextOrder = featuredQueue.length + 1;
    await updateFeaturedOrder(projectId, nextOrder);
  };

  return (
    <div className="space-y-8">
      {/* Read-Only Warning if Moderator / Member */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Read-Only Mode:</span> Modifying the Featured Showcase requires <strong className="font-mono uppercase font-bold">Curator</strong> or <strong className="font-mono uppercase font-bold">Admin</strong> privileges. Your active persona is <span className="uppercase font-mono font-bold underline">{activeRole}</span>.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
              )}
            >
              Editorial & Featured Showcase
            </h1>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-mono font-bold">
              Module 3
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Curate the official Layerat homepage marquee, set priority ordering (1, 2, 3), and designate editorial badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
            Featured Queue: <span className="text-neutral-900 dark:text-neutral-100 font-bold">{featuredQueue.length}</span> Monographs
          </div>
        </div>
      </div>

      {/* SECTION 1: HOMEPAGE FEATURED QUEUE (ORDERED) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Homepage Marquee Queue
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Reorder determines public homepage sequence
          </span>
        </div>

        {featuredQueue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
            <Sparkles className="h-8 w-8 mx-auto text-neutral-400" />
            <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              No Monographs Currently Featured
            </div>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Select monographs from the catalog below to position them in the prime homepage curation carousel.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredQueue.map((project, idx) => {
              const currentBadge = project.badge || "None";

              return (
                <div
                  key={project.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
                >
                  {/* Position Pill & Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      #{idx + 1}
                    </div>

                    <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800">
                      <Image
                        src={project.coverImage || "/placeholder.jpg"}
                        alt={project.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:text-black dark:hover:text-white truncate flex items-center gap-1"
                        >
                          <span>{project.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-neutral-400" />
                        </Link>
                        {!project.published && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold uppercase">
                            Unpublished
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate flex items-center gap-2 mt-0.5">
                        <span>by {project.creator?.displayName || "Studio"}</span>
                        <span>•</span>
                        <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">{project.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Badge Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-neutral-400 hidden lg:inline">Badge:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {BADGE_OPTIONS.map((b) => {
                        const isSelected = project.badge ? project.badge === b.id : b.id === null;
                        return (
                          <button
                            key={b.label}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => setProjectBadge(project.id, b.id)}
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all cursor-pointer",
                              isSelected
                                ? `${b.color} font-bold ring-1 ring-neutral-900 dark:ring-white`
                                : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordering & Remove Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      disabled={!canEdit || idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit || idx === featuredQueue.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleRemoveFromFeatured(project.id)}
                      className="h-8 w-8 rounded-lg border border-red-500/20 text-red-600 hover:bg-red-500/10 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer ml-1"
                      title="Remove from Featured"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: CATALOG SEARCH & QUICK FEATURE */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              General Catalog Search & Quick Feature
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Browse any monograph to promote to homepage or modify public publish status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search monographs..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 w-48 sm:w-64 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>

            {/* Discipline Dropdown */}
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 font-mono"
            >
              <option value="all">All Disciplines</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-2.5 px-3">Monograph</th>
                <th className="py-2.5 px-3">Discipline</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {availableCatalog.slice(0, 15).map((project) => (
                <tr key={project.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  {/* Monograph title & creator */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-12 rounded bg-neutral-200 dark:bg-neutral-800 shrink-0 overflow-hidden">
                        <Image
                          src={project.coverImage || "/placeholder.jpg"}
                          alt={project.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline truncate block max-w-xs"
                        >
                          {project.title}
                        </Link>
                        <div className="text-[11px] text-neutral-400 truncate">
                          by {project.creator?.displayName || "Studio"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Discipline */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                    {project.category}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => toggleProjectPublish(project.id, !project.published)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer",
                        project.published
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                          : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                      )}
                      title={project.published ? "Click to unpublish" : "Click to publish"}
                    >
                      {project.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      <span>{project.published ? "Live" : "Draft"}</span>
                    </button>
                  </td>

                  {/* Quick Feature Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleAddToFeatured(project.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold text-xs active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Feature</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {availableCatalog.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching monographs found in catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
