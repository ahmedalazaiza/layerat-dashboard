"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxonomyManagerProps {
  projects: Project[];
}

export function TaxonomyManager({ projects }: TaxonomyManagerProps) {
  // Master state with localStorage persistence
  const [taxonomyList, setTaxonomyList] = useState<CategoryTaxonomyItem[]>(MASTER_TAXONOMY);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(MASTER_TAXONOMY[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Modals & Edit States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states for creating/editing a discipline
  const [formName, setFormName] = useState("");
  const [formShortName, setFormShortName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Inline input states for adding items to the active discipline
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newToolInput, setNewToolInput] = useState("");

  // Load custom taxonomy from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("layerat_custom_taxonomy");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTaxonomyList(parsed);
          setSelectedCategoryId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load taxonomy from localStorage:", e);
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (updated: CategoryTaxonomyItem[]) => {
    setTaxonomyList(updated);
    try {
      localStorage.setItem("layerat_custom_taxonomy", JSON.stringify(updated));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save taxonomy:", e);
    }
  };

  // Map category project counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || "UI";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [projects]);

  // Filtered categories
  const filteredTaxonomy = useMemo(() => {
    if (!searchQuery.trim()) return taxonomyList;
    const q = searchQuery.toLowerCase();
    return taxonomyList.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.shortName.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.subCategories.some((s) => s.toLowerCase().includes(q)) ||
        cat.tags.some((t) => t.toLowerCase().includes(q)) ||
        cat.tools.some((tl) => tl.toLowerCase().includes(q))
    );
  }, [searchQuery, taxonomyList]);

  // Active Category Item
  const activeCategory = useMemo(() => {
    return (
      taxonomyList.find((c) => c.id === selectedCategoryId) ||
      taxonomyList[0] ||
      MASTER_TAXONOMY[0]
    );
  }, [taxonomyList, selectedCategoryId]);

  const activeCategoryProjects = useMemo(() => {
    return projects.filter(
      (p) => p.category === activeCategory.name || p.category === activeCategory.shortName
    );
  }, [projects, activeCategory]);

  // ==========================================
  // DISCIPLINE CRUD HANDLERS
  // ==========================================
  const handleOpenCreateModal = () => {
    setFormName("");
    setFormShortName("");
    setFormDescription("");
    setIsCreateModalOpen(true);
  };

  const handleCreateDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newId = formShortName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") || `disc-${Date.now()}`;
    const newDiscipline: CategoryTaxonomyItem = {
      id: newId,
      name: formName.trim(),
      shortName: formShortName.trim() || formName.trim(),
      description: formDescription.trim() || "Bespoke creative discipline.",
      subCategories: [],
      tags: [],
      tools: [],
    };

    const updated = [...taxonomyList, newDiscipline];
    saveToStorage(updated);
    setSelectedCategoryId(newId);
    setIsCreateModalOpen(false);
  };

  const handleOpenEditModal = () => {
    if (!activeCategory) return;
    setFormName(activeCategory.name);
    setFormShortName(activeCategory.shortName);
    setFormDescription(activeCategory.description);
    setIsEditModalOpen(true);
  };

  const handleUpdateDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !activeCategory) return;

    const updated = taxonomyList.map((item) => {
      if (item.id === activeCategory.id) {
        return {
          ...item,
          name: formName.trim(),
          shortName: formShortName.trim() || formName.trim(),
          description: formDescription.trim(),
        };
      }
      return item;
    });

    saveToStorage(updated);
    setIsEditModalOpen(false);
  };

  const handleDeleteDiscipline = () => {
    if (!activeCategory) return;
    const updated = taxonomyList.filter((item) => item.id !== activeCategory.id);
    if (updated.length > 0) {
      setSelectedCategoryId(updated[0].id);
    }
    saveToStorage(updated);
    setIsDeleteConfirmOpen(false);
  };

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset all taxonomy to platform defaults (13 Master Disciplines)?")) {
      saveToStorage(MASTER_TAXONOMY);
      setSelectedCategoryId(MASTER_TAXONOMY[0].id);
    }
  };

  // ==========================================
  // SUB-CATEGORY CRUD
  // ==========================================
  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategoryInput.trim() || !activeCategory) return;
    const val = newSubCategoryInput.trim();
    if (activeCategory.subCategories.includes(val)) return;

    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          subCategories: [...cat.subCategories, val],
        };
      }
      return cat;
    });

    saveToStorage(updated);
    setNewSubCategoryInput("");
  };

  const handleDeleteSubCategory = (subCat: string) => {
    if (!activeCategory) return;
    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          subCategories: cat.subCategories.filter((s) => s !== subCat),
        };
      }
      return cat;
    });
    saveToStorage(updated);
  };

  // ==========================================
  // TAGS CRUD
  // ==========================================
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !activeCategory) return;
    const val = newTagInput.trim();
    if (activeCategory.tags.includes(val)) return;

    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          tags: [...cat.tags, val],
        };
      }
      return cat;
    });

    saveToStorage(updated);
    setNewTagInput("");
  };

  const handleDeleteTag = (tag: string) => {
    if (!activeCategory) return;
    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          tags: cat.tags.filter((t) => t !== tag),
        };
      }
      return cat;
    });
    saveToStorage(updated);
  };

  // ==========================================
  // TOOLS CRUD
  // ==========================================
  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolInput.trim() || !activeCategory) return;
    const val = newToolInput.trim();
    if (activeCategory.tools.includes(val)) return;

    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          tools: [...cat.tools, val],
        };
      }
      return cat;
    });

    saveToStorage(updated);
    setNewToolInput("");
  };

  const handleDeleteTool = (tool: string) => {
    if (!activeCategory) return;
    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          tools: cat.tools.filter((tl) => tl !== tool),
        };
      }
      return cat;
    });
    saveToStorage(updated);
  };

  // ==========================================
  // JSON EXPORT
  // ==========================================
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(taxonomyList, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `layerat-taxonomy-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Action Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--content-primary)]">
                Master Taxonomy & Disciplines Manager
              </h2>
              <span className="rounded bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                {taxonomyList.length} Disciplines
              </span>
            </div>
            <p className="text-xs text-[var(--content-secondary)]">
              Full CRUD management: add, modify, delete disciplines, sub-categories, tags, and tools.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
            title="Reset to 13 default master disciplines"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
            title="Export full taxonomy JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-4 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Add Discipline</span>
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines, sub-categories, tags, or tools..."
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
          {filteredTaxonomy.length} Disciplines Listed
        </div>
      </div>

      {/* 2-Column Taxonomy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Master Disciplines List (Span 4) */}
        <div className="lg:col-span-4 rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-xs space-y-1 max-h-[760px] overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold border-b border-[var(--border-neutral)]/60 mb-1">
            <span>Disciplines Directory</span>
            <span>{taxonomyList.length} Total</span>
          </div>

          {filteredTaxonomy.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--content-tertiary)]">
              No disciplines match your search.
            </div>
          ) : (
            filteredTaxonomy.map((cat) => {
              const count = categoryCounts[cat.name] || categoryCounts[cat.shortName] || 0;
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
                    <div className="truncate font-bold">{cat.name}</div>
                    <div className="text-[10px] text-[var(--content-tertiary)] truncate">
                      {cat.subCategories.length} Sub-categories • {cat.tools.length} Tools
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                        isSelected
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                          : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] border border-[var(--border-neutral)]"
                      )}
                    >
                      {count}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Active Discipline Deep Inspector & Item CRUD (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCategory && (
            <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-xs space-y-6">
              {/* Discipline Header & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-neutral)]/60 pb-6">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-[10px] font-mono font-bold">
                      {activeCategory.shortName}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
                      ID: {activeCategory.id}
                    </span>
                    {isSaved && (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Saved</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--content-primary)] tracking-tight">
                    {activeCategory.name}
                  </h3>
                  <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                    {activeCategory.description}
                  </p>
                </div>

                {/* Edit & Delete Discipline Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Discipline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete discipline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* 1. Sub-Categories Section with Add & Delete */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-[var(--accent)]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                      Sub-Categories ({activeCategory.subCategories.length})
                    </h4>
                  </div>
                </div>

                {/* Add Sub-category inline form */}
                <form onSubmit={handleAddSubCategory} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubCategoryInput}
                    onChange={(e) => setNewSubCategoryInput(e.target.value)}
                    placeholder="Add sub-category (e.g. Mobile App Design, SaaS)..."
                    className="flex-1 rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-1.5 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-[12px] bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Subcategories Pills Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeCategory.subCategories.length === 0 ? (
                    <span className="text-xs text-[var(--content-tertiary)] italic">No sub-categories added yet.</span>
                  ) : (
                    activeCategory.subCategories.map((sub) => (
                      <div
                        key={sub}
                        className="group/pill inline-flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] pl-3 pr-2 py-1 text-xs font-semibold text-[var(--content-primary)] hover:border-[var(--content-secondary)] transition-colors"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubCategory(sub)}
                          className="h-4 w-4 rounded-full flex items-center justify-center text-[var(--content-tertiary)] hover:text-red-500 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                          title={`Delete ${sub}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Methodology & Design Tags Section with Add & Delete */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-neutral)]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 text-[var(--accent)]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                      Methodology & Concept Tags ({activeCategory.tags.length})
                    </h4>
                  </div>
                </div>

                {/* Add Tag inline form */}
                <form onSubmit={handleAddTag} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag (e.g. Design Tokens, Auto-layout, Typography)..."
                    className="flex-1 rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-1.5 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-[12px] bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Tags Grid */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeCategory.tags.length === 0 ? (
                    <span className="text-xs text-[var(--content-tertiary)] italic">No tags added yet.</span>
                  ) : (
                    activeCategory.tags.map((tag) => (
                      <div
                        key={tag}
                        className="group/tag inline-flex items-center gap-1 rounded-md bg-[var(--bg-neutral)] border border-[var(--border-neutral)] pl-2.5 pr-1.5 py-0.5 text-[11px] font-mono text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag)}
                          className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[var(--content-tertiary)] hover:text-red-500 cursor-pointer"
                          title={`Delete tag #${tag}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Software & Tool Suites Section with Add & Delete */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-neutral)]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[var(--accent)]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                      Software & Design Tools ({activeCategory.tools.length})
                    </h4>
                  </div>
                </div>

                {/* Add Tool inline form */}
                <form onSubmit={handleAddTool} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newToolInput}
                    onChange={(e) => setNewToolInput(e.target.value)}
                    placeholder="Add tool (e.g. Figma, Blender, Cinema 4D, Framer)..."
                    className="flex-1 rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-1.5 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-[12px] bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Tools Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeCategory.tools.length === 0 ? (
                    <span className="text-xs text-[var(--content-tertiary)] italic">No tools added yet.</span>
                  ) : (
                    activeCategory.tools.map((tool) => (
                      <div
                        key={tool}
                        className="group/tool inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-neutral)] pl-2.5 pr-1.5 py-1 text-xs font-bold text-[var(--content-primary)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Wrench className="h-3 w-3 text-[var(--content-tertiary)]" />
                        <span>{tool}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTool(tool)}
                          className="h-4 w-4 rounded-full flex items-center justify-center text-[var(--content-tertiary)] hover:text-red-500 cursor-pointer"
                          title={`Delete tool ${tool}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Published Projects Under This Discipline */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-neutral)]/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--content-primary)]">
                    Live Published Monographs under this discipline:
                  </span>
                  <Link
                    href={`/explore?category=${encodeURIComponent(activeCategory.name)}`}
                    target="_blank"
                    className="text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1"
                  >
                    <span>View on Platform</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--content-tertiary)] font-mono">
                  <span>{activeCategoryProjects.length} monographs currently cataloged</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE DISCIPLINE */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--content-primary)]">
                  Add New Creative Discipline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscipline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Discipline Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Spatial & Spatial Audio Design"
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-bold text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Short Display Code / Acronym *
                </label>
                <input
                  type="text"
                  required
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  placeholder="e.g. SPATIAL"
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-mono font-bold text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of creative deliverables and aesthetic standards..."
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-neutral)]/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-5 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Discipline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DISCIPLINE */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--content-primary)]">
                  Edit Creative Discipline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDiscipline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Discipline Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-bold text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Short Display Code / Acronym *
                </label>
                <input
                  type="text"
                  required
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-mono font-bold text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-neutral)]/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black px-5 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Discipline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE DISCIPLINE CONFIRMATION */}
      {/* ========================================================================= */}
      {isDeleteConfirmOpen && activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--content-primary)]">
                  Delete Discipline?
                </h3>
                <div className="text-xs text-[var(--content-secondary)]">
                  Are you sure you want to remove &quot;{activeCategory.name}&quot;?
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--content-tertiary)] leading-relaxed">
              This action will remove this discipline, its {activeCategory.subCategories.length} sub-categories, {activeCategory.tags.length} tags, and {activeCategory.tools.length} tools from the master platform catalog.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-neutral)]/60">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDiscipline}
                className="rounded-full bg-red-600 dark:bg-red-500 text-white px-5 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
