"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Notification } from "@/lib/types";
import {
  Activity,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface LiveActivityStreamProps {
  notifications: Notification[];
}

export function LiveActivityStream({ notifications }: LiveActivityStreamProps) {
  const getEventIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appreciation":
        return <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />;
      case "comment":
        return <MessageSquare className="h-3.5 w-3.5 text-amber-500" />;
      case "follow":
        return <UserPlus className="h-3.5 w-3.5 text-emerald-500" />;
      case "publish":
        return <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />;
    }
  };

  const getEventDescription = (notif: Notification) => {
    switch (notif.type) {
      case "appreciation":
        return "appreciated your case study";
      case "comment":
        return "posted a critique on";
      case "follow":
        return "started following your studio";
      case "publish":
        return "published a new monograph";
      default:
        return "interacted with";
    }
  };

  return (
    <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--content-primary)]">
              Live Activity Stream
            </h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Realtime</span>
          </span>
        </div>

        {/* Stream List */}
        <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--content-tertiary)]">
              No recent activity recorded yet.
            </div>
          ) : (
            notifications.slice(0, 7).map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 rounded-[16px] p-2.5 transition-colors hover:bg-[var(--bg-neutral)]/60"
              >
                {/* Actor Avatar */}
                <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--border-neutral)] mt-0.5">
                  <Image
                    src={getValidAvatarUrl(notif.actor?.avatarUrl)}
                    alt={notif.actor?.displayName || "User"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[var(--content-primary)]">
                      {notif.actor?.displayName || "A Creator"}
                    </span>
                    <span className="text-[var(--content-tertiary)]">
                      {getEventDescription(notif)}
                    </span>
                    {notif.project && (
                      <Link
                        href={`/project/${notif.project.slug}`}
                        className="font-semibold text-[var(--content-primary)] hover:text-[var(--accent)] transition-colors underline truncate max-w-[150px]"
                      >
                        {notif.project.title}
                      </Link>
                    )}
                  </div>

                  {notif.content && (
                    <p className="mt-1 text-[11px] text-[var(--content-secondary)] bg-[var(--bg-neutral)] p-2 rounded-lg italic line-clamp-2">
                      &quot;{notif.content}&quot;
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--content-tertiary)] font-mono">
                    <span className="flex items-center gap-1">
                      {getEventIcon(notif.type)}
                      <span className="capitalize">{notif.type}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {notif.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 border-t border-[var(--border-neutral)]/60 pt-3">
        <Link
          href="/dashboard/notifications"
          className="flex items-center justify-between text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors"
        >
          <span>View All Activity & Broadcasts</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
