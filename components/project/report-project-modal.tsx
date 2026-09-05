"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Project, ReportReason } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  ShieldAlert,
  Flag,
  X,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  UserCheck,
} from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ReportProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REPORT_REASONS: { id: ReportReason; label: string; description: string }[] = [
  {
    id: "copyright",
    label: "Copyright / IP Infringement",
    description: "Unauthorized usage of proprietary typography, 3D assets, or artwork without license.",
  },
  {
    id: "inappropriate_content",
    label: "Inappropriate or Explicit Content",
    description: "Graphic, violent, sexually explicit, or offensive imagery violating standards.",
  },
  {
    id: "spam",
    label: "Spam, AI Artifact, or Misleading",
    description: "Low-effort spam, misleading attribution, or deceptive case study documentation.",
  },
  {
    id: "harassment",
    label: "Harassment or Defamation",
    description: "Content targeting individuals, defamation, or hate speech against creators.",
  },
  {
    id: "other",
    label: "Other Community Guideline Violation",
    description: "General violation of Layerat terms of service or editorial standards.",
  },
];

export function ReportProjectModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ReportProjectModalProps) {
  const pathname = usePathname();
  const { user, createReport, confirmAction } = useSession();

  const [reason, setReason] = useState<ReportReason>("copyright");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setReason("copyright");
      setNotes("");
      setErrorMessage(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen, project]);

  const handleSafeClose = async () => {
    if (notes.trim() && !isSubmitted) {
      const ok = await confirmAction({
        title: "Discard Safety Report?",
        description: "You have an unfinished report statement. Discarding will clear your draft.",
        confirmText: "Discard Draft",
        cancelText: "Continue Writing",
        variant: "warning",
        targetName: project?.title,
      });
      if (!ok) return;
    }
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSafeClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, notes, isSubmitted]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!notes.trim()) {
      setErrorMessage("Please provide audit notes or description explaining the safety violation.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createReport({
        projectId: project.id,
        reason,
        notes: notes.trim(),
        reporterId: user.id,
      });

      if (created) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMessage("Could not file report in database. Please check your network and try again.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginRedirectUrl = pathname
    ? `/login?redirect=${encodeURIComponent(pathname)}`
    : "/login";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={handleSafeClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl transition-all max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleSafeClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="h-4 w-4" />
        </button>

        {/* CASE A: USER IS NOT LOGGED IN */}
        {!user ? (
          <div className="space-y-6 pt-2">
            {/* Header Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-2xs">
                <Lock className="h-6 w-6 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-[11px] font-mono font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  Authentication Required
                </span>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight"
                  )}
                >
                  Sign in to Report Project
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
                  To protect community integrity and prevent unauthorized or spam submissions, only signed-in members can file copyright flags or safety reports on Layerat.
                </p>
              </div>
            </div>

            {/* Target Project Card */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  Target Monograph
                </span>
                <span className="block text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {project.title}
                </span>
                <span className="block text-xs text-neutral-500 truncate">
                  By {project.creator?.displayName || "Independent Creator"}
                </span>
              </div>
            </div>

            {/* Platform Trust Values */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-4 space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white" />
                <span>Verified creator accountability &amp; anti-abuse protection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white" />
                <span>Direct 24-hour review by Layerat trust &amp; moderation authority</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white" />
                <span>Strict confidentiality with permanent administrative audit log</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href={loginRedirectUrl}
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs cursor-pointer"
              >
                <span>Sign In to Your Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel &amp; Close
              </button>
            </div>
          </div>
        ) : isSubmitted ? (
          /* CASE B1: SUBMISSION SUCCESS CONFIRMATION */
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white animate-in zoom-in-90 duration-200">
              <CheckCircle2 className="h-8 w-8 text-neutral-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <h3
                className={cn(
                  bricolage.className,
                  "text-2xl font-bold text-neutral-900 dark:text-white tracking-tight"
                )}
              >
                Safety Report Logged
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Thank you for safeguarding Layerat. Your dossier on &ldquo;{project.title}&rdquo; has been submitted to the moderation queue for audit.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-neutral-400">
              Window closing automatically...
            </div>
          </div>
        ) : (
          /* CASE B2: USER IS LOGGED IN - FILE REPORT FORM */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Flag className="h-4 w-4 text-neutral-900 dark:text-white" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold">
                  Trust &amp; Safety Bureau
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight"
                )}
              >
                Report Monograph
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                File a formal copyright violation or safety flag for administrative enforcement.
              </p>
            </div>

            {/* Target Project Mini Bar */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  Target Project
                </span>
                <span className="block text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {project.title}
                </span>
                <span className="block text-[11px] text-neutral-500 truncate">
                  By {project.creator?.displayName || "Creator"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3 text-xs text-neutral-900 dark:text-neutral-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Violation Reason Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Primary Violation Reason
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => {
                  const isSelected = reason === r.id;
                  return (
                    <label
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                        isSelected
                          ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 shadow-2xs"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950"
                      )}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.id}
                        checked={isSelected}
                        onChange={() => setReason(r.id)}
                        className="mt-1 h-3.5 w-3.5 accent-black dark:accent-white shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                          {r.label}
                        </span>
                        <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                          {r.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Detailed Statement / Evidence */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Dossier Statement &amp; Evidence
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide specific details regarding original copyright ownership, font licensing links, or community violations..."
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-colors resize-none"
              />
            </div>

            {/* Reporter Accountability Notice */}
            <div className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Submitting as verified account:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">
                {user.displayName || user.email}
              </span>
            </div>

            {/* Submit / Cancel Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleSafeClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Filing Report...</span>
                  </>
                ) : (
                  <>
                    <Flag className="h-3.5 w-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
