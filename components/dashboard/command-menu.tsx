"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Tags,
  Image as ImageIcon,
  Sparkles,
  Bell,
  Settings,
  Plus,
  ArrowRight,
  ExternalLink,
  Moon,
  Sun,
  RefreshCw,
  X,
  FileText,
  FileEdit,
  Key,
  Command,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { invalidateAppCache } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { user, projects, creators, refreshFromDb } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navItems = [
    {
      id: "overview",
      label: "Dashboard Overview",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
    },
    {
      id: "projects",
      label: "Projects & Case Studies",
      category: "Navigation",
      icon: FolderKanban,
      action: () => router.push("/dashboard/projects"),
    },
    {
      id: "new-project",
      label: "Create New Project",
      category: "Actions",
      icon: Plus,
      action: () => router.push("/me/projects/new"),
    },
    {
      id: "creators",
      label: "Creators Directory",
      category: "Navigation",
      icon: Users,
      action: () => router.push("/dashboard/creators"),
    },
    {
      id: "cms",
      label: "Site CMS Studio (Edit Content)",
      category: "Navigation",
      icon: FileEdit,
      action: () => router.push("/dashboard/cms"),
    },
    {
      id: "comments",
      label: "Critiques & Comments Queue",
      category: "Navigation",
      icon: MessageSquare,
      action: () => router.push("/dashboard/comments"),
    },
    {
      id: "taxonomy",
      label: "Master Taxonomy & 13 Disciplines",
      category: "Navigation",
      icon: Tags,
      action: () => router.push("/dashboard/taxonomy"),
    },
    {
      id: "media",
      label: "Media & Storage Vault",
      category: "Navigation",
      icon: ImageIcon,
      action: () => router.push("/dashboard/media"),
    },
    {
      id: "ai-lab",
      label: "AI Creative Director Lab",
      category: "Navigation",
      icon: Sparkles,
      action: () => router.push("/dashboard/ai-lab"),
    },
    {
      id: "notifications",
      label: "Announcements & Broadcasts",
      category: "Navigation",
      icon: Bell,
      action: () => router.push("/dashboard/notifications"),
    },
    {
      id: "roles",
      label: "Roles & Permissions (RBAC)",
      category: "Navigation",
      icon: Key,
      action: () => router.push("/dashboard/roles"),
    },
    {
      id: "settings",
      label: "Platform Settings & Backup",
      category: "Navigation",
      icon: Settings,
      action: () => router.push("/dashboard/settings"),
    },
    {
      id: "toggle-theme",
      label: `Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Quick Settings",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
    {
      id: "refresh-cache",
      label: "Purge In-Memory DB Cache",
      category: "Super Admin",
      icon: RefreshCw,
      action: async () => {
        invalidateAppCache();
        await refreshFromDb();
      },
    },
  ];

  // Dynamic project matches based on search
  const projectMatches = (projects || [])
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 4)
    .map((p) => ({
      id: `proj-${p.id}`,
      label: `Monograph: ${p.title}`,
      category: "Projects",
      icon: FileText,
      action: () => router.push(`/project/${p.slug}`),
    }));

  const filteredItems = search.trim()
    ? [
        ...navItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
        ...projectMatches,
      ]
    : navItems;

  const handleSelect = useCallback(
    (item: (typeof navItems)[0]) => {
      onClose();
      item.action();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-[0_25px_70px_rgba(0,0,0,0.4)] z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3.5">
              <Search className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands, pages, projects, or settings..."
                className="w-full bg-transparent text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 rounded bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-500">
                <Command className="h-3 w-3" />
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-900">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No matching commands or projects found for &quot;{search}&quot;.
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  {filteredItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "group flex w-full items-center justify-between gap-3 rounded-[14px] px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left",
                          idx === selectedIndex
                            ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            {item.category}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-[11px] text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-mono">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-mono">↵</kbd> Select
                </span>
              </div>
              <span className="font-mono text-[10px]">Layerat Command Hub</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
