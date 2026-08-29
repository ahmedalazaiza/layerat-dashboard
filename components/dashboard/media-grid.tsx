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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const openLightbox = (index: number) => {
    const images = filteredMedia.map((m) => ({ url: m.url, alt: m.title }));
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Storage Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Storage Buckets & Infrastructure Vault
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                Supabase CDN
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Inspect and manage high-fidelity WebP images, covers, video thumbnails, and studio avatar assets.
            </p>
          </div>
        </div>

        {/* Bucket Filter Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800 shrink-0">
          {[
            { id: "all" as const, label: `All Media (${mediaItems.length})` },
            {
              id: "project-media" as const,
              label: `Monographs (${mediaItems.filter((m) => m.type !== "avatar").length})`,
            },
            {
              id: "avatars" as const,
              label: `Avatars (${mediaItems.filter((m) => m.type === "avatar").length})`,
            },
          ].map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              onClick={() => setSelectedBucket(bucket.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                selectedBucket === bucket.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by file name, project title, or studio handle..."
            className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-8 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs font-mono text-neutral-400 px-2">
          {filteredMedia.length} Assets Found
        </div>
      </div>

      {/* Media Grid Display */}
      {filteredMedia.length === 0 ? (
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-16 text-center text-xs text-neutral-400">
          No media assets found in this bucket.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item, idx) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-[18px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden shadow-xs hover:border-black dark:hover:border-white transition-all duration-200"
            >
              {/* Asset Thumbnail Preview */}
              <div
                onClick={() => openLightbox(idx)}
                className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-pointer"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  className={cn(
                    "object-cover transition-transform duration-300 group-hover:scale-105",
                    item.type === "avatar" && "object-center p-2 rounded-full"
                  )}
                />

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(idx);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    title="Enlarge Image"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    title="Copy CDN Asset URL"
                  >
                    {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <span className="rounded bg-black/80 text-white backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase">
                    {item.type === "avatar" ? "Avatar" : item.type === "project-cover" ? "Cover" : "Gallery"}
                  </span>
                </div>
              </div>

              {/* Asset Meta Footer */}
              <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate" title={item.title}>
                  {item.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                  <span className="truncate max-w-[120px]">{item.sourceName}</span>

                  {item.category && (
                    <span className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 py-0.2 text-[8px] uppercase">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Lightbox */}
      {lightboxIndex !== null && (
        <ProjectLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
}
