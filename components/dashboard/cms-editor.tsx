"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import {
  FileEdit,
  Globe,
  Home,
  FileText,
  Shield,
  Save,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Eye,
  Radio,
  Share2,
  Plus,
  Trash2,
  Layers,
  HelpCircle,
  Users,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CMSEditorProps {
  projects: Project[];
}

export function CMSEditor({ projects }: CMSEditorProps) {
  const [activeTab, setActiveTab] = useState<
    "homepage" | "about" | "guidelines" | "legal" | "announcement" | "seo"
  >("homepage");

  const [isSaved, setIsSaved] = useState(false);

  // 1. Homepage Content State
  const [heroTitle, setHeroTitle] = useState("The living showcase for independent creators.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "A zero-noise publishing environment and curated collective engineered for brand architects, digital artisans, and visual engineers."
  );
  const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState("Explore Monographs");
  const [heroPrimaryCtaLink, setHeroPrimaryCtaLink] = useState("/explore");
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState("Join Collective");
  const [heroSecondaryCtaLink, setHeroSecondaryCtaLink] = useState("/signup");
  const [featuredProjectId, setFeaturedProjectId] = useState<string>(projects[0]?.id || "");
  const [statsCreatorsCount, setStatsCreatorsCount] = useState("10K+");
  const [statsMonographsCount, setStatsMonographsCount] = useState("50K+");
  const [statsCountriesCount, setStatsCountriesCount] = useState("120+");

  // 2. About Us Content State
  const [aboutHeadline, setAboutHeadline] = useState("The modern home for great design.");
  const [aboutMission, setAboutMission] = useState(
    "Layerat was founded on a singular premise: creative work deserves an editorial showcase that honors its craftsmanship without algorithmic manipulation or compressed grids."
  );
  const [aboutPillar1Title, setAboutPillar1Title] = useState("Zero Algorithmic Noise");
  const [aboutPillar1Desc, setAboutPillar1Desc] = useState("No engagement bait, no endless scroll distractions. Pure chronological and curated craft.");
  const [aboutPillar2Title, setAboutPillar2Title] = useState("2px Continuous Gallery Spreads");
  const [aboutPillar2Desc, setAboutPillar2Desc] = useState("Uninterrupted vertical visual flow engineered for high-resolution case study inspection.");
  const [aboutPillar3Title, setAboutPillar3Title] = useState("Studio Identity Preservation");
  const [aboutPillar3Desc, setAboutPillar3Desc] = useState("Every monograph acts as an individual publication elevating the maker's bespoke studio credentials.");

  // 3. Guidelines State
  const [guidelinesHeadline, setGuidelinesHeadline] = useState("Curated Standards for Publishing Excellence");
  const [guidelinesMinResolution, setGuidelinesMinResolution] = useState("1400px width minimum, WebP or high-fidelity JPEG");
  const [guidelinesText, setGuidelinesText] = useState(
    "1. Projects must feature bespoke creative direction with in-depth narrative documentation.\n2. Visual assets must use clean 2px stacked layouts with zero border radius.\n3. Authors must correctly tag software tools and design disciplines."
  );

  // 4. Legal & Compliance State
  const [privacyPolicyText, setPrivacyPolicyText] = useState(
    "Layerat values creator sovereignty. We never sell your personal data or creative assets to third parties. All uploads remain 100% creator property under full copyright protection."
  );
  const [termsText, setTermsText] = useState(
    "By publishing monographs on Layerat, you grant the platform a non-exclusive license to display your visual work in the public directory and editorial spotlights."
  );
  const [legalLastUpdated, setLegalLastUpdated] = useState("August 2026");

  // 5. Global Announcement State
  const [isBannerActive, setIsBannerActive] = useState(true);
  const [bannerBadge, setBannerBadge] = useState("SPECIAL EDITION");
  const [bannerMessage, setBannerMessage] = useState("Spatial Design & Architecture Monograph Submissions Open Now");
  const [bannerLink, setBannerLink] = useState("/explore");

  // 6. Global SEO State
  const [metaTitleTemplate, setMetaTitleTemplate] = useState("Layerat — Curated Design Monographs & Creative Collective");
  const [metaDescription, setMetaDescription] = useState(
    "The living showcase for independent creators, brand architects, and visual engineers. Curated portfolios, zero noise."
  );
  const [socialTwitterHandle, setSocialTwitterHandle] = useState("@layerat");
  const [socialInstagramUrl, setSocialInstagramUrl] = useState("https://instagram.com/layerat");
  const [socialDiscordUrl, setSocialDiscordUrl] = useState("https://discord.gg/layerat");

  // Load cached CMS preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("layerat_cms_content");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
        if (parsed.heroSubtitle) setHeroSubtitle(parsed.heroSubtitle);
        if (parsed.aboutHeadline) setAboutHeadline(parsed.aboutHeadline);
        if (parsed.aboutMission) setAboutMission(parsed.aboutMission);
        if (parsed.guidelinesText) setGuidelinesText(parsed.guidelinesText);
        if (parsed.privacyPolicyText) setPrivacyPolicyText(parsed.privacyPolicyText);
        if (parsed.termsText) setTermsText(parsed.termsText);
        if (parsed.bannerMessage) setBannerMessage(parsed.bannerMessage);
        if (parsed.metaTitleTemplate) setMetaTitleTemplate(parsed.metaTitleTemplate);
      }
    } catch (e) {
      console.error("Failed to load CMS content from storage:", e);
    }
  }, []);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    const cmsPayload = {
      heroTitle,
      heroSubtitle,
      heroPrimaryCtaText,
      heroPrimaryCtaLink,
      heroSecondaryCtaText,
      heroSecondaryCtaLink,
      featuredProjectId,
      statsCreatorsCount,
      statsMonographsCount,
      statsCountriesCount,
      aboutHeadline,
      aboutMission,
      aboutPillar1Title,
      aboutPillar1Desc,
      aboutPillar2Title,
      aboutPillar2Desc,
      aboutPillar3Title,
      aboutPillar3Desc,
      guidelinesHeadline,
      guidelinesMinResolution,
      guidelinesText,
      privacyPolicyText,
      termsText,
      legalLastUpdated,
      isBannerActive,
      bannerBadge,
      bannerMessage,
      bannerLink,
      metaTitleTemplate,
      metaDescription,
      socialTwitterHandle,
      socialInstagramUrl,
      socialDiscordUrl,
      lastUpdatedBy: "Super Admin",
      lastUpdatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("layerat_cms_content", JSON.stringify(cmsPayload));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save CMS payload:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold">
            <FileEdit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Master Platform CMS & Content Studio
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Direct editing control over all public pages: Homepage, About, Editorial Guidelines, Legal, Announcement Ribbon, and Meta SEO.
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 animate-in fade-in duration-200">
              <Check className="h-4 w-4" />
              <span>Published Live!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveCMS}
            className="flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Publish CMS Updates</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: "homepage" as const, label: "Homepage Hero & Stats", icon: Home },
          { id: "about" as const, label: "About Story & Pillars", icon: Layers },
          { id: "guidelines" as const, label: "Publishing Guidelines", icon: HelpCircle },
          { id: "legal" as const, label: "Privacy & Terms", icon: Shield },
          { id: "announcement" as const, label: "Top Ribbon Announcement", icon: Radio },
          { id: "seo" as const, label: "Global SEO & Social", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main CMS Form Sections */}
      <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-xs">
        {/* 1. HOMEPAGE CMS */}
        {activeTab === "homepage" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Homepage Hero & Headline Settings
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage the main value proposition, primary call to action, and spotlight monograph on the landing page.
                </p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Hero Monumental Headline (Bricolage Grotesque)
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Hero Sub-Narrative Description
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroPrimaryCtaText}
                    onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Primary CTA Link Target
                  </label>
                  <input
                    type="text"
                    value={heroPrimaryCtaLink}
                    onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hero Spotlight Project */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Homepage Spotlight Monograph (Hero Pinned Showcase)
                </label>
                <select
                  value={featuredProjectId}
                  onChange={(e) => setFeaturedProjectId(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — By {p.creator?.displayName || "Studio"} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Counters Overrides */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Platform Impact Stat Badges (Hero Counter Display)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400">Creators Count</span>
                    <input
                      type="text"
                      value={statsCreatorsCount}
                      onChange={(e) => setStatsCreatorsCount(e.target.value)}
                      className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400">Monographs Count</span>
                    <input
                      type="text"
                      value={statsMonographsCount}
                      onChange={(e) => setStatsMonographsCount(e.target.value)}
                      className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400">Countries Reach</span>
                    <input
                      type="text"
                      value={statsCountriesCount}
                      onChange={(e) => setStatsCountriesCount(e.target.value)}
                      className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABOUT US CMS */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  About Page Narrative & Editorial Pillars
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage the manifesto, founding premise, and key creative pillars at /about.
                </p>
              </div>
              <Link
                href="/about"
                target="_blank"
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  About Hero Headline
                </label>
                <input
                  type="text"
                  value={aboutHeadline}
                  onChange={(e) => setAboutHeadline(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Core Manifesto & Philosophy
                </label>
                <textarea
                  rows={4}
                  value={aboutMission}
                  onChange={(e) => setAboutMission(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <div className="space-y-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Pillar 01</span>
                  <input
                    type="text"
                    value={aboutPillar1Title}
                    onChange={(e) => setAboutPillar1Title(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-xs font-bold text-neutral-900 dark:text-neutral-100"
                  />
                  <textarea
                    rows={3}
                    value={aboutPillar1Desc}
                    onChange={(e) => setAboutPillar1Desc(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-[11px] text-neutral-700 dark:text-neutral-300"
                  />
                </div>

                <div className="space-y-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Pillar 02</span>
                  <input
                    type="text"
                    value={aboutPillar2Title}
                    onChange={(e) => setAboutPillar2Title(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-xs font-bold text-neutral-900 dark:text-neutral-100"
                  />
                  <textarea
                    rows={3}
                    value={aboutPillar2Desc}
                    onChange={(e) => setAboutPillar2Desc(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-[11px] text-neutral-700 dark:text-neutral-300"
                  />
                </div>

                <div className="space-y-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Pillar 03</span>
                  <input
                    type="text"
                    value={aboutPillar3Title}
                    onChange={(e) => setAboutPillar3Title(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-xs font-bold text-neutral-900 dark:text-neutral-100"
                  />
                  <textarea
                    rows={3}
                    value={aboutPillar3Desc}
                    onChange={(e) => setAboutPillar3Desc(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 text-[11px] text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EDITORIAL GUIDELINES CMS */}
        {activeTab === "guidelines" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Publishing & Visual Excellence Guidelines
                </h3>
                <p className="text-xs text-neutral-500">
                  Define requirements for creator monograph submissions at /guidelines.
                </p>
              </div>
              <Link
                href="/guidelines"
                target="_blank"
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Guidelines Headline
                </label>
                <input
                  type="text"
                  value={guidelinesHeadline}
                  onChange={(e) => setGuidelinesHeadline(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Asset Minimum Resolution Standard
                </label>
                <input
                  type="text"
                  value={guidelinesMinResolution}
                  onChange={(e) => setGuidelinesMinResolution(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Publishing Rules & Protocol (Markdown supported)
                </label>
                <textarea
                  rows={8}
                  value={guidelinesText}
                  onChange={(e) => setGuidelinesText(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. LEGAL & POLICIES CMS */}
        {activeTab === "legal" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Legal, Privacy, & Terms of Service Content
                </h3>
                <p className="text-xs text-neutral-500">
                  Maintain creator IP sovereignty rules, privacy protection, and terms of service at /privacy and /terms.
                </p>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                Last Revision: {legalLastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Privacy Policy Core Clauses
                </label>
                <textarea
                  rows={5}
                  value={privacyPolicyText}
                  onChange={(e) => setPrivacyPolicyText(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Terms of Service & Licensing Framework
                </label>
                <textarea
                  rows={5}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. TOP ANNOUNCEMENT RIBBON */}
        {activeTab === "announcement" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Top Announcement Ribbon
                </h3>
                <p className="text-xs text-neutral-500">
                  Global notification banner shown at the absolute top of the website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <input
                  type="checkbox"
                  id="bannerToggle"
                  checked={isBannerActive}
                  onChange={(e) => setIsBannerActive(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                />
                <label htmlFor="bannerToggle" className="text-xs font-bold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                  Activate Top Announcement Ribbon Across Website
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. GLOBAL SEO & SOCIAL CMS */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Global SEO Metadata & OpenGraph Social Links
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure search engine snippet previews, title templates, and official social channels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Default Title Tag
                </label>
                <input
                  type="text"
                  value={metaTitleTemplate}
                  onChange={(e) => setMetaTitleTemplate(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Twitter / X Handle
                  </label>
                  <input
                    type="text"
                    value={socialTwitterHandle}
                    onChange={(e) => setSocialTwitterHandle(e.target.value)}
                    className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={socialInstagramUrl}
                    onChange={(e) => setSocialInstagramUrl(e.target.value)}
                    className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Discord Community URL
                  </label>
                  <input
                    type="text"
                    value={socialDiscordUrl}
                    onChange={(e) => setSocialDiscordUrl(e.target.value)}
                    className="w-full rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
