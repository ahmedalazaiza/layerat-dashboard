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
          className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[var(--accent)] animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                Dispatch System Announcement
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--content-tertiary)]">
              Live Broadcast
            </span>
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
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
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                        : "border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
              Target Creators Segment
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-semibold text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
            >
              <option value="all">All Registered Creators Worldwide</option>
              <option value="verified">Verified Studios Only</option>
              <option value="online">Active & Online Creators</option>
            </select>
          </div>

          {/* Link to Project (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
              Link to Featured Monograph (Optional)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-semibold text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
              Announcement Message
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E.g. Weekly Monograph Showcase is now live! Submit your spatial design projects..."
              className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] py-3 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Notification...</span>
                </>
              ) : sentSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dispatched to Feed!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Broadcast to Community</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Feed History Stream (Span 7) */}
      <div className="lg:col-span-7 space-y-5">
        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Notification Dispatch Stream & History
                </h3>
              </div>

              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            {/* Notification Stream */}
            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {broadcastFeed.length === 0 ? (
                <div className="py-16 text-center text-xs text-[var(--content-tertiary)]">
                  No notifications currently recorded.
                </div>
              ) : (
                broadcastFeed.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3.5 rounded-[18px] p-3.5 border transition-all cursor-pointer",
                      !notif.read
                        ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                        : "border-[var(--border-neutral)]/60 bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)]/40"
                    )}
                  >
                    <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] mt-0.5">
                      <Image
                        src={getValidAvatarUrl(notif.actor?.avatarUrl)}
                        alt={notif.actor?.displayName || "Actor"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--content-primary)]">
                          {notif.actor?.displayName || "Layerat Desk"}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--content-tertiary)] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notif.createdAt}
                        </span>
                      </div>

                      {notif.content && (
                        <p className="mt-1 text-[11px] text-[var(--content-secondary)] leading-relaxed">
                          {notif.content}
                        </p>
                      )}

                      {notif.project && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                          <span className="text-[var(--content-tertiary)]">Project:</span>
                          <Link
                            href={`/project/${notif.project.slug}`}
                            className="font-bold text-[var(--content-primary)] hover:text-[var(--accent)] transition-colors underline truncate"
                          >
                            {notif.project.title}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--border-neutral)]/60 pt-3 text-right">
            <span className="text-[10px] font-mono text-[var(--content-tertiary)]">
              {broadcastFeed.length} Events Logged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
