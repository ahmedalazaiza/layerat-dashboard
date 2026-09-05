"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  Edit3,
  ExternalLink,
  Star,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  MoreVertical,
  Check,
  FileText,
  Shield,
  Flag,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { DeleteProjectModal } from "@/components/project/delete-project-modal";
import { ProjectLightbox } from "@/components/project/project-lightbox";
import { QuickEditDrawer } from "@/components/dashboard/quick-edit-drawer";
import { cn } from "@/lib/utils";

interface ProjectTableProps {
  projects: Project[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const { saveProject, deleteProject, openReportModal, reports, confirmAction } = useSession();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; alt: string }[]>([]);
  const [lightboxProject, setLightboxProject] = useState<Project | null>(null);

  // Bulk Selection Toggles
  const handleSelectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Super Admin: Toggle Featured status
  const handleToggleFeatured = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveProject({
        ...project,
        featured: !project.featured,
      });
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    }
  };

  // Super Admin: Toggle Published status
  const handleTogglePublished = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveProject({
        ...project,
        published: !project.published,
      });
    } catch (err) {
      console.error("Failed to toggle published status:", err);
    }
  };

  // Bulk Actions
  const handleBulkFeature = async () => {
    for (const id of Array.from(selectedIds)) {
      const p = projects.find((proj) => proj.id === id);
      if (p) {
        await saveProject({ ...p, featured: true });
      }
    }
    setSelectedIds(new Set());
  };

  const handleBulkPublish = async () => {
    for (const id of Array.from(selectedIds)) {
      const p = projects.find((proj) => proj.id === id);
      if (p) {
        await saveProject({ ...p, published: true });
      }
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${selectedIds.size} Monographs?`,
      description: `This action will permanently delete ${selectedIds.size} selected monographs from the database. This cannot be undone.`,
      confirmText: `Delete ${selectedIds.size} Monographs`,
      cancelText: "Keep Monographs",
      variant: "destructive",
      badgeLabel: "Permanent Bulk Deletion",
    });
    if (!ok) return;

    for (const id of Array.from(selectedIds)) {
      await deleteProject(id);
    }
    setSelectedIds(new Set());
  };

  // Open Lightbox
  const openLightbox = (images: { url: string; alt: string }[], index: number, project?: Project) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxProject(project || null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-black text-white dark:bg-white dark:text-black px-5 py-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black dark:bg-black dark:text-white text-[10px]">
                {selectedIds.size}
              </span>
              <span>Monographs selected for moderation</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkFeature}
                className="flex items-center gap-1.5 rounded-full border border-neutral-700 dark:border-neutral-300 bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Feature Selected</span>
              </button>

              <button
                type="button"
                onClick={handleBulkPublish}
                className="flex items-center gap-1.5 rounded-full border border-neutral-700 dark:border-neutral-300 bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Publish Selected</span>
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-full border border-neutral-700 dark:border-neutral-300 bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-bold text-white dark:text-black hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete ({selectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-neutral-400 hover:text-white dark:hover:text-black underline ml-2 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Master Project Data Table */}
        <div className="overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {/* Select All Checkbox */}
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === projects.length && projects.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Monograph Identity & Slug</th>
                  <th className="py-3.5 px-4">Studio / Creator</th>
                  <th className="py-3.5 px-4">Discipline</th>
                  <th className="py-3.5 px-4">Medium</th>
                  <th className="py-3.5 px-4">Publication State</th>
                  <th className="py-3.5 px-4 text-center">Staff Pick</th>
                  <th className="py-3.5 px-4 text-center">Engagement</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-neutral-400">
                      No monographs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const isSelected = selectedIds.has(project.id);
                    const hasActiveReport = reports.some(
                      (r) => r.projectId === project.id && r.status === "pending"
                    );
                    const gallery = (project.galleryImages || [project.coverImage]).filter(Boolean).map((img, i) => ({
                      url: img,
                      alt: `${project.title} - ${i + 1}`,
                    }));

                    return (
                      <tr
                        key={project.id}
                        className={cn(
                          "group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40",
                          isSelected && "bg-neutral-100 dark:bg-neutral-900",
                          hasActiveReport && "bg-neutral-50 dark:bg-neutral-900/60"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(project.id)}
                            className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Identity & Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3.5 min-w-[220px]">
                            <div
                              onClick={() => openLightbox(gallery, 0, project)}
                              className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer group/thumb"
                              title="Click to view full image in lightbox"
                            >
                              <Image
                                src={project.coverImage || "/placeholder.jpg"}
                                alt={project.title}
                                fill
                                sizes="64px"
                                className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                                <span>{project.title}</span>
                                {hasActiveReport && (
                                  <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase">
                                    Reported
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                                <span className="truncate">/{project.slug}</span>
                                <span>•</span>
                                <span>{project.publishedAt || "Recently"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Creator Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 min-w-[130px]">
                            <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800">
                              <Image
                                src={getValidAvatarUrl(project.creator?.avatarUrl)}
                                alt={project.creator?.displayName || "Studio"}
                                fill
                                sizes="20px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[110px]">
                              {project.creator?.displayName || "Studio"}
                            </span>
                          </div>
                        </td>

                        {/* Discipline */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 max-w-[140px] truncate">
                            {project.category}
                          </span>
                        </td>

                        {/* Medium */}
                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                            {project.medium || "Image"}
                          </span>
                        </td>

                        {/* Status Toggle (Published vs Draft) */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePublished(project, e)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer",
                              project.published !== false
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
                            )}
                            title="Super Admin: Toggle publication state"
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                project.published !== false ? "bg-white dark:bg-black" : "bg-neutral-400"
                              )}
                            />
                            <span>{project.published !== false ? "Live Showcase" : "Draft"}</span>
                          </button>
                        </td>

                        {/* Featured Star Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFeatured(project, e)}
                            className={cn(
                              "h-7 w-7 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer",
                              project.featured
                                ? "text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 shadow-2xs"
                                : "text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                            )}
                            title={project.featured ? "Super Admin: Remove Staff Pick" : "Super Admin: Feature on Staff Picks"}
                          >
                            <Star className={cn("h-4 w-4", project.featured && "fill-current")} />
                          </button>
                        </td>

                        {/* Engagement Metrics */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                            <span className="flex items-center gap-1 text-neutral-900 dark:text-neutral-100">
                              <Heart className="h-3 w-3 fill-current text-neutral-400" />
                              {project.appreciations || 0}
                            </span>
                            <span className="flex items-center gap-1 text-neutral-500">
                              <MessageSquare className="h-3 w-3 text-neutral-400" />
                              {project.comments?.length || 0}
                            </span>
                          </div>
                        </td>

                        {/* Super Admin Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Report Project / Safety Flag */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReportModal(project);
                              }}
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                                hasActiveReport
                                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              )}
                              title="Report Project (Safety & Copyright Review)"
                              aria-label={`Report ${project.title}`}
                            >
                              <Flag className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick Inspect/Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingProject(project)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                              title="Inspect & Edit Monograph"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setProjectToDelete(project)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                              title="Super Admin: Delete Monograph"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Edit Drawer */}
      {editingProject && (
        <QuickEditDrawer
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          projectId={projectToDelete.id}
          projectTitle={projectToDelete.title}
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
        />
      )}

      {/* Media Lightbox */}
      {lightboxIndex !== null && (
        <ProjectLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => {
            setLightboxIndex(null);
            setLightboxProject(null);
          }}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          project={lightboxProject}
        />
      )}
    </>
  );
}
