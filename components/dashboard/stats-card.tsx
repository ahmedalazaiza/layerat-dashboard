"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accentColor?: string;
  sparklineData?: number[];
  className?: string;
}

export function StatsCard({
  title,
  value,
  subValue,
  change,
  trend = "up",
  icon: Icon,
  accentColor,
  sparklineData = [35, 45, 40, 60, 55, 75, 90],
  className,
}: StatsCardProps) {
  const isUp = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 shadow-xs transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
          {title}
        </span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-primary)]"
          style={accentColor ? { color: accentColor } : undefined}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--content-primary)] font-mono">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-[var(--content-tertiary)] font-medium">
            {subValue}
          </span>
        )}
      </div>

      {/* Bottom Row: Trend Badge & Micro Sparkline */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-neutral)]/50">
        {change && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                isUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change}
            </span>
            <span className="text-[10px] text-[var(--content-tertiary)]">vs last cycle</span>
          </div>
        )}

        {/* Dynamic Micro SVG Sparkline */}
        <div className="h-6 w-16 flex items-end gap-1">
          {sparklineData.map((val, idx) => {
            const heightPercent = Math.max(15, Math.min(100, val));
            return (
              <div
                key={idx}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-300",
                  idx === sparklineData.length - 1
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--content-tertiary)]/20"
                )}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
