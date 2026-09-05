"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Project, ProjectMedium } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { MASTER_TAXONOMY, getCategoryTaxonomy, normalizeCategory } from "@/lib/taxonomy";
import {
  X,
  Save,
  Sparkles,
  Layers,
  Tag,
  Wrench,
  Star,
  Eye,
  CheckCircle2,
  FileText,
  Trash2,
  Loader2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickEditDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickEditDrawer({ project, isOpen, onClose }: QuickEditDrawerProps) {
  const { saveProject, deleteProject, openReportModal, confirmAction } = useSession();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState(MASTER_TAXONOMY[0].name);
  const [subCategory, setSubCategory] = useState("");
  const [medium, setMedium] = useState<ProjectMedium>("Image");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when project changes
  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setSummary(project.summary || "");
      const normalized = normalizeCategory(project.category);
      setCategory(normalized);
      const tax = getCategoryTaxonomy(normalized);
      setSubCategory(project.subCategory || (tax?.subCategories[0] || ""));
      setMedium(project.medium || "Image");
      setTags(project.tags || []);
      setTools(project.tools || []);
      setPublished(project.published !== false);
      setFeatured(!!project.featured);
      setSavedSuccess(false);
    }
  }, [project]);

  if (!project) return null;

  const currentTaxonomy = getCategoryTaxonomy(category) || MASTER_TAXONOMY[0];

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleAddTool = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool("");
    }
  };

  const handleRemoveTool = (t: string) => {
    setTools(tools.filter((item) => item !== t));
  };

  const handleSave = async () => {
    if (!project) return;
    try {
      setIsSaving(true);
      await saveProject({
        ...project,
        title: title.trim(),
        summary: summary.trim(),
        category,
        subCategory,
        medium,
        tags,
        tools,
        published,
        featured,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error("Failed to quick edit project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges =
    project !== null &&
    (title !== (project.title || "") ||
      summary !== (project.summary || "") ||
      category !== normalizeCategory(project.category) ||
      medium !== (project.medium || "Image") ||
      tags.join(",") !== (project.tags || []).join(",") ||
      tools.join(",") !== (project.tools || []).join(",") ||
      published !== (project.published !== false) ||
      featured !== !!project.featured);

  const handleSafeClose = async () => {
    if (hasUnsavedChanges && !savedSuccess) {
      const ok = await confirmAction({
        title: "Discard Unsaved Changes?",
        description: `You have unsaved edits on "${project.title}". Leaving now will discard all changes.`,
        confirmText: "Discard Changes",
        cancelText: "Keep Editing",
        variant: "warning",
        targetName: project.title,
      });
      if (!ok) return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSafeClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white dark:bg-black border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-900">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Quick Edit Monograph
                    </h3>
                    <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[260px]">
                    /{project.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSafeClose}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Scroll Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Project Cover Preview */}
                <div className="relative aspect-video w-full rounded-[16px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <Image
                    src={project.coverImage || "/placeholder.jpg"}
                    alt={project.title}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {featured && (
                      <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[9px] font-bold flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Staff Pick</span>
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold",
                        published
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                      )}
                    >
                      {published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Monograph Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Editorial Summary
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Taxonomy & Sub-Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Discipline
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const tax = getCategoryTaxonomy(newCat);
                        if (tax?.subCategories.length) {
                          setSubCategory(tax.subCategories[0]);
                        }
                      }}
                      className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
                    >
                      {MASTER_TAXONOMY.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Sub-Category
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
                    >
                      {currentTaxonomy.subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Medium Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Primary Medium
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Image", "Video", "3D", "Prototype", "PDF/Case study"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMedium(m)}
                        className={cn(
                          "rounded-[10px] py-1.5 px-2 text-xs font-semibold border transition-all cursor-pointer truncate text-center",
                          medium === m
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Management */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Tags & Methodologies</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 text-xs text-neutral-900 dark:text-neutral-100"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-neutral-400 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Tools Management */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Tools & Software</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 text-xs text-neutral-900 dark:text-neutral-100"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(t)}
                          className="hover:text-neutral-400 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTool}
                      onChange={(e) => setNewTool(e.target.value)}
                      onKeyDown={handleAddTool}
                      placeholder="Add tool and press Enter..."
                      className="flex-1 rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="rounded-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                  <label className="flex items-center justify-between p-3 rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Feature as Staff Pick
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Highlight on homepage spotlight & explore badges
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Publication State
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Toggle public visibility on live platform
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSafeClose}
                    className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openReportModal(project);
                    }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                    title="Report Project (Safety & Copyright Review)"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-6 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Updated!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Monograph</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
