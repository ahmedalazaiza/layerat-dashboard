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
      items: draftProjects,
    },
    {
      id: "live",
      title: "Live Showcase",
      badge: `${liveProjects.length}`,
      items: liveProjects,
    },
    {
      id: "featured",
      title: "Featured Staff Picks",
      badge: `${featuredProjects.length}`,
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
            className="flex flex-col rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 shadow-xs min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  {col.title}
                </h3>
                <span className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                  {col.badge}
                </span>
              </div>

              <Link
                href="/me/projects/new"
                className="h-6 w-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                title="Create Monograph"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Cards Column */}
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
              {col.items.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-[16px] border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
                  No monographs in this state
                </div>
              ) : (
                col.items.map((project) => (
                  <div
                    key={project.id}
                    className="group relative flex flex-col rounded-[18px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3.5 transition-all hover:border-black dark:hover:border-white shadow-2xs space-y-3"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                        <Image
                          src={project.coverImage || "/placeholder.jpg"}
                          alt={project.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate" title={project.title}>
                          {project.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono truncate">
                          <span>{project.category}</span>
                          <span>•</span>
                          <span className="truncate">@{project.creator?.username || "creator"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls & Move Arrows */}
                    <div className="flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60 pt-2.5 text-xs">
                      {/* Metric info */}
                      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" />
                          <span>{project.appreciations || 0}</span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Move Left */}
                        {col.id === "live" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "drafts")}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Move to Drafts"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {col.id === "featured" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "live")}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Demote to Regular Live"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Quick Edit */}
                        <button
                          type="button"
                          onClick={() => setEditingProject(project)}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                          title="Quick Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Move Right */}
                        {col.id === "drafts" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "live")}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Publish Live"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {col.id === "live" && (
                          <button
                            type="button"
                            onClick={() => handleMoveTo(project, "featured")}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Promote to Staff Pick"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
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
      {editingProject && (
        <QuickEditDrawer
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
}
