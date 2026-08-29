"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectTable } from "@/components/dashboard/project-table";
import { ProjectKanban } from "@/components/dashboard/project-kanban";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import {
  FolderKanban,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardProjectsPage() {
  const { projects } = useSession();

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMedium, setSelectedMedium] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft" | "featured">("all");

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSummary = p.summary?.toLowerCase().includes(q);
        const matchSlug = p.slug.toLowerCase().includes(q);
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchSlug && !matchTags) return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (p.category !== selectedCategory) return false;
      }

      // Medium filter
      if (selectedMedium !== "all") {
        if (p.medium !== selectedMedium) return false;
      }

      // Status filter
      if (selectedStatus === "published" && p.published === false) return false;
      if (selectedStatus === "draft" && p.published !== false) return false;
      if (selectedStatus === "featured" && !p.featured) return false;

      return true;
    });
  }, [projects, searchQuery, selectedCategory, selectedMedium, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-neutral)]/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl font-bold tracking-tight text-[var(--content-primary)]"
              )}
            >
              Projects & Case Studies
            </h1>
            <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-xs font-mono font-bold">
              {filteredProjects.length} / {projects.length}
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-1">
            Manage your design monographs, continuous galleries, draft status, and editorial spotlights.
          </p>
        </div>

        {/* View Switcher & Create CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Table / Kanban Toggle */}
          <div className="flex items-center gap-1 rounded-full bg-[var(--bg-neutral)] p-1 border border-[var(--border-neutral)]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              )}
              title="Table view"
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "kanban"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              )}
              title="Kanban view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* New Project Link */}
          <Link
            href="/me/projects/new"
            className="flex items-center gap-1.5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Case Study</span>
          </Link>
        </div>
      </div>

      {/* Multi-facet Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, tags, slug..."
            className="w-full rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] pl-9 pr-8 py-1.5 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown (13 Disciplines) */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-semibold text-[var(--content-primary)] focus:outline-none"
          >
            <option value="all">All Disciplines (13)</option>
            {MASTER_TAXONOMY.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Medium Dropdown */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedMedium}
            onChange={(e) => setSelectedMedium(e.target.value)}
            className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-semibold text-[var(--content-primary)] focus:outline-none"
          >
            <option value="all">All Mediums</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="3D">3D</option>
            <option value="Prototype">Prototype</option>
            <option value="PDF/Case study">PDF/Case study</option>
          </select>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1 bg-[var(--bg-neutral)] p-1 rounded-full border border-[var(--border-neutral)]">
          {(
            [
              { id: "all", label: "All" },
              { id: "published", label: "Live" },
              { id: "draft", label: "Drafts" },
              { id: "featured", label: "Featured" },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStatus(st.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                selectedStatus === st.id
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Renderer: Table vs Kanban */}
      {viewMode === "table" ? (
        <ProjectTable projects={filteredProjects} />
      ) : (
        <ProjectKanban projects={filteredProjects} />
      )}
    </div>
  );
}
