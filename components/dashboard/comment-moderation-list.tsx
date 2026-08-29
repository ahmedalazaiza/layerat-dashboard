"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project, Comment } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  MessageSquare,
  Trash2,
  ExternalLink,
  Pin,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  User,
  X,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface CommentModerationListProps {
  projects: Project[];
}

interface FlattenedComment extends Comment {
  project: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
  };
}

export function CommentModerationList({ projects }: CommentModerationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Flatten all comments from all projects
  const allComments: FlattenedComment[] = useMemo(() => {
    const list: FlattenedComment[] = [];
    projects.forEach((p) => {
      if (Array.isArray(p.comments)) {
        p.comments.forEach((c) => {
          list.push({
            ...c,
            project: {
              id: p.id,
              slug: p.slug,
              title: p.title,
              coverImage: p.coverImage,
            },
          });
        });
      }
    });
    return list;
  }, [projects]);

  const filteredComments = useMemo(() => {
    return allComments.filter((c) => {
      if (deletedIds.has(c.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchContent = c.content?.toLowerCase().includes(q);
        const matchAuthor = c.author?.displayName?.toLowerCase().includes(q) || c.author?.username?.toLowerCase().includes(q);
        const matchProject = c.project.title.toLowerCase().includes(q);

        if (!matchContent && !matchAuthor && !matchProject) return false;
      }
      return true;
    });
  }, [allComments, deletedIds, searchQuery]);

  const handleDeleteComment = (id: string) => {
    if (confirm("Are you sure you want to delete this critique comment?")) {
      setDeletedIds((prev) => new Set(prev).add(id));
    }
  };

  const handleTogglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex items-center gap-3 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search critiques by keyword, author, or project title..."
            className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-900/60 py-2 pl-9 pr-4 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-neutral-400 pr-2">
          {filteredComments.length} critiques
        </div>
      </div>

      {/* Moderation Stream List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-12 text-center text-xs text-neutral-400">
            No critiques found matching query.
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isPinned = pinnedIds.has(comment.id);

            return (
              <div
                key={comment.id}
                className={cn(
                  "group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 transition-all hover:border-black dark:hover:border-white shadow-xs",
                  isPinned && "border-black dark:border-white"
                )}
              >
                {/* Author & Comment Body */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800 mt-0.5">
                    <Image
                      src={getValidAvatarUrl(comment.author?.avatarUrl)}
                      alt={comment.author?.displayName || "Author"}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {comment.author?.displayName || "Anonymous Designer"}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        @{comment.author?.username || "user"}
                      </span>
                      <span className="text-[10px] text-neutral-400">•</span>
                      <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{comment.createdAt || "Recently"}</span>
                      </span>
                      {isPinned && (
                        <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.2 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                          <Pin className="h-2.5 w-2.5" />
                          <span>Pinned Critique</span>
                        </span>
                      )}
                    </div>

                    {/* Critique Content */}
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans pr-4">
                      {comment.content}
                    </p>

                    {/* Associated Project Monograph */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold">
                        On Monograph:
                      </span>
                      <Link
                        href={`/project/${comment.project.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:opacity-75 transition-opacity truncate max-w-xs"
                      >
                        <span>{comment.project.title}</span>
                        <ExternalLink className="h-3 w-3 text-neutral-400" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-neutral-100 dark:border-neutral-900 pt-3 md:pt-0 shrink-0">
                  {/* Toggle Pin / Highlight */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(comment.id)}
                    className={cn(
                      "flex h-8 items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer",
                      isPinned
                        ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    )}
                    title={isPinned ? "Unpin Critique" : "Pin Critique to Top"}
                  >
                    <Pin className="h-3 w-3" />
                    <span>{isPinned ? "Pinned" : "Pin"}</span>
                  </button>

                  {/* Delete Comment */}
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                    title="Delete Comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
