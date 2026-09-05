"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  Info,
  HelpCircle,
} from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type ConfirmationVariant = "destructive" | "warning" | "default";

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  badgeLabel?: string;
  targetName?: string;
  targetDetails?: string;
}

interface ConfirmationContextType {
  confirmAction: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirmAction = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Keyboard accessibility
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Prevent enter if focus is inside another form
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const variant = options?.variant || "default";

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: <Trash2 className="h-6 w-6 text-neutral-900 dark:text-white" />,
          badgeIcon: <ShieldAlert className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />,
          badgeLabel: options?.badgeLabel || "Irreversible Action",
          confirmBtn:
            "bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98]",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-neutral-900 dark:text-white" />,
          badgeIcon: <AlertCircle className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />,
          badgeLabel: options?.badgeLabel || "Attention Required",
          confirmBtn:
            "bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98]",
        };
      case "default":
      default:
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-neutral-900 dark:text-white" />,
          badgeIcon: <Info className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />,
          badgeLabel: options?.badgeLabel || "Confirmation",
          confirmBtn:
            "bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98]",
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <ConfirmationContext.Provider value={{ confirmAction }}>
      {children}

      {isOpen && options && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-150"
          onClick={handleCancel}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-150"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Cancel (Esc)"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header / Icon */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-2xs">
                {currentStyles.icon}
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-[11px] font-mono font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  {currentStyles.badgeIcon}
                  <span>{currentStyles.badgeLabel}</span>
                </span>

                <h3
                  id="confirm-dialog-title"
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight"
                  )}
                >
                  {options.title}
                </h3>

                <p
                  id="confirm-dialog-desc"
                  className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto"
                >
                  {options.description}
                </p>
              </div>
            </div>

            {/* Target Item Pill (Optional) */}
            {options.targetName && (
              <div className="mt-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 flex items-center gap-2.5 text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs font-bold">
                  #
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    Target Object
                  </span>
                  <span className="block text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {options.targetName}
                  </span>
                  {options.targetDetails && (
                    <span className="block text-[11px] text-neutral-500 truncate">
                      {options.targetDetails}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                {options.cancelText || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className={cn(
                  "w-full sm:w-1/2 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer",
                  currentStyles.confirmBtn
                )}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmation must be used within a ConfirmationProvider");
  }
  return context;
}
