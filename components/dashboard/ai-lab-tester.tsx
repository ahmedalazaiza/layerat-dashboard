"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Tag,
  Wrench,
  Copy,
  Check,
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_IMAGES = [
  {
    name: "Architectural Monograph",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
    type: "Brand & Architecture",
  },
  {
    name: "Cybernetic High-Density UI",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
    type: "UI / SaaS Interface",
  },
  {
    name: "Industrial Synthesizer CMF",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&auto=format&fit=crop&q=85",
    type: "Product & Hardware",
  },
  {
    name: "Editorial Risograph Book",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85",
    type: "Print & Graphic Craft",
  },
];

interface AIResult {
  title: string;
  category: string;
  subCategory: string;
  body: string;
  tags: string[];
  tools: string[];
}

export function AILabTester() {
  const [selectedUrl, setSelectedUrl] = useState(SAMPLE_IMAGES[0].url);
  const [customUrl, setCustomUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const activeImage = customUrl.trim() || selectedUrl;

  const handleRunAnalysis = async () => {
    if (!activeImage) return;

    try {
      setIsRunning(true);
      setError(null);
      const startTime = performance.now();

      const response = await fetch("/api/ai/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: [activeImage],
        }),
      });

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setSourceType(data.source || "gemini-vision");
      setResult(data.data);
    } catch (err: any) {
      setError(err?.message || "Failed to execute AI analysis");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source & Test Controls (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Image Preview Card */}
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Media Inspection Source
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--content-tertiary)]">
                Multimodal Input
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-[16px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)]">
              <img
                src={activeImage}
                alt="Test source"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Test Custom Image URL
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or any public image URL"
                className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:border-[var(--content-primary)] focus:outline-none"
              />
            </div>

            {/* Sample Preset Buttons */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold">
                Or Select From Preset Benchmarks
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setCustomUrl("");
                      setSelectedUrl(sample.url);
                    }}
                    className={cn(
                      "flex flex-col p-2.5 rounded-[12px] border text-left transition-all cursor-pointer",
                      selectedUrl === sample.url && !customUrl
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                        : "border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                    )}
                  >
                    <span className="text-xs font-bold truncate">{sample.name}</span>
                    <span className="text-[10px] opacity-70 truncate">{sample.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Analysis CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isRunning}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] py-3 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Multimodal Visuals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 stroke-[2.5]" />
                    <span>Run AI Creative Director Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Results & Metadata Inspector (Span 7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-xs min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Header & Latency Diagnostics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-neutral)]/60 pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[var(--accent)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                    Intelligence Output & Taxonomy Mapping
                  </h3>
                </div>

                {executionTime !== null && (
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{sourceType === "gemini-vision" ? "Gemini Vision Multimodal" : "Heuristic Engine"}</span>
                    </span>
                    <span className="rounded-full bg-[var(--bg-neutral)] px-2 py-0.5 font-bold text-[var(--content-secondary)] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{executionTime}ms</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Body Output Display */}
              {!result && !isRunning && !error && (
                <div className="py-24 text-center space-y-2 text-xs text-[var(--content-tertiary)]">
                  <Sparkles className="h-10 w-10 mx-auto text-[var(--accent)]/50 animate-pulse" />
                  <div className="font-bold text-[var(--content-secondary)]">
                    Ready to Analyze Media
                  </div>
                  <p className="max-w-sm mx-auto">
                    Select a preset benchmark or paste a custom image URL, then click &quot;Run AI Creative Director Analysis&quot;.
                  </p>
                </div>
              )}

              {isRunning && (
                <div className="py-24 text-center space-y-4 text-xs text-[var(--content-tertiary)]">
                  <div className="relative mx-auto h-12 w-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                    <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-[var(--content-primary)]">
                      Extracting Typographic Cadence & Visual Tension...
                    </div>
                    <p className="text-[11px] text-[var(--content-tertiary)]">
                      Inspecting layout composition, matching 13 Master Disciplines, and generating poetic monograph text.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-[16px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Analysis Error</span>
                  </div>
                  <p>{error}</p>
                </div>
              )}

              {result && !isRunning && (
                <div className="mt-5 space-y-5">
                  {/* Generated Title & Discipline Badge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--accent)] text-black px-2.5 py-0.5 text-[10px] font-mono font-bold">
                        {result.category}
                      </span>
                      <span className="text-xs font-mono text-[var(--content-tertiary)]">
                        /{result.subCategory}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--content-primary)]">
                      {result.title}
                    </h4>
                  </div>

                  {/* Editorial Case Study Narrative */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold">
                      Editorial Narrative & Visual Analysis
                    </label>
                    <div className="rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-4 text-xs text-[var(--content-secondary)] leading-relaxed font-medium">
                      {result.body}
                    </div>
                  </div>

                  {/* Extracted Tags & Methodologies */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold flex items-center gap-1">
                      <Tag className="h-3 w-3 text-[var(--accent)]" />
                      <span>Extracted Tags & Methodologies</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-xs font-medium text-[var(--content-primary)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Tools Stack */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold flex items-center gap-1">
                      <Wrench className="h-3 w-3 text-[var(--accent)]" />
                      <span>Detected Software & Tools</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tools?.map((t) => (
                        <span
                          key={t}
                          className="rounded-[10px] bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 py-1 text-xs font-bold shadow-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Copy JSON button */}
            {result && !isRunning && (
              <div className="mt-6 flex items-center justify-between border-t border-[var(--border-neutral)]/60 pt-4 text-xs">
                <span className="text-[11px] text-[var(--content-tertiary)]">
                  Formatted schema valid with Layerat Master Taxonomy
                </span>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3.5 py-1.5 font-mono text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] transition-colors cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>JSON Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Schema JSON</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
