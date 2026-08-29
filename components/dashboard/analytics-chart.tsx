"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Project } from "@/lib/types";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Heart,
  Eye,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsChartProps {
  projects: Project[];
}

export function AnalyticsChart({ projects }: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [activeMetric, setActiveMetric] = useState<"appreciations" | "views" | "comments">("appreciations");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate date points and metrics
  const chartData = useMemo(() => {
    const pointsCount = timeRange === "7d" ? 7 : timeRange === "30d" ? 14 : 24;
    const now = new Date();
    const data = [];

    const totalLikes = projects.reduce((acc, p) => acc + (p.appreciations || 0), 0);
    const totalComments = projects.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
    const baselineLikes = Math.max(12, totalLikes);
    const baselineComments = Math.max(4, totalComments);

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * (timeRange === "7d" ? 1 : timeRange === "30d" ? 2 : 4));
      
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const noise = Math.sin(i * 0.8) * 0.3 + Math.cos(i * 1.2) * 0.2 + 1;
      const appreciations = Math.round((baselineLikes / pointsCount) * noise * (1 + (pointsCount - i) * 0.08));
      const views = Math.round(appreciations * 14.5 + (noise * 80));
      const comments = Math.max(1, Math.round((baselineComments / pointsCount) * noise * 1.2));

      data.push({ label, appreciations, views, comments });
    }
    return data;
  }, [timeRange, projects]);

  // SVG dimensions
  const width = 700;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = useMemo(() => {
    const vals = chartData.map((d) => d[activeMetric]);
    return Math.max(...vals, 10);
  }, [chartData, activeMetric]);

  // Compute SVG Polyline Points
  const points = useMemo(() => {
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * usableWidth;
      const y = height - paddingY - (d[activeMetric] / maxVal) * usableHeight;
      return { x, y, data: d };
    });
  }, [chartData, activeMetric, maxVal, width, height, paddingX, paddingY]);

  const svgPath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${svgPath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  }, [svgPath, points, height, paddingY]);

  // Discipline Breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || "UI";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [projects]);

  // Medium Breakdown
  const mediumStats = useMemo(() => {
    const counts: Record<string, number> = { Image: 0, Video: 0, "3D": 0, Prototype: 0, "PDF/Case study": 0 };
    projects.forEach((p) => {
      const m = p.medium || "Image";
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Activity Timeline Chart (Span 2 cols) */}
      <div className="lg:col-span-2 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs flex flex-col justify-between">
        {/* Header: Title, Metric Switches, & Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Interaction & Engagement Velocity
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live engagement trends across monographs and studio showcases
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveMetric("appreciations")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeMetric === "appreciations"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              <Heart className="h-3 w-3" />
              <span>Likes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("views")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeMetric === "views"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              <Eye className="h-3 w-3" />
              <span>Views</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("comments")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeMetric === "comments"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              <span>Critiques</span>
            </button>
          </div>
        </div>

        {/* SVG Chart Graphic */}
        <div className="relative mt-6 w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-[220px] overflow-visible"
          >
            <defs>
              <linearGradient id="monochromeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" className="text-neutral-900 dark:text-neutral-100" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-neutral-900 dark:text-neutral-100" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((p, idx) => {
              const y = height - paddingY - p * (height - paddingY * 2);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-neutral-200 dark:text-neutral-800"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-neutral-400 font-mono"
                  >
                    {Math.round(p * maxVal)}
                  </text>
                </g>
              );
            })}

            {/* Filled Area Gradient */}
            <path d={areaPath} fill="url(#monochromeAreaGradient)" />

            {/* Primary Curved Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-neutral-900 dark:text-neutral-100"
            />

            {/* Interactive Points & Vertical Guide */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {hoveredIndex === idx && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="text-neutral-900 dark:text-neutral-100 opacity-60"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === idx ? 5.5 : 3}
                  className="fill-white dark:fill-black stroke-neutral-900 dark:stroke-neutral-100 transition-all duration-150"
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Bottom Date Labels */}
            {points.map((p, idx) => {
              if (idx % (timeRange === "7d" ? 1 : timeRange === "30d" ? 2 : 4) !== 0) return null;
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-mono font-medium"
                >
                  {p.data.label}
                </text>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute -top-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-1.5 shadow-lg text-xs"
              style={{
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-mono text-[10px] text-neutral-400">
                {points[hoveredIndex].data.label}
              </div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                <span>
                  {points[hoveredIndex].data[activeMetric].toLocaleString()}{" "}
                  {activeMetric}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Date Filter Range Controls */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-3 text-xs">
          <span className="text-[11px] text-neutral-400">
            Displaying {chartData.length} timeline sample points
          </span>
          <div className="flex items-center gap-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer",
                  timeRange === range
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Taxonomy Breakdown & Medium Distribution */}
      <div className="space-y-6">
        {/* Top Disciplines Card */}
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Top Disciplines
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {projects.length} Total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {categoryStats.map(([category, count]) => {
              const percentage = Math.round((count / Math.max(1, projects.length)) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[170px]">
                      {category}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medium Distribution Card */}
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Medium Distribution
              </h3>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(mediumStats).map(([medium, count]) => (
              <div
                key={medium}
                className="flex items-center justify-between rounded-[14px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-2.5"
              >
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {medium}
                </span>
                <span className="rounded-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
