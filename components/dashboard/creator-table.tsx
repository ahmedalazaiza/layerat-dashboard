"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Creator, Project } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  ExternalLink,
  MapPin,
  Globe,
  FolderKanban,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Ban,
  UserCheck,
  Lock,
  Copy,
  Check,
  MoreVertical,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { cn } from "@/lib/utils";

interface CreatorTableProps {
  creators: Creator[];
  projects: Project[];
}

export function CreatorTable({ creators, projects }: CreatorTableProps) {
  const { toggleUserVerified, toggleUserSuspended, confirmAction } = useSession();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggleVerification = async (creator: Creator) => {
    const isCurrentlyVerified = creator.isVerified ?? false;
    const ok = await confirmAction({
      title: isCurrentlyVerified ? "Revoke Studio Verification?" : "Grant Studio Verification?",
      description: isCurrentlyVerified
        ? `Remove official verified badge from @${creator.username}?`
        : `Grant official verified studio badge to @${creator.username}?`,
      confirmText: isCurrentlyVerified ? "Revoke Badge" : "Grant Verified Badge",
      variant: isCurrentlyVerified ? "warning" : "default",
      targetName: creator.displayName || creator.username,
    });
    if (!ok) return;

    await toggleUserVerified(creator.id, !isCurrentlyVerified);
  };

  const handleToggleSuspend = async (creator: Creator) => {
    const isCurrentlySuspended = creator.isSuspended ?? false;
    const ok = await confirmAction({
      title: isCurrentlySuspended ? "Lift Account Suspension?" : "Suspend Creator Account?",
      description: isCurrentlySuspended
        ? `Restore platform access and public studio showcase for @${creator.username}?`
        : `Suspend creator @${creator.username}? They will be blocked from publishing new monographs or appearing in public discover feeds.`,
      confirmText: isCurrentlySuspended ? "Reactivate Studio" : "Suspend Studio",
      variant: isCurrentlySuspended ? "default" : "destructive",
      targetName: creator.displayName || creator.username,
      targetDetails: creator.email,
    });
    if (!ok) return;

    await toggleUserSuspended(creator.id, !isCurrentlySuspended);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="py-3.5 px-4">User / Studio Identity</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4 text-center">Verified Badge</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Key Disciplines</th>
              <th className="py-3.5 px-4 text-center">Monographs</th>
              <th className="py-3.5 px-4 text-center">Followers</th>
              <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {creators.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                  No creator or studio accounts found matching criteria.
                </td>
              </tr>
            ) : (
              creators.map((creator) => {
                const isVerified = creator.isVerified ?? false;
                const isSuspended = creator.isSuspended ?? false;
                const creatorProjectsCount = projects.filter(
                  (p) => p.creator?.id === creator.id || p.creator?.username === creator.username
                ).length;

                return (
                  <tr
                    key={creator.id}
                    className={cn(
                      "group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40",
                      isSuspended && "opacity-60 bg-neutral-100 dark:bg-neutral-900/80"
                    )}
                  >
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800">
                          <Image
                            src={getValidAvatarUrl(creator.avatarUrl)}
                            alt={creator.displayName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                          <OnlineBadge isOnline={creator.isOnline} size="sm" className="absolute bottom-0 right-0 z-10" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            <Link
                              href={`/u/${creator.username}`}
                              className="hover:opacity-75 transition-opacity truncate"
                            >
                              {creator.displayName}
                            </Link>
                            {isVerified && <VerifiedBadge size="sm" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono mt-0.5">
                            <span>@{creator.username}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(creator.id)}
                              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                              title="Copy Internal User UUID"
                            >
                              {copiedId === creator.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold",
                          isSuspended
                            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSuspended ? "bg-neutral-500" : "bg-black dark:bg-white"
                          )}
                        />
                        <span>{isSuspended ? "Suspended" : "Active Studio"}</span>
                      </span>
                    </td>

                    {/* Verified Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVerification(creator)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer",
                          isVerified
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-black dark:hover:text-white"
                        )}
                        title="Toggle official verified studio badge"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{isVerified ? "Verified" : "Unverified"}</span>
                      </button>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 min-w-[100px] truncate">
                        <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{creator.city || creator.location || "Global"}</span>
                      </div>
                    </td>

                    {/* Skills / Disciplines */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(creator.skills || ["Design", "Creative"]).slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-200 truncate"
                          >
                            {skill}
                          </span>
                        ))}
                        {(creator.skills || []).length > 2 && (
                          <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                            +{(creator.skills || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Monographs Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {creatorProjectsCount}
                    </td>

                    {/* Followers Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {(creator.followersCount || 0).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Monographs */}
                        <Link
                          href={`/dashboard/projects?creator=${encodeURIComponent(creator.username)}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                          title="View Monographs"
                        >
                          <FolderKanban className="h-3.5 w-3.5" />
                        </Link>

                        {/* Public Profile */}
                        <Link
                          href={`/u/${creator.username}`}
                          target="_blank"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                          title="Open Studio Profile"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        {/* Suspend / Unsuspend */}
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(creator)}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                            isSuspended
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          )}
                          title={isSuspended ? "Unsuspend account" : "Suspend account"}
                        >
                          {isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
