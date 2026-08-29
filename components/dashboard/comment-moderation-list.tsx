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
      <div className="flex items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search critiques by keyword, author, or project..."
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
          {filteredComments.length} Critiques
        </div>
      </div>

      {/* Critiques Stream Container */}
      <div className="overflow-hidden rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-xs divide-y divide-[var(--border-neutral)]/60">
        {filteredComments.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--content-tertiary)] space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-[var(--content-tertiary)]/50" />
            <div>No critique comments found.</div>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isPinned = pinnedIds.has(comment.id);

            return (
              <div
                key={comment.id}
                className={cn(
                  "p-4 sm:p-5 transition-colors hover:bg-[var(--bg-neutral)]/30 flex flex-col sm:flex-row items-start justify-between gap-4",
                  isPinned && "bg-[var(--accent)]/5 border-l-2 border-l-[var(--accent)]"
                )}
              >
                {/* Left: Author Info & Critique Body */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] mt-0.5">
                    <Image
                      src={getValidAvatarUrl(comment.author?.avatarUrl)}
                      alt={comment.author?.displayName || "Author"}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Header line: Author & Timestamp */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-[var(--content-primary)]">
                        {comment.author?.displayName || "Studio Designer"}
                      </span>
                      <span className="text-[11px] text-[var(--content-tertiary)] font-mono">
                        @{comment.author?.username || "creator"}
                      </span>
                      <span>•</span>
                      <span className="text-[10px] text-[var(--content-tertiary)] font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {comment.createdAt || "Recently"}
                      </span>
                      {isPinned && (
                        <span className="rounded-full bg-[var(--accent)] text-black px-2 py-0.5 text-[9px] font-bold flex items-center gap-1">
                          <Pin className="h-2.5 w-2.5 fill-current" />
                          <span>Pinned Critique</span>
                        </span>
                      )}
                    </div>

                    {/* Critique Content */}
                    <p className="text-xs text-[var(--content-secondary)] leading-relaxed bg-[var(--bg-neutral)] p-3 rounded-[14px] border border-[var(--border-neutral)]/40 font-medium">
                      &quot;{comment.content}&quot;
                    </p>

                    {/* Associated Project Banner */}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--content-tertiary)]">
                      <span>Critique on:</span>
                      <Link
                        href={`/project/${comment.project.slug}`}
                        className="font-bold text-[var(--content-primary)] hover:text-[var(--accent)] transition-colors underline truncate max-w-xs"
                      >
                        {comment.project.title}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right: Project Thumbnail & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-neutral)]/50">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-neutral)] border border-[var(--border-neutral)] hidden sm:block">
                    <Image
                      src={comment.project.coverImage || "/placeholder.jpg"}
                      alt={comment.project.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Pin action */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(comment.id)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] transition-colors cursor-pointer",
                        isPinned
                          ? "text-[var(--accent)] bg-[var(--accent)]/10"
                          : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                      )}
                      title={isPinned ? "Unpin critique" : "Pin critique"}
                    >
                      <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />
                    </button>

                    {/* View project discussion */}
                    <Link
                      href={`/project/${comment.project.slug}#critique-discussion`}
                      target="_blank"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                      title="Jump to critique section on project"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    {/* Delete critique */}
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete critique comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
