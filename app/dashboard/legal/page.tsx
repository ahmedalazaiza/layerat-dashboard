"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { canMutateModule } from "@/lib/roles";
import { LegalDocType, LegalDocument, LegalDocumentSection } from "@/lib/types";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  Edit3,
  AlertTriangle,
  History,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_TABS: { id: LegalDocType; label: string; path: string }[] = [
  { id: "terms", label: "Terms of Service", path: "/terms" },
  { id: "privacy", label: "Privacy Policy", path: "/privacy" },
  { id: "guidelines", label: "Community Guidelines", path: "/guidelines" },
];

export default function LegalDocumentsPage() {
  const {
    legalDocuments,
    updateLegalDoc,
    activeRole,
    confirmAction,
  } = useSession();

  const [activeDocId, setActiveDocId] = useState<LegalDocType>("terms");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Local editable buffer for active doc
  const currentDoc = legalDocuments[activeDocId];
  const [title, setTitle] = useState(currentDoc.title);
  const [subtitle, setSubtitle] = useState(currentDoc.subtitle);
  const [version, setVersion] = useState(currentDoc.version);
  const [summary, setSummary] = useState(currentDoc.summary);
  const [sections, setSections] = useState<LegalDocumentSection[]>(currentDoc.sections || []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEdit = canMutateModule(activeRole, "legal");

  // Switch active document tab
  const handleTabChange = (docId: LegalDocType) => {
    setActiveDocId(docId);
    const doc = legalDocuments[docId];
    setTitle(doc.title);
    setSubtitle(doc.subtitle);
    setVersion(doc.version);
    setSummary(doc.summary);
    setSections(doc.sections || []);
    setSaveSuccess(false);
  };

  const handleAddSection = () => {
    const newSection: LegalDocumentSection = {
      id: `sec-${Date.now()}`,
      title: "New Policy Clause",
      content: "Specify the obligations, covenants, or standards governing this clause...",
    };
    setSections([...sections, newSection]);
  };

  const handleUpdateSection = (index: number, key: "title" | "content", val: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [key]: val };
    setSections(updated);
  };

  const handleDeleteSection = async (index: number) => {
    const section = sections[index];
    const ok = await confirmAction({
      title: "Delete Policy Section?",
      description: `Are you sure you want to permanently remove "${section?.title || `Section ${index + 1}`}" from this policy?`,
      confirmText: "Delete Section",
      variant: "destructive",
      targetName: section?.title,
      badgeLabel: "Policy Section Deletion",
    });
    if (!ok) return;

    setSections(sections.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSections(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSections(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setIsSaving(true);
      await updateLegalDoc(activeDocId, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        version: version.trim(),
        summary: summary.trim(),
        sections,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Read-Only Warning if Curator / Moderator / Member */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Read-Only Mode:</span> Updating legal policies and community guidelines requires <strong className="font-mono uppercase font-bold">Admin</strong> privileges. Your active persona is <span className="uppercase font-mono font-bold underline">{activeRole}</span>.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
              )}
            >
              Dynamic Legal & Policy Documents
            </h1>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-mono font-bold">
              Module 8
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Section-based policy builder for Terms of Service, Privacy Policy, and Community Guidelines with live public versioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer",
                viewMode === "edit"
                  ? "bg-white dark:bg-black text-neutral-900 dark:text-white shadow-2xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Section Builder</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer",
                viewMode === "preview"
                  ? "bg-white dark:bg-black text-neutral-900 dark:text-white shadow-2xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit || isSaving}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black disabled:opacity-50 px-4 py-2 text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <span className="h-4 w-4 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saveSuccess ? "Published Live!" : "Publish Version"}</span>
          </button>
        </div>
      </div>

      {/* Document Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        {DOC_TABS.map((tab) => {
          const isActive = activeDocId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                )}
              >
                v{legalDocuments[tab.id]?.version || "2026.1"}
              </span>
            </button>
          );
        })}
      </div>

      {viewMode === "edit" ? (
        /* SECTION BUILDER FORM */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Bar: Title, Subtitle, Version */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              Policy Header & Version Governance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Version String (e.g. 2026.1)
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Preamble / Executive Summary
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Clauses / Section Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Policy Sections & Clauses ({sections.length} Clauses)
              </h3>
              <button
                type="button"
                disabled={!canEdit}
                onClick={handleAddSection}
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Clause</span>
              </button>
            </div>

            {sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="h-6 w-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      disabled={!canEdit}
                      onChange={(e) => handleUpdateSection(idx, "title", e.target.value)}
                      placeholder="Clause Title"
                      className="font-bold text-sm text-neutral-900 dark:text-white bg-transparent focus:outline-none flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={!canEdit || idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="h-7 w-7 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-30"
                      title="Move Clause Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit || idx === sections.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="h-7 w-7 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-30"
                      title="Move Clause Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleDeleteSection(idx)}
                      className="h-7 w-7 rounded border border-red-500/20 text-red-600 hover:bg-red-500/10 flex items-center justify-center disabled:opacity-30 ml-1"
                      title="Delete Clause"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={section.content}
                    disabled={!canEdit}
                    onChange={(e) => handleUpdateSection(idx, "content", e.target.value)}
                    placeholder="Enter clause text and guidelines..."
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 leading-relaxed font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-8 sm:p-12 shadow-xs space-y-8 max-w-4xl mx-auto">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-bold">
                Official Layerat Policy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                v{version}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-neutral-500">{subtitle}</p>
            )}
            {summary && (
              <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                {summary}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={section.id || idx} className="space-y-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span className="text-neutral-900 dark:text-neutral-100 font-mono text-sm font-bold">{idx + 1}.</span>
                  <span>{section.title}</span>
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line pl-5">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 font-mono flex items-center justify-between">
            <span>Layerat Legal Governance Console</span>
            <span>Effective Date: 2026.1</span>
          </div>
        </div>
      )}
    </div>
  );
}
