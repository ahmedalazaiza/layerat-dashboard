"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { canMutateModule } from "@/lib/roles";
import { Report, ReportStatus } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  Check,
  X,
  FileText,
  Plus,
  Trash2,
  Clock,
  Layers,
  User,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REASON_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  copyright: { label: "Copyright / IP Infringement", icon: ShieldAlert },
  inappropriate_content: { label: "Content Policy Violation", icon: AlertTriangle },
  spam: { label: "Spam / Commercial Deception", icon: Flag },
  harassment: { label: "Harassment / Code of Conduct", icon: Ban },
  other: { label: "General Policy Review", icon: FileText },
};

const STATUS_TABS: { id: ReportStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending Review" },
  { id: "reviewed", label: "Under Investigation" },
  { id: "resolved", label: "Enforced Actions" },
  { id: "dismissed", label: "Dismissed" },
  { id: "all", label: "All Audit Records" },
];

export default function ModerationQueuePage() {
  const {
    reports,
    createReport,
    deleteReport,
    updateReportStatus,
    enforceReportAction,
    toggleProjectPublish,
    toggleUserSuspended,
    projects,
    activeRole,
    user,
    openReportModal,
    confirmAction,
  } = useSession();

  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>("all");

  // Modals
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [resolutionModalReport, setResolutionModalReport] = useState<Report | null>(null);
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Report Form State
  const [newReportProjectId, setNewReportProjectId] = useState<string>("");
  const [newReportReason, setNewReportReason] = useState<string>("copyright");
  const [newReportNotes, setNewReportNotes] = useState<string>("");

  const canEdit = canMutateModule(activeRole, "moderation");

  // Accurate Live Counts from Supabase Database
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const underReviewCount = reports.filter((r) => r.status === "reviewed").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const dismissedCount = reports.filter((r) => r.status === "dismissed").length;
  const totalMonographs = projects.length;

  // Real Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (activeTab !== "all" && r.status !== activeTab) return false;

      // Reason filter
      if (selectedReasonFilter !== "all" && r.reason !== selectedReasonFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = (r.description || "").toLowerCase().includes(q);
        const matchProject = (r.project?.title || "").toLowerCase().includes(q);
        const matchAuthor = (r.project?.creator?.displayName || "").toLowerCase().includes(q);
        const matchReporter = (r.reporter?.displayName || "").toLowerCase().includes(q);
        const matchReason = (r.reason || "").toLowerCase().includes(q);
        return matchDesc || matchProject || matchAuthor || matchReporter || matchReason;
      }
      return true;
    });
  }, [reports, activeTab, selectedReasonFilter, searchQuery]);

  // Enforcement Handlers
  const handleAction = async (
    action: "hide_project" | "suspend_creator" | "dismiss" | "resolve",
    report: Report,
    actionNotes?: string
  ) => {
    if (!canEdit) return;

    if (action === "resolve") {
      await updateReportStatus(
        report.id,
        "resolved",
        actionNotes || "Audit complete. Monograph verified and resolved."
      );
      return;
    }

    const title =
      action === "hide_project"
        ? "Hide Monograph from Showcase?"
        : action === "suspend_creator"
        ? "Suspend Creator Account?"
        : "Dismiss Safety Flag?";

    const description =
      action === "hide_project"
        ? `Hide monograph "${report.project?.title || "Reported Monograph"}" from public showcase and resolve report.`
        : action === "suspend_creator"
        ? `Suspend creator "${report.project?.creator?.displayName || "Creator"}" and prevent further publishing.`
        : `Dismiss safety flag on "${report.project?.title || "Reported Monograph"}". No disciplinary action will be taken.`;

    const ok = await confirmAction({
      title,
      description,
      confirmText:
        action === "hide_project"
          ? "Hide Monograph"
          : action === "suspend_creator"
          ? "Suspend Creator"
          : "Dismiss Flag",
      variant: action === "dismiss" ? "default" : "destructive",
      targetName: report.project?.title,
      badgeLabel: "Moderation Enforcement",
    });
    if (!ok) return;

    await enforceReportAction(
      action,
      report.id,
      report.projectId,
      report.project?.creator?.id,
      actionNotes ||
        (action === "hide_project"
          ? "Monograph hidden by Trust & Safety administrator."
          : action === "suspend_creator"
          ? "Creator account suspended due to policy infringement."
          : "Report dismissed after comprehensive audit.")
    );
  };

  const handleToggleHide = async (report: Report) => {
    if (!canEdit || !report.projectId) return;
    const isCurrentlyPublished = report.project?.published ?? true;

    const ok = await confirmAction({
      title: isCurrentlyPublished
        ? "Hide Monograph from Showcase?"
        : "Restore Monograph to Showcase?",
      description: isCurrentlyPublished
        ? `Hide "${report.project?.title || "Monograph"}" from public platform discover feeds?`
        : `Unhide "${report.project?.title || "Monograph"}" and restore it to live showcase feeds?`,
      confirmText: isCurrentlyPublished ? "Hide Monograph" : "Restore Monograph",
      variant: isCurrentlyPublished ? "destructive" : "default",
      targetName: report.project?.title,
    });
    if (!ok) return;

    await toggleProjectPublish(report.projectId, !isCurrentlyPublished);
    await updateReportStatus(
      report.id,
      isCurrentlyPublished ? "resolved" : report.status,
      isCurrentlyPublished
        ? "Monograph hidden by moderator."
        : "Monograph restored to public view."
    );
  };

  const handleToggleSuspendCreator = async (report: Report) => {
    const creatorId = report.project?.creator?.id;
    if (!canEdit || !creatorId) return;
    const isCurrentlySuspended = report.project?.creator?.isSuspended ?? false;

    const ok = await confirmAction({
      title: isCurrentlySuspended
        ? "Reactivate Creator Account?"
        : "Suspend Creator Account?",
      description: isCurrentlySuspended
        ? `Restore platform access and publishing rights for "${report.project?.creator?.displayName || "Creator"}"?`
        : `Suspend account for "${report.project?.creator?.displayName || "Creator"}"? They will be blocked from platform activities.`,
      confirmText: isCurrentlySuspended ? "Reactivate Account" : "Suspend Account",
      variant: isCurrentlySuspended ? "default" : "destructive",
      targetName: report.project?.creator?.displayName,
    });
    if (!ok) return;

    await toggleUserSuspended(creatorId, !isCurrentlySuspended);
    await updateReportStatus(
      report.id,
      !isCurrentlySuspended ? "resolved" : report.status,
      !isCurrentlySuspended ? "Creator suspended." : "Creator unsuspended."
    );
  };

  const handleDeleteRecord = async (reportId: string) => {
    if (!canEdit) return;
    const ok = await confirmAction({
      title: "Delete Moderation Record?",
      description: "Permanently delete this safety report record and dossier audit log from the database. This action cannot be undone.",
      confirmText: "Delete Record",
      variant: "destructive",
      badgeLabel: "Permanent Record Deletion",
    });
    if (!ok) return;

    await deleteReport(reportId);
  };

  const handleOpenNotesModal = (report: Report) => {
    setResolutionModalReport(report);
    setCustomNotes(report.resolutionNotes || report.description || "");
  };

  const handleSaveNotes = async () => {
    if (!resolutionModalReport || !canEdit) return;
    setIsSubmitting(true);
    try {
      await updateReportStatus(
        resolutionModalReport.id,
        resolutionModalReport.status,
        customNotes.trim()
      );
      setResolutionModalReport(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFlagModal = () => {
    if (!user) {
      if (projects.length > 0) {
        openReportModal(projects[0]);
      }
      return;
    }
    setIsFlagModalOpen(true);
  };

  const handleCreateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      const targetProj = projects.find((p) => p.id === newReportProjectId) || projects[0];
      if (targetProj) openReportModal(targetProj);
      setIsFlagModalOpen(false);
      return;
    }
    if (!newReportProjectId || !newReportNotes.trim() || !canEdit) return;

    setIsSubmitting(true);
    try {
      await createReport({
        projectId: newReportProjectId,
        reason: newReportReason,
        notes: newReportNotes.trim(),
        reporterId: user.id,
      });
      setIsFlagModalOpen(false);
      setNewReportProjectId("");
      setNewReportNotes("");
      setActiveTab("pending");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {!canEdit && (
        <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-4 flex items-center gap-3 text-xs text-neutral-800 dark:text-neutral-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
          <div>
            <span className="font-bold">Observational Mode:</span> Moderation enforcement requires{" "}
            <strong className="font-mono uppercase">Moderator</strong> or{" "}
            <strong className="font-mono uppercase">Admin</strong> credentials. Your active role is{" "}
            <span className="uppercase font-mono font-bold">{activeRole}</span>.
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
              )}
            >
              Moderation & Safety Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-black">
              Module 6
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Trust & Copyright Authority
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review community copyright flags, examine reported monographs, and execute 1-click legal takedowns with full audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenFlagModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>File Safety Flag</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
              Pending Review
            </span>
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                pendingCount > 0 ? "bg-red-500 animate-ping" : "bg-neutral-400"
              )}
            />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {pendingCount}
          </div>
          <div className="text-[11px] text-neutral-500">
            {pendingCount === 0 ? "Zero pending flags" : "Requires immediate action"}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
              Under Review
            </span>
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {underReviewCount}
          </div>
          <div className="text-[11px] text-neutral-500">Active moderator inquiries</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
              Enforced Actions
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-neutral-500">Takedowns & suspensions applied</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
              Platform Catalog
            </span>
            <Layers className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {totalMonographs}
          </div>
          <div className="text-[11px] text-neutral-500">Published live monographs</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.id === "all"
                  ? reports.length
                  : reports.filter((r) => r.status === tab.id).length;

              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                      isActive
                        ? "bg-neutral-700 text-white dark:bg-neutral-300 dark:text-black font-bold"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedReasonFilter}
              onChange={(e) => setSelectedReasonFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Violation Types</option>
              <option value="copyright">Copyright & IP</option>
              <option value="inappropriate_content">Content Policy</option>
              <option value="spam">Spam / Quality</option>
              <option value="harassment">Harassment</option>
              <option value="other">General Policy</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dossiers..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 w-44 sm:w-56 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => {
          const reasonMeta = REASON_CONFIG[report.reason] || REASON_CONFIG.other;
          const ReasonIcon = reasonMeta.icon;
          const project = report.project;
          const reporter = report.reporter;
          const creator = project?.creator;
          const isPending = report.status === "pending";
          const isResolved = report.status === "resolved";
          const isDismissed = report.status === "dismissed";
          const isUnderReview = report.status === "reviewed";

          return (
            <div
              key={report.id}
              className={cn(
                "rounded-2xl border transition-all space-y-4 p-5 shadow-xs",
                isPending
                  ? "border-neutral-900/40 dark:border-neutral-700 bg-white dark:bg-neutral-900/90"
                  : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5",
                      isPending && "bg-neutral-900 text-white dark:bg-white dark:text-black",
                      isUnderReview && "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
                      isResolved && "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700",
                      isDismissed && "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 line-through"
                    )}
                  >
                    {isPending && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{report.status}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    <ReasonIcon className="h-3 w-3" />
                    <span>{reasonMeta.label}</span>
                  </span>

                  <span className="text-[11px] font-mono text-neutral-400">
                    ID: #{report.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                  <span>
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent"}
                  </span>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(report.id)}
                      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Purge moderation record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 flex items-start gap-3.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                  <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800">
                    {project?.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project?.title || "Monograph"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400">
                        <Layers className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={project?.slug ? `/projects/${project.slug}` : "#"}
                        target="_blank"
                        className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white hover:underline truncate flex items-center gap-1"
                      >
                        <span>{project?.title || "Monograph #" + report.projectId?.slice(0, 8)}</span>
                        <ExternalLink className="h-3 w-3 text-neutral-400 shrink-0" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span>By: {creator?.displayName || "Creator Studio"}</span>
                      {creator?.isSuspended && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase">
                          Suspended
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono">
                      {project?.published ? (
                        <span className="text-neutral-600 dark:text-neutral-400">● Published to Public Showcase</span>
                      ) : (
                        <span className="text-neutral-900 dark:text-neutral-100 font-bold">○ Hidden from Public</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    Dossier & Community Statement
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-3 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed italic">
                    &ldquo;{report.description || "No detailed statement provided by reporting party."}&rdquo;
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                    <User className="h-3 w-3" />
                    <span>Reported by: {reporter?.displayName || "Community Observer"}</span>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    <span>Audit Notes</span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenNotesModal(report)}
                        className="text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer"
                      >
                        {report.resolutionNotes ? "Edit" : "+ Add"}
                      </button>
                    )}
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs min-h-[64px] flex items-center">
                    {report.resolutionNotes ? (
                      <div className="text-neutral-700 dark:text-neutral-300 leading-normal">
                        {report.resolutionNotes}
                      </div>
                    ) : (
                      <div className="text-neutral-400 italic text-[11px]">
                        No internal findings recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  {project && (
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleToggleHide(report)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                        project.published
                          ? "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                          : "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-black"
                      )}
                    >
                      {project.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{project.published ? "Hide Monograph" : "Unhide Monograph"}</span>
                    </button>
                  )}

                  {creator && (
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleToggleSuspendCreator(report)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                        creator.isSuspended
                          ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-black"
                          : "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                      )}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>{creator.isSuspended ? "Unsuspend Creator" : "Suspend Creator"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleAction("dismiss", report)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 text-xs font-medium transition-all cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Dismiss Flag</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleAction("resolve", report)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 text-xs font-medium transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleOpenNotesModal(report)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-neutral-900 dark:text-white hover:underline cursor-pointer"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Log Findings Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 p-8 space-y-4">
            <div className="h-14 w-14 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="h-7 w-7 text-neutral-900 dark:text-white" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Safety Queue Clean
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Zero active community reports or copyright flags under &ldquo;{activeTab}&rdquo;. All published monographs currently comply with Layerat platform & copyright standards.
              </p>
            </div>
            {canEdit && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenFlagModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>File Safety Flag on a Monograph</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  File Monograph Safety Flag
                </h3>
                <p className="text-xs text-neutral-400">
                  Record an official copyright inquiry, community complaint, or policy flag in the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFlagModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                  Select Target Monograph *
                </label>
                <select
                  required
                  value={newReportProjectId}
                  onChange={(e) => setNewReportProjectId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-500"
                >
                  <option value="">-- Choose a published monograph ({projects.length} available) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (by {p.creator?.displayName || "Studio"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                  Violation Category *
                </label>
                <select
                  required
                  value={newReportReason}
                  onChange={(e) => setNewReportReason(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-500"
                >
                  <option value="copyright">Copyright & Intellectual Property Infringement</option>
                  <option value="inappropriate_content">Content & Presentation Guidelines Breach</option>
                  <option value="spam">Spam, Fraud or Affiliate Abuse</option>
                  <option value="harassment">Harassment, Hate Speech or Hostility</option>
                  <option value="other">General Platform Policy Dispute</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                  Investigation Dossier & Statement *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newReportNotes}
                  onChange={(e) => setNewReportNotes(e.target.value)}
                  placeholder="Provide precise details of the alleged infringement or community issue..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newReportProjectId || !newReportNotes.trim()}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Filing Flag..." : "Submit to Safety Queue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resolutionModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Log Audit Findings
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">
                  Dossier #{resolutionModalReport.id.slice(0, 8)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolutionModalReport(null)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                Internal Investigation Notes & Disposition
              </label>
              <textarea
                rows={4}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Detail the investigative outcome or justification for legal record..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolutionModalReport(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Findings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
