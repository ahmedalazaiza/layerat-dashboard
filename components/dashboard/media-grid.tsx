"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project, Creator } from "@/lib/types";
import {
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Database,
  Eye,
  FileText,
  User,
  HardDrive,
  X,
} from "lucide-react";
import { ProjectLightbox } from "@/components/project/project-lightbox";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  projects: Project[];
  creators: Creator[];
}

interface MediaItem {
  id: string;
  url: string;
  type: "project-cover" | "project-gallery" | "avatar";
  title: string;
  sourceName: string;
  sourceLink?: string;
  category?: string;
}

export function MediaGrid({ projects, creators }: MediaGridProps) {
  const [selectedBucket, setSelectedBucket] = useState<"all" | "project-media" | "avatars">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; alt: string }[]>([]);

  // Collect all media items across projects and creators
  const mediaItems: MediaItem[] = useMemo(() => {
    const list: MediaItem[] = [];

    // Project Covers & Galleries
    projects.forEach((p) => {
      if (p.coverImage) {
        list.push({
          id: `cover-${p.id}`,
          url: p.coverImage,
          type: "project-cover",
          title: `${p.title} (Cover)`,
          sourceName: p.title,
          sourceLink: `/project/${p.slug}`,
          category: p.category,
        });
      }

      if (Array.isArray(p.galleryImages)) {
        p.galleryImages.forEach((img, idx) => {
          if (img !== p.coverImage) {
            list.push({
              id: `gallery-${p.id}-${idx}`,
              url: img,
              type: "project-gallery",
              title: `${p.title} (Gallery Slide #${idx + 1})`,
              sourceName: p.title,
              sourceLink: `/project/${p.slug}`,
              category: p.category,
            });
          }
        });
      }
    });

    // Creator Avatars
    creators.forEach((c) => {
      if (c.avatarUrl) {
        list.push({
          id: `avatar-${c.id}`,
          url: c.avatarUrl,
          type: "avatar",
          title: `${c.displayName} Avatar`,
          sourceName: `@${c.username}`,
          sourceLink: `/u/${c.username}`,
        });
      }
    });

    return list;
  }, [projects, creators]);

  // Filtered media
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      if (selectedBucket === "project-media" && item.type === "avatar") return false;
      if (selectedBucket === "avatars" && item.type !== "avatar") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSource = item.sourceName.toLowerCase().includes(q);
        const matchCategory = item.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchSource && !matchCategory) return false;
      }

      return true;
    });
  }, [mediaItems, selectedBucket, searchQuery]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // Ignore
    }
  };

  const openLightbox = (url: string) => {
    const formatted = filteredMedia.map((m) => ({ url: m.url, alt: m.title }));
    const idx = filteredMedia.findIndex((m) => m.url === url);
    setLightboxImages(formatted);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <div className="space-y-6">
      {/* Storage Quota & Capacity Banner */}
      <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-black font-bold shadow-xs">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--content-primary)]">
                Supabase High-Resolution Storage Buckets
              </h2>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                CDN Active
              </span>
            </div>
            <p className="text-xs text-[var(--content-secondary)] mt-0.5">
              Public asset endpoints: <code className="text-[11px] font-mono">project-media/</code> and <code className="text-[11px] font-mono">avatars/</code>
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--content-secondary)]">Total Media Items</span>
            <span className="font-mono font-bold text-[var(--content-primary)]">
              {mediaItems.length} Files
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--bg-neutral)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] w-1/3" />
          </div>
          <div className="text-[10px] text-[var(--content-tertiary)] text-right">
            Bandwidth: Unmetered Edge Fastly CDN
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by project, creator, or file name..."
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

        {/* Bucket Filter Pills */}
        <div className="flex items-center gap-1 bg-[var(--bg-neutral)] p-1 rounded-full border border-[var(--border-neutral)]">
          <button
            type="button"
            onClick={() => setSelectedBucket("all")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer",
              selectedBucket === "all"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            All Media ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedBucket("project-media")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer",
              selectedBucket === "project-media"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            Project Media
          </button>
          <button
            type="button"
            onClick={() => setSelectedBucket("avatars")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer",
              selectedBucket === "avatars"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
            )}
          >
            Avatars
          </button>
        </div>
      </div>

      {/* Media Grid Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-[var(--content-tertiary)]">
            No media assets found matching current filters.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-[18px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-2 shadow-2xs transition-all duration-200 hover:border-[var(--content-primary)] hover:shadow-md"
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => openLightbox(item.url)}
                className="relative aspect-4/3 w-full overflow-hidden rounded-[12px] bg-[var(--bg-neutral)] cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Type Badge */}
                <div className="absolute top-1.5 left-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[8px] font-mono font-bold uppercase backdrop-blur-md shadow-xs",
                      item.type === "avatar"
                        ? "bg-purple-500/80 text-white"
                        : item.type === "project-cover"
                        ? "bg-[var(--accent)] text-black"
                        : "bg-black/60 text-white"
                    )}
                  >
                    {item.type === "avatar" ? "Avatar" : item.type === "project-cover" ? "Cover" : "Gallery"}
                  </span>
                </div>

                {/* Inspect Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity text-white">
                  <Eye className="h-4 w-4" />
                </div>
              </div>

              {/* Asset Metadata & Quick Copy */}
              <div className="mt-2 space-y-1 p-1">
                <div className="text-[11px] font-bold text-[var(--content-primary)] truncate" title={item.title}>
                  {item.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--content-tertiary)] pt-1 border-t border-[var(--border-neutral)]/50">
                  <span className="truncate max-w-[90px]">{item.sourceName}</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold transition-all cursor-pointer",
                      copiedUrl === item.url
                        ? "bg-emerald-500 text-white"
                        : "hover:bg-[var(--bg-neutral)] text-[var(--content-secondary)]"
                    )}
                    title="Copy CDN Media URL"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="h-2.5 w-2.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-2.5 w-2.5" />
                        <span>CDN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox for Image Inspection */}
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
