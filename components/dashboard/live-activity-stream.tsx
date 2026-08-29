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
        return <Heart className="h-3.5 w-3.5" />;
      case "comment":
        return <MessageSquare className="h-3.5 w-3.5" />;
      case "follow":
        return <UserPlus className="h-3.5 w-3.5" />;
      case "publish":
        return <Sparkles className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getEventDescription = (notif: Notification) => {
    switch (notif.type) {
      case "appreciation":
        return "appreciated a monograph";
      case "comment":
        return "posted a critique on";
      case "follow":
        return "followed creator studio";
      case "publish":
        return "published a new monograph";
      default:
        return "interacted with";
    }
  };

  return (
    <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Live Activity Stream
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-900 dark:text-neutral-100 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white animate-ping" />
            <span>Realtime</span>
          </span>
        </div>

        {/* Stream List */}
        <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No recent activity recorded yet.
            </div>
          ) : (
            notifications.slice(0, 7).map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 rounded-[16px] p-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              >
                {/* Actor Avatar */}
                <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800 mt-0.5">
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
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {notif.actor?.displayName || "A Creator"}
                    </span>
                    <span className="text-neutral-400">
                      {getEventDescription(notif)}
                    </span>
                    {notif.project && (
                      <Link
                        href="/dashboard/projects"
                        className="font-bold text-neutral-900 dark:text-neutral-100 hover:opacity-75 truncate max-w-[150px]"
                      >
                        {notif.project.title}
                      </Link>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Just now</span>
                    </span>
                  </div>
                </div>

                {/* Event Type Icon Badge */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                  {getEventIcon(notif.type)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 border-t border-neutral-100 dark:border-neutral-900 pt-3">
        <Link
          href="/dashboard/notifications"
          className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <span>View announcements & alerts center</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
