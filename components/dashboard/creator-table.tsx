"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Creator, Project } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  MapPin,
  Globe,
  FolderKanban,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
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
  const { updateProfile, user } = useSession();

  // Local state for toggled verification badges to provide instant feedback
  const [verifiedOverrides, setVerifiedOverrides] = useState<Record<string, boolean>>({});

  const handleToggleVerification = async (creator: Creator) => {
    const current = verifiedOverrides[creator.id] ?? creator.isVerified ?? false;
    const next = !current;

    setVerifiedOverrides((prev) => ({ ...prev, [creator.id]: next }));

    // If updating current logged in user's profile
    if (user && user.id === creator.id) {
      await updateProfile({ isVerified: next });
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)]">
              <th className="py-3.5 px-4">Creator / Studio</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-center">Verified Badge</th>
              <th className="py-3.5 px-4">Key Disciplines & Skills</th>
              <th className="py-3.5 px-4 text-center">Monographs</th>
              <th className="py-3.5 px-4 text-center">Followers</th>
              <th className="py-3.5 px-4 text-right">Studio Link</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-neutral)]/60">
            {creators.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[var(--content-tertiary)]">
                  No creators found matching criteria.
                </td>
              </tr>
            ) : (
              creators.map((creator) => {
                const isVerified = verifiedOverrides[creator.id] ?? creator.isVerified ?? false;
                const creatorProjectsCount = projects.filter(
                  (p) => p.creator?.id === creator.id || p.creator?.username === creator.username
                ).length;

                return (
                  <tr
                    key={creator.id}
                    className="group transition-colors hover:bg-[var(--bg-neutral)]/40"
                  >
                    {/* Creator Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5 min-w-[200px]">
                        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)]">
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
                          <div className="flex items-center gap-1.5 font-bold text-[var(--content-primary)]">
                            <span className="truncate">{creator.displayName}</span>
                            {isVerified && <VerifiedBadge size="sm" />}
                          </div>
                          <div className="text-[11px] text-[var(--content-tertiary)] font-mono">
                            @{creator.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[var(--content-secondary)]">
                        <MapPin className="h-3.5 w-3.5 text-[var(--content-tertiary)] shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {creator.city || creator.location || "Remote Worldwide"}
                        </span>
                      </div>
                    </td>

                    {/* Verification Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVerification(creator)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer",
                          isVerified
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] border border-[var(--border-neutral)]"
                        )}
                        title="Click to toggle verified badge"
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {creator.skills && creator.skills.length > 0 ? (
                          creator.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-[var(--bg-neutral)] px-2 py-0.5 text-[10px] font-medium text-[var(--content-secondary)] truncate max-w-[120px]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--content-tertiary)] italic">
                            No skills tagged
                          </span>
                        )}
                        {creator.skills && creator.skills.length > 3 && (
                          <span className="rounded-md bg-[var(--bg-neutral)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--content-tertiary)]">
                            +{creator.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Monographs Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--content-primary)]">
                        {creatorProjectsCount}
                      </span>
                    </td>

                    {/* Followers */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-[var(--content-secondary)]">
                      {creator.followersCount || 0}
                    </td>

                    {/* Studio Link Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {creator.website && (
                          <a
                            href={creator.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                            title={creator.website}
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}

                        <Link
                          href={`/u/${creator.username}`}
                          target="_blank"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                          title="Open studio profile"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
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
