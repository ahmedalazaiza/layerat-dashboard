"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Notification, Project } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  Bell,
  Send,
  Sparkles,
  CheckCircle2,
  Users,
  Check,
  Clock,
  Heart,
  MessageSquare,
  UserPlus,
  Radio,
  FileText,
  Loader2,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface BroadcastComposerProps {
  notifications: Notification[];
  projects: Project[];
}

export function BroadcastComposer({ notifications, projects }: BroadcastComposerProps) {
  const { user, markAllNotificationsAsRead, markNotificationAsRead } = useSession();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"publish" | "appreciation" | "comment" | "follow">("publish");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<"all" | "verified" | "online">("all");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Local simulated broadcast items
  const [broadcastFeed, setBroadcastFeed] = useState<Notification[]>(notifications);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);

    const targetProject = projects.find((p) => p.id === selectedProjectId);

    const newNotification: Notification = {
      id: `broadcast-${Date.now()}`,
      type,
      actor: user || {
        id: "admin",
        username: "layerat_curator",
        displayName: "Layerat Editorial Studio",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        bio: "Official Platform Editorial Desk",
        location: "Global",
        city: "Global",
        skills: ["Editorial", "Curator"],
      },
      project: targetProject
        ? {
            id: targetProject.id,
            slug: targetProject.slug,
            title: targetProject.title,
          }
        : undefined,
      content: content.trim(),
      createdAt: "Just now",
      read: false,
    };

    setTimeout(() => {
      setBroadcastFeed([newNotification, ...broadcastFeed]);
      setIsSending(false);
      setSentSuccess(true);
      setContent("");
      setTitle("");

      setTimeout(() => {
        setSentSuccess(false);
      }, 3000);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Broadcast Composer (Span 5) */}
      <div className="lg:col-span-5 space-y-5">
        <form
          onSubmit={handleBroadcast}
          className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Dispatch System Announcement
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              Live Broadcast
            </span>
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Notification Channel Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "publish", label: "Editorial Release", icon: Sparkles },
                { id: "appreciation", label: "Appreciation Pulse", icon: Heart },
                { id: "comment", label: "Critique Alert", icon: MessageSquare },
                { id: "follow", label: "Network Spotlight", icon: UserPlus },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as any)}
                    className={cn(
                      "flex items-center gap-2 rounded-[12px] p-2.5 text-xs font-bold border transition-all cursor-pointer",
                      type === item.id
                        ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Target Creators Segment
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              <option value="all">All Registered Creators Worldwide</option>
              <option value="verified">Verified Studios Only</option>
              <option value="online">Active & Online Creators</option>
            </select>
          </div>

          {/* Link to Project (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Link to Featured Monograph (Optional)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              <option value="">No Linked Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Announcement Message Body *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Curated Monograph of the Week selected. Explore our spotlight interview..."
              className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-black text-white dark:bg-white dark:text-black py-2.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Announcement...</span>
                </>
              ) : sentSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Broadcast Dispatched Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Broadcast Notification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Broadcast Feed History (Span 7) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Dispatched Announcements Feed
              </h3>
            </div>
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          {/* Notification List */}
          <div className="mt-4 space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {broadcastFeed.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-400">
                No system broadcasts dispatched yet.
              </div>
            ) : (
              broadcastFeed.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3.5 rounded-[18px] border border-neutral-200 dark:border-neutral-800 p-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer",
                    !notif.read && "bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-300 dark:border-neutral-700"
                  )}
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800 mt-0.5">
                    <Image
                      src={getValidAvatarUrl(notif.actor?.avatarUrl)}
                      alt={notif.actor?.displayName || "Actor"}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {notif.actor?.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {notif.createdAt || "Recently"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {notif.content || "Official platform notification broadcast."}
                    </p>

                    {notif.project && (
                      <div className="pt-1">
                        <Link
                          href={`/project/${notif.project.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 hover:opacity-75"
                        >
                          <span>Featured Monograph: {notif.project.title}</span>
                          <span className="font-mono">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
