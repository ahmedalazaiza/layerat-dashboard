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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickEditDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickEditDrawer({ project, isOpen, onClose }: QuickEditDrawerProps) {
  const { saveProject, deleteProject } = useSession();

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
    if (!title.trim()) return;
    try {
      setIsSaving(true);
      await saveProject({
        id: project.id,
        slug: project.slug,
        title: title.trim(),
        summary: summary.trim(),
        category,
        subCategory,
        medium,
        tags,
        tools,
        published,
        featured,
        coverImage: project.coverImage,
        galleryImages: project.galleryImages,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to save project from quick edit drawer:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)] p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-neutral)] text-[var(--content-primary)]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--content-primary)]">
                    Quick Project Editor
                  </h3>
                  <p className="text-[11px] text-[var(--content-tertiary)] font-mono">
                    ID: {project.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cover Preview Thumbnail */}
              <div className="relative h-36 w-full rounded-[16px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)]">
                <Image
                  src={project.coverImage || "/placeholder.jpg"}
                  alt={title}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md",
                      published
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                    )}
                  >
                    {published ? "Live Monograph" : "Draft"}
                  </span>
                  {featured && (
                    <span className="rounded-full bg-[var(--accent)]/90 text-black px-2 py-0.5 text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                  placeholder="Enter project title..."
                />
              </div>

              {/* Summary Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Summary & Narrative Rationale
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                  placeholder="Brief synopsis of this case study..."
                />
              </div>

              {/* Category & Sub-Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                    Master Discipline (13)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      const tax = getCategoryTaxonomy(newCat);
                      setSubCategory(tax?.subCategories[0] || "");
                    }}
                    className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                  >
                    {MASTER_TAXONOMY.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                    Sub-Category / Specialization
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-2 text-xs font-medium text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
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
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
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
                          ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                          : "border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Management */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)] flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Tags & Methodologies</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-xs text-[var(--content-primary)]"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-500 cursor-pointer"
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
                    className="flex-1 rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-[10px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tools Management */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)] flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Tools & Software</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-xs text-[var(--content-primary)]"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(t)}
                        className="hover:text-red-500 cursor-pointer"
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
                    className="flex-1 rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="rounded-[10px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1.5 text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Toggles: Published & Featured */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-neutral)]/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[var(--content-primary)]">
                      Published Status
                    </div>
                    <div className="text-[11px] text-[var(--content-tertiary)]">
                      Make visible to public showcase and search
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPublished(!published)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      published ? "bg-emerald-500" : "bg-[var(--bg-neutral)]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        published ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[var(--content-primary)] flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                      <span>Featured Spotlight</span>
                    </div>
                    <div className="text-[11px] text-[var(--content-tertiary)]">
                      Pin to Staff Picks and homepage hero ribbon
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatured(!featured)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      featured ? "bg-[var(--accent)]" : "bg-[var(--bg-neutral)]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        featured ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || savedSuccess}
                className="flex items-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
