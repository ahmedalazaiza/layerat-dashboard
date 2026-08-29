"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { MASTER_TAXONOMY, CategoryTaxonomyItem } from "@/lib/taxonomy";
import {
  Tags,
  Wrench,
  Layers,
  Search,
  Plus,
  ExternalLink,
  ChevronRight,
  FolderKanban,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxonomyManagerProps {
  projects: Project[];
}

export function TaxonomyManager({ projects }: TaxonomyManagerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(MASTER_TAXONOMY[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  // Map category project counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || "UI";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [projects]);

  const filteredTaxonomy = useMemo(() => {
    if (!searchQuery.trim()) return MASTER_TAXONOMY;
    const q = searchQuery.toLowerCase();
    return MASTER_TAXONOMY.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.subCategories.some((s) => s.toLowerCase().includes(q)) ||
        cat.tags.some((t) => t.toLowerCase().includes(q)) ||
        cat.tools.some((tl) => tl.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeCategory = useMemo(() => {
    return (
      filteredTaxonomy.find((c) => c.id === selectedCategoryId) ||
      filteredTaxonomy[0] ||
      MASTER_TAXONOMY[0]
    );
  }, [filteredTaxonomy, selectedCategoryId]);

  const activeCategoryProjects = useMemo(() => {
    return projects.filter((p) => p.category === activeCategory.name);
  }, [projects, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 13 disciplines, sub-categories, tags, and tools..."
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
        <div className="text-xs font-mono text-[var(--content-tertiary)] px-2">
          {filteredTaxonomy.length} / 13 Disciplines
        </div>
      </div>

      {/* 2-Column Taxonomy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 13 Master Disciplines Navigation List (Span 4) */}
        <div className="lg:col-span-4 rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-xs space-y-1 max-h-[700px] overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold border-b border-[var(--border-neutral)]/60 mb-1">
            Master Disciplines
          </div>

          {filteredTaxonomy.map((cat) => {
            const count = categoryCounts[cat.name] || 0;
            const isSelected = activeCategory.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2.5 rounded-[14px] px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">{cat.name}</div>
                  <div className="text-[10px] text-[var(--content-tertiary)] truncate">
                    {cat.subCategories.length} Sub-categories
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-[var(--primary-forest-green)]"
                        : "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] border border-[var(--border-neutral)]"
                    )}
                  >
                    {count}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep Taxonomy Specification & Tools Inspector (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Discipline Card Banner */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent)] text-black px-2.5 py-0.5 text-[10px] font-mono font-bold">
                    {activeCategory.shortName}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--content-primary)]">
                    {activeCategory.name}
                  </h2>
                </div>
                <p className="mt-2 text-xs text-[var(--content-secondary)] leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>

              <span className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-mono font-bold text-[var(--content-primary)] shrink-0">
                {activeCategoryProjects.length} Projects Live
              </span>
            </div>

            {/* Sub-Categories Grid */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-neutral)]/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-[var(--accent)]" />
                <span>Specialized Sub-Categories ({activeCategory.subCategories.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategory.subCategories.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-[10px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-semibold text-[var(--content-primary)]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Methodology Tags Grid */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-neutral)]/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold flex items-center gap-1.5">
                <Tags className="h-3 w-3 text-[var(--accent)]" />
                <span>Curated Methodology Tags ({activeCategory.tags.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCategory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[11px] text-[var(--content-secondary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Design Tools & Software Ecosystem */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-neutral)]/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold flex items-center gap-1.5">
                <Wrench className="h-3 w-3 text-[var(--accent)]" />
                <span>Software Tools & Workflow Stack ({activeCategory.tools.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategory.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-[10px] bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 py-1 text-xs font-bold shadow-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Monographs under this discipline */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Published Monographs in {activeCategory.shortName} ({activeCategoryProjects.length})
                </h3>
              </div>
              <Link
                href={`/explore?category=${encodeURIComponent(activeCategory.name)}`}
                target="_blank"
                className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1 transition-colors"
              >
                <span>View on Explore</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {activeCategoryProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--content-tertiary)]">
                No monographs published under this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCategoryProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/project/${p.slug}`}
                    target="_blank"
                    className="group flex items-center gap-3 rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-2.5 transition-all hover:border-[var(--content-primary)]"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-neutral)]">
                      <img
                        src={p.coverImage || "/placeholder.jpg"}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[var(--content-primary)] truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-[var(--content-tertiary)] truncate">
                        By {p.creator?.displayName || "Studio"} • {p.appreciations || 0} Likes
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
