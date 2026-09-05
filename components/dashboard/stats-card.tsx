"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  sparklineData?: number[];
}

export function StatsCard({
  title,
  value,
  subValue,
  change,
  trend = "neutral",
  icon: Icon,
  sparklineData,
}: StatsCardProps) {
  // Compute basic SVG sparkline path only if real data exists
  const hasSparkline = Boolean(sparklineData && sparklineData.length > 1);
  const min = hasSparkline && sparklineData ? Math.min(...sparklineData) : 0;
  const max = hasSparkline && sparklineData ? Math.max(...sparklineData) : 1;
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = hasSparkline && sparklineData
    ? sparklineData
        .map((val, idx) => {
          const x = (idx / (sparklineData.length - 1)) * width;
          const y = height - ((val - min) / range) * (height - 6) - 3;
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 sm:p-6 transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        {/* Metric Identity & Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            {title}
          </span>
          <div
            className={cn(
              bricolage.className,
              "text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
            )}
          >
            {value}
          </div>
        </div>

        {/* Monochrome Icon Badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Footer Info: Sparkline & Context */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-3">
        {/* Context Subtitle or Trend */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {change && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-neutral-900 dark:text-neutral-100">
              {trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : null}
              <span>{change}</span>
            </span>
          )}

          {subValue && (
            <span className="text-[11px] text-neutral-400 truncate max-w-[140px]">
              {subValue}
            </span>
          )}
        </div>

        {/* Minimalist SVG Sparkline (Only if real series data provided) */}
        {hasSparkline && (
          <div className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="text-neutral-900 dark:text-neutral-100"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
