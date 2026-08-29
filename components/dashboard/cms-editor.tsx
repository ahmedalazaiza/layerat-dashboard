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
    "homepage" | "about" | "guidelines" | "legal" | "team" | "announcement" | "seo"
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
        if (parsed.bannerMessage) setBannerMessage(parsed.bannerMessage);
      }
    } catch {}
  }, []);

  const handleSaveCMS = () => {
    try {
      const payload = {
        heroTitle,
        heroSubtitle,
        heroPrimaryCtaText,
        heroPrimaryCtaLink,
        heroSecondaryCtaText,
        heroSecondaryCtaLink,
        featuredProjectId,
        aboutHeadline,
        aboutMission,
        guidelinesHeadline,
        guidelinesText,
        privacyPolicyText,
        termsText,
        bannerBadge,
        bannerMessage,
        bannerLink,
        isBannerActive,
        metaTitleTemplate,
        metaDescription,
        socialTwitterHandle,
      };
      localStorage.setItem("layerat_cms_content", JSON.stringify(payload));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save CMS content:", err);
    }
  };

  const tabs = [
    { id: "homepage", label: "Homepage & Hero", icon: Home },
    { id: "about", label: "About Us & Story", icon: FileText },
    { id: "guidelines", label: "Curation Guidelines", icon: CheckCircle2 },
    { id: "legal", label: "Legal, Privacy & Terms", icon: Shield },
    { id: "announcement", label: "Top Global Banner", icon: Radio },
    { id: "seo", label: "Global SEO & Socials", icon: Globe },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Super Admin CMS Header Banner */}
      <div className="rounded-[24px] border border-red-500/30 bg-gradient-to-br from-[var(--bg-elevated)] to-red-500/5 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-black font-bold shadow-xs">
            <FileEdit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--content-primary)]">
                Master Platform CMS & Content Administration
              </h2>
              <span className="rounded bg-red-500 text-white px-2 py-0.2 text-[9px] font-mono uppercase font-extrabold">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-[var(--content-secondary)] mt-0.5">
              Live content control across all public pages, hero displays, legal guidelines, and global announcements.
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleSaveCMS}
          className="flex items-center justify-center gap-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] px-6 py-2.5 text-xs font-bold text-white dark:text-[var(--primary-forest-green)] hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Published Live to Platform!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save & Publish Changes</span>
            </>
          )}
        </button>
      </div>

      {/* CMS Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-neutral)]/60">
        {tabs.map((tab) => {
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
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive && "text-[var(--accent)]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main CMS Form Sections */}
      <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-xs">
        {/* ========================================================================= */}
        {/* 1. HOMEPAGE CMS */}
        {/* ========================================================================= */}
        {activeTab === "homepage" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  Homepage Hero & Headline Settings
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Manage the main value proposition, primary call to action, and spotlight monograph on the landing page.
                </p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Hero Monumental Headline (Bricolage Grotesque)
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-bold text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Hero Sub-Narrative Description
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] focus:border-[var(--content-primary)] focus:outline-none leading-relaxed"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroPrimaryCtaText}
                    onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                    className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                    Primary CTA Link Target
                  </label>
                  <input
                    type="text"
                    value={heroPrimaryCtaLink}
                    onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                    className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Hero Spotlight Project */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-neutral)]/60">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Homepage Spotlight Monograph (Hero Pinned Showcase)
                </label>
                <select
                  value={featuredProjectId}
                  onChange={(e) => setFeaturedProjectId(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-semibold text-[var(--content-primary)] focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — By {p.creator?.displayName || "Studio"} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Counters Overrides */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-neutral)]/60">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Platform Impact Stat Badges (Hero Counter Display)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)]">Creators Count</span>
                    <input
                      type="text"
                      value={statsCreatorsCount}
                      onChange={(e) => setStatsCreatorsCount(e.target.value)}
                      className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono font-bold text-[var(--content-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)]">Monographs Count</span>
                    <input
                      type="text"
                      value={statsMonographsCount}
                      onChange={(e) => setStatsMonographsCount(e.target.value)}
                      className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono font-bold text-[var(--content-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)]">Countries Reach</span>
                    <input
                      type="text"
                      value={statsCountriesCount}
                      onChange={(e) => setStatsCountriesCount(e.target.value)}
                      className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono font-bold text-[var(--content-primary)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. ABOUT US CMS */}
        {/* ========================================================================= */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  About Us & Studio Ethos Content (`/about`)
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Edit the founding story, editorial pillars, and platform manifesto.
                </p>
              </div>
              <Link
                href="/about"
                target="_blank"
                className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  About Page Headline
                </label>
                <input
                  type="text"
                  value={aboutHeadline}
                  onChange={(e) => setAboutHeadline(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-bold text-[var(--content-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Core Mission & Story Manifesto
                </label>
                <textarea
                  rows={4}
                  value={aboutMission}
                  onChange={(e) => setAboutMission(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] leading-relaxed"
                />
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-neutral)]/60">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  3 Editorial Pillars
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3.5 space-y-2">
                    <input
                      type="text"
                      value={aboutPillar1Title}
                      onChange={(e) => setAboutPillar1Title(e.target.value)}
                      className="w-full font-bold text-xs bg-transparent border-b border-[var(--border-neutral)] pb-1"
                    />
                    <textarea
                      rows={3}
                      value={aboutPillar1Desc}
                      onChange={(e) => setAboutPillar1Desc(e.target.value)}
                      className="w-full text-[11px] bg-transparent text-[var(--content-secondary)] resize-none"
                    />
                  </div>

                  <div className="rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3.5 space-y-2">
                    <input
                      type="text"
                      value={aboutPillar2Title}
                      onChange={(e) => setAboutPillar2Title(e.target.value)}
                      className="w-full font-bold text-xs bg-transparent border-b border-[var(--border-neutral)] pb-1"
                    />
                    <textarea
                      rows={3}
                      value={aboutPillar2Desc}
                      onChange={(e) => setAboutPillar2Desc(e.target.value)}
                      className="w-full text-[11px] bg-transparent text-[var(--content-secondary)] resize-none"
                    />
                  </div>

                  <div className="rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)] p-3.5 space-y-2">
                    <input
                      type="text"
                      value={aboutPillar3Title}
                      onChange={(e) => setAboutPillar3Title(e.target.value)}
                      className="w-full font-bold text-xs bg-transparent border-b border-[var(--border-neutral)] pb-1"
                    />
                    <textarea
                      rows={3}
                      value={aboutPillar3Desc}
                      onChange={(e) => setAboutPillar3Desc(e.target.value)}
                      className="w-full text-[11px] bg-transparent text-[var(--content-secondary)] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. GUIDELINES CMS */}
        {/* ========================================================================= */}
        {activeTab === "guidelines" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  Curation & Submission Guidelines (`/guidelines`)
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Set the standard for approved monographs, resolution rules, and design ethics.
                </p>
              </div>
              <Link
                href="/guidelines"
                target="_blank"
                className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center gap-1"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Guidelines Section Title
                </label>
                <input
                  type="text"
                  value={guidelinesHeadline}
                  onChange={(e) => setGuidelinesHeadline(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-bold text-[var(--content-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Minimum Image Resolution Requirement
                </label>
                <input
                  type="text"
                  value={guidelinesMinResolution}
                  onChange={(e) => setGuidelinesMinResolution(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Detailed Submission Requirements (Markdown Supported)
                </label>
                <textarea
                  rows={6}
                  value={guidelinesText}
                  onChange={(e) => setGuidelinesText(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. LEGAL & PRIVACY CMS */}
        {/* ========================================================================= */}
        {activeTab === "legal" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  Privacy Policy & Terms of Service (`/privacy` & `/terms`)
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Update legal clauses, copyright terms, and creator data protection statements.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Privacy Policy Statement (`/privacy`)
                </label>
                <textarea
                  rows={4}
                  value={privacyPolicyText}
                  onChange={(e) => setPrivacyPolicyText(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Terms of Service & License Agreement (`/terms`)
                </label>
                <textarea
                  rows={4}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Legal Last Modified Date
                </label>
                <input
                  type="text"
                  value={legalLastUpdated}
                  onChange={(e) => setLegalLastUpdated(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-mono font-bold text-[var(--content-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. GLOBAL ANNOUNCEMENT BANNER CMS */}
        {/* ========================================================================= */}
        {activeTab === "announcement" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  Global Sticky Top Announcement Bar
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Display high-visibility promotional ribbons across all public pages.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--content-primary)]">
                  {isBannerActive ? "Banner Live" : "Banner Hidden"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBannerActive(!isBannerActive)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    isBannerActive ? "bg-emerald-500" : "bg-[var(--bg-neutral)]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                      isBannerActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-bold">
                Live Ribbon Visual Preview
              </label>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary-forest-green)] dark:bg-[#090C09] border border-[var(--border-neutral)] text-white p-3 text-xs font-semibold shadow-xs">
                <span className="rounded-full bg-[var(--accent)] text-black px-2 py-0.5 text-[10px] font-bold font-mono">
                  {bannerBadge}
                </span>
                <span>{bannerMessage}</span>
                <span className="text-[var(--accent)] underline ml-1">Learn More →</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Badge Tag Label
                </label>
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-bold text-[var(--content-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Link Target URL
                </label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs font-medium text-[var(--content-primary)]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Announcement Body Text
                </label>
                <input
                  type="text"
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-medium text-[var(--content-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. GLOBAL SEO & SOCIALS CMS */}
        {/* ========================================================================= */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-neutral)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--content-primary)]">
                  Global Metadata, OpenGraph & Social Channels
                </h3>
                <p className="text-xs text-[var(--content-tertiary)]">
                  Control search engine index snippets and community links in the footer.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Default Platform Page Title
                </label>
                <input
                  type="text"
                  value={metaTitleTemplate}
                  onChange={(e) => setMetaTitleTemplate(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-4 py-2.5 text-xs font-bold text-[var(--content-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                  Global Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] leading-relaxed"
                />
              </div>

              {/* Social URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[var(--border-neutral)]/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[var(--content-tertiary)] font-bold">𝕏 (Twitter) Handle</span>
                  <input
                    type="text"
                    value={socialTwitterHandle}
                    onChange={(e) => setSocialTwitterHandle(e.target.value)}
                    className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono text-[var(--content-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[var(--content-tertiary)] font-bold">Instagram URL</span>
                  <input
                    type="url"
                    value={socialInstagramUrl}
                    onChange={(e) => setSocialInstagramUrl(e.target.value)}
                    className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono text-[var(--content-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[var(--content-tertiary)] font-bold">Discord Invite</span>
                  <input
                    type="url"
                    value={socialDiscordUrl}
                    onChange={(e) => setSocialDiscordUrl(e.target.value)}
                    className="w-full rounded-[10px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3 py-1.5 text-xs font-mono text-[var(--content-primary)]"
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
