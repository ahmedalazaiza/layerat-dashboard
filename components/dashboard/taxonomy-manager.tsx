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
  AlertTriangle,
  FileCode,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxonomyManagerProps {
  projects: Project[];
}

export function TaxonomyManager({ projects }: TaxonomyManagerProps) {
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

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || "UI";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [projects]);

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

  const handleDeleteSubCategory = (sub: string) => {
    if (!activeCategory) return;
    const updated = taxonomyList.map((cat) => {
      if (cat.id === activeCategory.id) {
        return {
          ...cat,
          subCategories: cat.subCategories.filter((s) => s !== sub),
        };
      }
      return cat;
    });
    saveToStorage(updated);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !activeCategory) return;
    const val = newTagInput.trim().replace(/^#/, "");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Master Taxonomy & Disciplines Manager
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                {taxonomyList.length} Disciplines
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Full CRUD management: add, modify, delete disciplines, sub-categories, tags, and tools.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Reset to 13 default master disciplines"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Export full taxonomy JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Add Discipline</span>
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex items-center gap-3 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines, sub-categories, tags, or tools..."
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
        <div className="text-xs font-mono text-neutral-400 px-2">
          {filteredTaxonomy.length} Disciplines Listed
        </div>
      </div>

      {/* 2-Column Taxonomy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Master Disciplines List (Span 4) */}
        <div className="lg:col-span-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shadow-xs space-y-1 max-h-[760px] overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 dark:border-neutral-900 mb-1">
            <span>Disciplines Directory</span>
            <span>{taxonomyList.length} Total</span>
          </div>

          {filteredTaxonomy.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
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
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{cat.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {cat.subCategories.length} Sub-categories • {cat.tools.length} Tools
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                        isSelected
                          ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                      )}
                    >
                      {count}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Active Discipline Inspector & Editor (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCategory && (
            <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-6">
              {/* Discipline Identity Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-neutral-900 dark:text-neutral-100">
                      {activeCategory.shortName}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {activeCategory.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
                    {activeCategory.description}
                  </p>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Discipline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Sub-Categories CRUD Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                      Sub-Categories ({activeCategory.subCategories.length})
                    </h4>
                  </div>
                </div>

                {/* Inline Add Input */}
                <form onSubmit={handleAddSubCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newSubCategoryInput}
                    onChange={(e) => setNewSubCategoryInput(e.target.value)}
                    placeholder="Add new sub-category (e.g. Dynamic Island UX)..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {activeCategory.subCategories.map((sub) => (
                    <span
                      key={sub}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubCategory(sub)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags & Methodologies Section */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    Methodology & Concept Tags ({activeCategory.tags.length})
                  </h4>
                </div>

                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add new tag (e.g. DesignTokens)..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeCategory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Software & Tools Section */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    Software & Design Tooling ({activeCategory.tools.length})
                  </h4>
                </div>

                <form onSubmit={handleAddTool} className="flex gap-2">
                  <input
                    type="text"
                    value={newToolInput}
                    onChange={(e) => setNewToolInput(e.target.value)}
                    placeholder="Add tool (e.g. Figma, Blender 4.2, Unreal Engine 5)..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    + Add Tool
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {activeCategory.tools.map((tool) => (
                    <span
                      key={tool}
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1 text-xs font-bold text-neutral-900 dark:text-neutral-100"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTool(tool)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Discipline */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Add New Creative Discipline
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscipline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Full Discipline Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Spatial & XR Computing"
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Short Display Code *
                </label>
                <input
                  type="text"
                  required
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  placeholder="e.g. SPATIAL"
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the aesthetic and technical boundaries..."
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Discipline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Discipline */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Edit Discipline Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDiscipline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Full Discipline Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Short Display Code
                </label>
                <input
                  type="text"
                  required
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Delete Discipline?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-neutral-900 dark:text-neutral-100">{activeCategory.name}</span>? This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDiscipline}
                className="rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer"
              >
                Delete Discipline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
