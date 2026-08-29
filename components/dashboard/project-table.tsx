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
  ShieldAlert,
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
  const { saveProject, deleteProject } = useSession();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; alt: string }[]>([]);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

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

  // Super Admin: Toggle Flag for Review
  const handleToggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Super Admin: Bulk Actions
  const handleBulkPublish = async (publish: boolean) => {
    for (const id of Array.from(selectedIds)) {
      const p = projects.find((item) => item.id === id);
      if (p) {
        await saveProject({ ...p, published: publish });
      }
    }
    setSelectedIds(new Set());
  };

  const handleBulkFeature = async (feature: boolean) => {
    for (const id of Array.from(selectedIds)) {
      const p = projects.find((item) => item.id === id);
      if (p) {
        await saveProject({ ...p, featured: feature });
      }
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (confirm(`Super Admin: Are you sure you want to delete ${selectedIds.size} selected monographs?`)) {
      for (const id of Array.from(selectedIds)) {
        await deleteProject(id);
      }
      setSelectedIds(new Set());
    }
  };

  const openLightbox = (imgs: string[], idx = 0) => {
    setLightboxImages(imgs.map((img, i) => ({ url: img, alt: `Monograph Image #${i + 1}` })));
    setLightboxIndex(idx);
  };

  return (
    <div className="space-y-4">
      {/* Super Admin Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 py-3 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2 text-[var(--content-primary)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black font-bold font-mono text-[10px]">
              {selectedIds.size}
            </span>
            <span className="font-bold">Monographs selected:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkPublish(true)}
              className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1.5 hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
            >
              Force Publish
            </button>
            <button
              type="button"
              onClick={() => handleBulkPublish(false)}
              className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1.5 hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
            >
              Force Unpublish
            </button>
            <button
              type="button"
              onClick={() => handleBulkFeature(true)}
              className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3.5 py-1.5 font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
            >
              Bulk Feature
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-primary)] px-3 py-1.5 font-bold hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === projects.length && projects.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--border-neutral)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Platform Monograph</th>
                <th className="py-3.5 px-4">Creator / Studio</th>
                <th className="py-3.5 px-4">Discipline</th>
                <th className="py-3.5 px-4">Medium</th>
                <th className="py-3.5 px-4">Publication Status</th>
                <th className="py-3.5 px-4 text-center">Featured Spotlight</th>
                <th className="py-3.5 px-4 text-center">Engagement</th>
                <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-neutral)]/60">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[var(--content-tertiary)]">
                    No platform monographs found matching criteria.
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const isSelected = selectedIds.has(project.id);
                  const isFlagged = flaggedIds.has(project.id);
                  const gallery = project.galleryImages?.length > 0 ? project.galleryImages : [project.coverImage];

                  return (
                    <tr
                      key={project.id}
                      className={cn(
                        "group transition-colors hover:bg-[var(--bg-neutral)]/40",
                        isSelected && "bg-[var(--accent)]/5",
                        isFlagged && "bg-amber-500/5 border-l-2 border-l-amber-500"
                      )}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(project.id)}
                          className="rounded border-[var(--border-neutral)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                        />
                      </td>

                      {/* Monograph Title & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <div
                            onClick={() => openLightbox(gallery, 0)}
                            className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-neutral)] border border-[var(--border-neutral)] cursor-pointer group/thumb"
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
                            <div className="font-bold text-[var(--content-primary)] truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                              <span>{project.title}</span>
                              {isFlagged && (
                                <span className="rounded bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase">
                                  Flagged
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[var(--content-tertiary)] font-mono mt-0.5">
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
                          <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--border-neutral)]">
                            <Image
                              src={getValidAvatarUrl(project.creator?.avatarUrl)}
                              alt={project.creator?.displayName || "Studio"}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-[var(--content-primary)] truncate max-w-[110px]">
                            {project.creator?.displayName || "Studio"}
                          </span>
                        </div>
                      </td>

                      {/* Discipline */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--content-primary)] max-w-[140px] truncate">
                          {project.category}
                        </span>
                      </td>

                      {/* Medium */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-[var(--bg-neutral)] px-2 py-0.5 text-[10px] font-mono text-[var(--content-secondary)]">
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
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          )}
                          title="Super Admin: Toggle publication state"
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              project.published !== false ? "bg-emerald-500" : "bg-amber-500"
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
                              ? "text-amber-500 bg-amber-500/10 shadow-2xs"
                              : "text-[var(--content-tertiary)] hover:text-amber-500 hover:bg-[var(--bg-neutral)]"
                          )}
                          title={project.featured ? "Super Admin: Remove Staff Pick" : "Super Admin: Feature on Staff Picks"}
                        >
                          <Star className={cn("h-4 w-4", project.featured && "fill-current")} />
                        </button>
                      </td>

                      {/* Engagement Metrics */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-3 font-mono text-[11px] text-[var(--content-secondary)] font-semibold">
                          <span className="flex items-center gap-1 text-[var(--content-primary)]">
                            <Heart className="h-3 w-3 fill-current text-[var(--content-tertiary)]" />
                            {project.appreciations || 0}
                          </span>
                          <span className="flex items-center gap-1 text-[var(--content-secondary)]">
                            <MessageSquare className="h-3 w-3 text-[var(--content-tertiary)]" />
                            {project.comments?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Super Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Flag for Review */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleFlag(project.id, e)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                              isFlagged
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400"
                                : "border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                            )}
                            title={isFlagged ? "Super Admin: Unflag Project" : "Super Admin: Flag for Moderation Review"}
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Edit Drawer Trigger */}
                          <button
                            type="button"
                            onClick={() => setEditingProject(project)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                            title="Super Admin: Quick Edit Metadata"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Full Editor Link */}
                          <Link
                            href={`/me/projects/${project.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                            title="Super Admin: Full Project Editor"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Link>

                          {/* View Live Case Study Link */}
                          <Link
                            href={`/project/${project.slug}`}
                            target="_blank"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                            title="View Live Monograph"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          {/* Delete Action Trigger */}
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(project)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
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

      {/* Quick Edit Drawer */}
      <QuickEditDrawer
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
      />

      {/* Delete Project Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          projectId={projectToDelete.id}
          projectTitle={projectToDelete.title}
          onSuccess={() => {
            setProjectToDelete(null);
          }}
        />
      )}

      {/* Image Lightbox Inspector */}
      {lightboxIndex !== null && (
        <ProjectLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
        />
      )}
    </div>
  );
}
