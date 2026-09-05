"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  Image as ImageIcon,
  MessageSquare,
  Heart,
  Globe,
} from "lucide-react";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
}: DeleteProjectModalProps) {
  const router = useRouter();
  const { deleteProject } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleting || !projectId) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const success = await deleteProject(projectId);
      if (success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/projects");
        }
      } else {
        setErrorMessage("Failed to delete project from database. Please try again.");
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={!isDeleting ? onClose : undefined}
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono font-bold tracking-wide uppercase">
              <ShieldAlert className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />
              <span>Irreversible Action</span>
            </div>

            <h2
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight"
              )}
            >
              Delete Monograph Permanently?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description & Purge List */}
        <div className="mt-5 space-y-4">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-neutral-900 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
              &quot;{projectTitle}&quot;
            </span>
            ? Everything associated with this monograph will be permanently erased:
          </p>

          {/* Purge Checklist */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-medium">
              <ImageIcon className="h-4 w-4 text-neutral-500 shrink-0" />
              <span>All uploaded case study images &amp; high-res media</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-medium">
              <Heart className="h-4 w-4 text-neutral-500 shrink-0" />
              <span>All community appreciations and likes</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-medium">
              <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0" />
              <span>All peer discussion comments &amp; critique history</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-medium">
              <Globe className="h-4 w-4 text-neutral-500 shrink-0" />
              <span>Public explore showcase, search entries &amp; profile cards</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-3.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white mt-0.5" />
            <span>
              This operation cannot be undone. You will need to re-upload and re-publish if you decide to restore it later.
            </span>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-3 text-xs font-medium text-neutral-900 dark:text-white">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto h-10 px-5 rounded-2xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel &amp; Keep Monograph
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-auto h-10 px-6 rounded-2xl inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting Monograph...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Monograph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
