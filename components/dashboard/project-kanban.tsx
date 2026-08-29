"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  Star,
  Eye,
  Heart,
  MessageSquare,
  Edit3,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  FileText,
  Trash2,
  Layers,
  Plus,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { QuickEditDrawer } from "@/components/dashboard/quick-edit-drawer";
import { cn } from "@/lib/utils";

interface ProjectKanbanProps {
  projects: Project[];
}

export function ProjectKanban({ projects }: ProjectKanbanProps) {
  const { saveProject } = useSession();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Group projects into 3 columns
  const draftProjects = projects.filter((p) => p.published === false);
  const liveProjects = projects.filter((p) => p.published !== false && !p.featured);
  const featuredProjects = projects.filter((p) => p.published !== false && p.featured);

  const columns = [
    {
      id: "drafts",
      title: "Draft Monographs",
      badge: `${draftProjects.length}`,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      items: draftProjects,
    },
    {
      id: "live",
      title: "Live Showcase",
      badge: `${liveProjects.length}`,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      items: liveProjects,
    },
    {
      id: "featured",
      title: "Featured Staff Picks",
      badge: `${featuredProjects.length}`,
      color: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40",
      items: featuredProjects,
    },
  ];

  const handleMoveTo = async (project: Project, targetColumn: "drafts" | "live" | "featured") => {
    try {
      if (targetColumn === "drafts") {
        await saveProject({ ...project, published: false, featured: false });
      } else if (targetColumn === "live") {
        await saveProject({ ...project, published: true, featured: false });
      } else if (targetColumn === "featured") {
        await saveProject({ ...project, published: true, featured: true });
      }
    } catch (err) {
      console.error("Failed to update status from kanban:", err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 shadow-xs min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  {col.title}
                </h3>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold",
                    col.color
                  )}
                >
                  {col.badge}
                </span>
              </div>

              {col.id === "drafts" && (
                <Link
                  href="/me/projects/new"
                  className="rounded-lg p-1 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors"
                  title="Create new draft"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Column Items */}
            <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
              {col.items.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-[18px] border border-dashed border-[var(--border-neutral)] text-center p-4 text-[11px] text-[var(--content-tertiary)]">
                  No projects in this stage.
                </div>
              ) : (
                col.items.map((project) => (
                  <div
                    key={project.id}
                    className="group relative rounded-[18px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3.5 shadow-2xs transition-all duration-200 hover:border-[var(--content-primary)] hover:shadow-md"
                  >
                    {/* Top: Cover Thumbnail & Quick Open */}
                    <div className="relative h-28 w-full overflow-hidden rounded-[12px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)]">
                      <Image
                        src={project.coverImage || "/placeholder.jpg"}
                        alt={project.title}
                        fill
                        sizes="300px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          {project.medium || "Image"}
                        </span>
                      </div>
                      {project.featured && (
                        <div className="absolute top-2 right-2">
                          <span className="rounded-full bg-[var(--accent)] text-black px-2 py-0.5 text-[9px] font-bold shadow-xs flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>Staff Pick</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title & Category */}
                    <div className="mt-3 space-y-1">
                      <div className="font-bold text-xs text-[var(--content-primary)] line-clamp-2">
                        {project.title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--content-tertiary)]">
                        <span className="truncate max-w-[130px]">{project.category}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="flex items-center gap-0.5 text-rose-500 font-semibold">
                            <Heart className="h-3 w-3 fill-current" />
                            {project.appreciations || 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <MessageSquare className="h-3 w-3" />
                            {project.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar: Move to status & Edit triggers */}
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border-neutral)]/60 pt-2.5 text-[11px]">
                      {/* Move to actions */}
                      <div className="flex items-center gap-1">
                        {col.id !== "drafts" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "drafts")}
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-amber-500 transition-colors cursor-pointer"
                            title="Move to Drafts"
                          >
                            Draft
                          </button>
                        )}
                        {col.id !== "live" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "live")}
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-emerald-500 transition-colors cursor-pointer"
                            title="Publish Live"
                          >
                            Live
                          </button>
                        )}
                        {col.id !== "featured" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "featured")}
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            title="Make Featured Staff Pick"
                          >
                            Feature
                          </button>
                        )}
                      </div>

                      {/* Edit buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProject(project)}
                          className="rounded-md p-1 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                          title="Quick Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/me/projects/${project.id}`}
                          className="rounded-md p-1 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                          title="Full Editor"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/project/${project.slug}`}
                          target="_blank"
                          className="rounded-md p-1 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                          title="View Live"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Edit Drawer */}
      <QuickEditDrawer
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
      />
    </>
  );
}
