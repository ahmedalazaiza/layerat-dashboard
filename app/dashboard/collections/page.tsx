"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { canMutateModule } from "@/lib/roles";
import { Collection, Project } from "@/lib/types";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  FolderKanban,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionsStudioPage() {
  const {
    collections,
    saveCollection,
    removeCollection,
    projects,
    activeRole,
    confirmAction,
  } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form states for Create/Edit Modal
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formProjectIds, setFormProjectIds] = useState<string[]>([]);
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = canMutateModule(activeRole, "collections");

  // Filter collections
  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [collections, searchQuery]);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormCoverImage(
      projects[0]?.coverImage ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    );
    setFormIsFeatured(false);
    setFormProjectIds([]);
    setPickerSearchQuery("");
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setFormTitle(col.title);
    setFormSlug(col.slug);
    setFormDescription(col.description);
    setFormCoverImage(col.coverImage);
    setFormIsFeatured(col.isFeatured);
    setFormProjectIds(col.projectIds || []);
    setPickerSearchQuery("");
    setIsModalOpen(true);
  };

  const toggleProjectSelection = (projectId: string) => {
    setFormProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !formTitle.trim()) return;

    try {
      setIsSaving(true);
      await saveCollection({
        id: editingCollection ? editingCollection.id : undefined,
        title: formTitle.trim(),
        slug:
          formSlug.trim() ||
          formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        description: formDescription.trim(),
        coverImage: formCoverImage.trim() || (projects[0]?.coverImage ?? ""),
        projectIds: formProjectIds,
        isFeatured: formIsFeatured,
        sortOrder: editingCollection ? editingCollection.sortOrder : collections.length + 1,
      });
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canEdit) return;
    const ok = await confirmAction({
      title: `Delete Collection "${title}"?`,
      description: `Are you sure you want to permanently delete "${title}"? Any monographs within it will remain preserved in the main showcase.`,
      confirmText: "Delete Collection",
      variant: "destructive",
      targetName: title,
      badgeLabel: "Permanent Collection Deletion",
    });
    if (!ok) return;

    await removeCollection(id);
  };

  // Projects available in visual picker
  const filteredPickerProjects = useMemo(() => {
    return projects.filter((p) => {
      if (pickerSearchQuery.trim()) {
        const q = pickerSearchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.creator?.displayName?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, pickerSearchQuery]);

  return (
    <div className="space-y-8">
      {/* Read-Only Warning if Moderator / Member */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Read-Only Mode:</span> Curating collections requires <strong className="font-mono uppercase font-bold">Curator</strong> or <strong className="font-mono uppercase font-bold">Admin</strong> privileges. Your active persona is <span className="uppercase font-mono font-bold underline">{activeRole}</span>.
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
              Curated Collections Studio
            </h1>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-mono font-bold">
              Module 5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Assemble themed anthologies of monographs with custom hero covers, multi-project pickers, and featured status.
          </p>
        </div>

        <button
          type="button"
          disabled={!canEdit}
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black disabled:opacity-50 px-4 py-2 text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections by title or slug..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
          />
        </div>

        <div className="text-xs font-mono text-neutral-500">
          Total Collections: <span className="font-bold text-neutral-900 dark:text-neutral-100">{collections.length}</span> (
          {collections.filter((c) => c.isFeatured).length} Featured)
        </div>
      </div>

      {/* Collections Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((col) => {
          // Resolve project previews for this collection
          const collectionProjects = projects.filter((p) => col.projectIds?.includes(p.id));

          return (
            <div
              key={col.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Hero Cover Image */}
                <div className="relative h-44 w-full bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={col.coverImage || "/placeholder.jpg"}
                    alt={col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                      {col.projectIds?.length || 0} Monographs
                    </span>
                    {col.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-[10px] font-mono font-bold text-white dark:text-black shadow-xs">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white tracking-tight leading-tight line-clamp-1">
                      {col.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-300">
                      /{col.slug}
                    </span>
                  </div>
                </div>

                {/* Description & Projects Previews */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {col.description || "No editorial synopsis provided."}
                  </p>

                  {/* Included Monographs Mini Avatars */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                      Curated In This Anthology:
                    </div>
                    {collectionProjects.length > 0 ? (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {collectionProjects.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="relative h-10 w-14 rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800"
                            title={p.title}
                          >
                            <Image
                              src={p.coverImage || "/placeholder.jpg"}
                              alt={p.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {collectionProjects.length > 4 && (
                          <span className="text-[10px] font-mono text-neutral-400 font-bold pl-1">
                            +{collectionProjects.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">No monographs assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <Link
                  href={`/collections/${col.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                >
                  <span>Public View</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => openEditModal(col)}
                    className="h-8 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleDelete(col.id, col.title)}
                    className="h-8 w-8 rounded-lg border border-red-500/20 text-red-600 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Collection"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="py-16 text-center text-xs text-neutral-500 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No curated collections found. Click "New Collection" to assemble your first anthology.
        </div>
      )}

      {/* CREATE / EDIT COLLECTION MODAL WITH VISUAL PROJECT PICKER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingCollection ? "Edit Curated Collection" : "Assemble New Collection"}
                </h2>
                <p className="text-xs text-neutral-500">
                  Select cover imagery and choose monographs to include in this editorial anthology.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Brutalist Architecture Anthology"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. brutalist-architecture"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Editorial Description / Synopsis
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Curator notes on this anthology..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
                    />
                    <span className="text-neutral-900 dark:text-white">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* VISUAL PROJECT PICKER SECTION */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <FolderKanban className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                      Visual Project Picker ({formProjectIds.length} Selected)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Check each monograph to include in this collection.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3 w-3 text-neutral-400" />
                    <input
                      type="text"
                      value={pickerSearchQuery}
                      onChange={(e) => setPickerSearchQuery(e.target.value)}
                      placeholder="Filter monographs..."
                      className="pl-7 pr-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs w-48 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    />
                  </div>
                </div>

                {/* Project cards grid in picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredPickerProjects.map((p) => {
                    const isSelected = formProjectIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProjectSelection(p.id)}
                        className={cn(
                          "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 shadow-2xs"
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 hover:border-neutral-400"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by container
                          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white shrink-0 pointer-events-none"
                        />
                        <div className="relative h-9 w-12 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                          <Image
                            src={p.coverImage || "/placeholder.jpg"}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {p.category}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  {isSaving ? "Saving..." : editingCollection ? "Update Collection" : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
