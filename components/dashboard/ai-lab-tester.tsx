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

  const handleCopyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Gemini Vision AI Engine & Diagnostic Studio
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                Multimodal 2.5
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Benchmark image-to-monograph creative direction models, taxonomy classification, and structured tagging.
            </p>
          </div>
        </div>

        {/* Engine Diagnostics */}
        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
            <span className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span>AI Ready</span>
          </div>
        </div>
      </div>

      {/* 2-Column AI Tester Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input & Benchmarking (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              1. Select Test Image Or Provide CDN URL
            </h3>

            {/* Sample Presets */}
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_IMAGES.map((sample) => {
                const isSelected = selectedUrl === sample.url && !customUrl.trim();
                return (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(sample.url);
                      setCustomUrl("");
                    }}
                    className={cn(
                      "flex flex-col text-left rounded-[14px] border p-2.5 transition-all cursor-pointer",
                      isSelected
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 shadow-2xs"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    )}
                  >
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-2">
                      <Image
                        src={sample.url}
                        alt={sample.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {sample.name}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 truncate">
                      {sample.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Or Custom Image URL
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isRunning || !activeImage}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Vision Multi-modal Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Multimodal Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Structured Output (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  2. Structured AI Inference Payload
                </h3>
              </div>

              {result && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                  {executionTime && <span>Latency: {executionTime}ms</span>}
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Result Display */}
            {isRunning ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-900 dark:text-neutral-100" />
                <span>Extracting typography, color palette, design disciplines & tags...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Inference Error</span>
                </div>
                <div className="mt-1 font-mono text-[11px] opacity-80">{error}</div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Title & Classification */}
                <div className="p-4 rounded-[18px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                      {result.category}
                    </span>
                    {result.subCategory && (
                      <span className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-200">
                        {result.subCategory}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {result.title}
                  </h4>
                </div>

                {/* Editorial Narrative */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    Generated Monograph Narrative
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 p-4 rounded-[16px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 leading-relaxed font-sans">
                    {result.body}
                  </p>
                </div>

                {/* Tags & Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Inferred Tags ({(result.tags || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(result.tags || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:text-neutral-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Detected Software & Tools ({(result.tools || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(result.tools || []).map((tool, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 dark:text-neutral-100"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-neutral-400">
                Click &quot;Run Multimodal Analysis&quot; to execute live Gemini Vision benchmarking.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
