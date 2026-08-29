"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectTable } from "@/components/dashboard/project-table";
import { ProjectKanban } from "@/components/dashboard/project-kanban";
import { QuickEditDrawer } from "@/components/dashboard/quick-edit-drawer";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import { Project } from "@/lib/types";
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
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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

  const newProjectTemplate: Project = {
    id: `proj-new-${Date.now()}`,
    slug: `new-monograph-${Date.now().toString().slice(-4)}`,
    title: "Untitled Digital Monograph",
    summary: "High-density editorial case study and artifact documentation.",
    body: "Comprehensive architectural and interactive design breakdown.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
    galleryImages: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85"],
    creator: {
      id: "00000000-0000-0000-0000-000000000001",
      username: "ahmed_al_azaiza",
      displayName: "Ahmed Al-Azaiza",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      bio: "Super Admin & Creative Director",
      location: "Worldwide",
      city: "Global",
      skills: ["Architecture", "UI/UX"],
      isVerified: true,
      isOnline: true,
      followersCount: 1280,
      isCurrentUser: true,
    },
    tags: ["Editorial", "Spatial", "Interaction"],
    tools: ["Figma", "Next.js", "WebGL"],
    category: MASTER_TAXONOMY[0].name,
    subCategory: MASTER_TAXONOMY[0].subCategories[0],
    medium: "Image",
    published: true,
    publishedAt: "Just now",
    appreciations: 0,
    comments: [],
    featured: false,
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={cn(
              bricolage.className,
              "text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight"
            )}
          >
            Monographs & Content Moderation
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Super Admin master catalog. Total {projects.length} monographs ({filteredProjects.length} matching filters).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* View Switcher: Table vs Kanban */}
          <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
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
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              )}
              title="Kanban view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* New Project Link */}
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Monograph</span>
          </button>
        </div>
      </div>

      {/* Multi-facet Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shadow-2xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, tags, slug..."
            className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-8 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
        >
          <option value="all">All Disciplines (13)</option>
          {MASTER_TAXONOMY.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Medium Dropdown */}
        <select
          value={selectedMedium}
          onChange={(e) => setSelectedMedium(e.target.value)}
          className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
        >
          <option value="all">All Mediums</option>
          <option value="Image">Image</option>
          <option value="Video">Video</option>
          <option value="3D">3D</option>
          <option value="Prototype">Prototype</option>
          <option value="PDF/Case study">Case study</option>
        </select>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
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
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
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

      {/* New Project Creator Drawer */}
      {isCreatingNew && (
        <QuickEditDrawer
          project={newProjectTemplate}
          isOpen={isCreatingNew}
          onClose={() => setIsCreatingNew(false)}
        />
      )}
    </div>
  );
}
