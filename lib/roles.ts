// =============================================================================
// LAYERAT PLATFORM — ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS DEFINITION
// =============================================================================

export type PermissionKey =
  | "overview.view"
  | "projects.view"
  | "projects.edit"
  | "projects.delete"
  | "creators.view"
  | "creators.verify"
  | "creators.suspend"
  | "comments.moderate"
  | "cms.edit"
  | "taxonomy.manage"
  | "media.manage"
  | "ai.manage"
  | "notifications.broadcast"
  | "settings.manage"
  | "roles.manage";

export interface RoleDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  isSystem?: boolean;
  permissions: PermissionKey[];
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  roleId: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
  createdAt: string;
  customPermissions?: PermissionKey[];
}

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; module: string; description: string }[] = [
  { key: "overview.view", label: "View Analytics Hub", module: "Overview", description: "Access overview KPI metrics and live telemetry stream" },
  { key: "projects.view", label: "View Monographs", module: "Projects", description: "Browse all platform case studies and drafts" },
  { key: "projects.edit", label: "Edit & Publish Monographs", module: "Projects", description: "Force publish, feature on staff picks, and edit project metadata" },
  { key: "projects.delete", label: "Delete Monographs", module: "Projects", description: "Permanently delete projects and purge media" },
  { key: "creators.view", label: "View User Accounts", module: "Creators", description: "Inspect creator directory and studio profiles" },
  { key: "creators.verify", label: "Toggle Verified Badge", module: "Creators", description: "Grant or revoke official verified studio badges" },
  { key: "creators.suspend", label: "Suspend User Accounts", module: "Creators", description: "Freeze or ban violating creator accounts" },
  { key: "comments.moderate", label: "Moderate Critiques", module: "Moderation", description: "Pin, delete, or flag discussion comments" },
  { key: "cms.edit", label: "Manage Website CMS", module: "CMS", description: "Edit homepage hero, about story, guidelines, legal policies & SEO" },
  { key: "taxonomy.manage", label: "Manage Master Taxonomy", module: "Taxonomy", description: "CRUD operations on 13 disciplines, tags, and tools" },
  { key: "media.manage", label: "Access Storage Vault", module: "Storage", description: "Inspect Supabase buckets, CDN URLs, and storage assets" },
  { key: "ai.manage", label: "AI Director Studio", module: "AI Lab", description: "Run Gemini Vision benchmarks and model diagnostics" },
  { key: "notifications.broadcast", label: "Send Announcements", module: "Broadcasts", description: "Dispatch global platform push alerts and notifications" },
  { key: "settings.manage", label: "System & Security Settings", module: "Settings", description: "Manage database connection, purge cache, and backup exports" },
  { key: "roles.manage", label: "Manage Roles & Admins", module: "Security", description: "Invite admins, assign roles, and configure permission matrix" },
];

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: "super_admin",
    name: "Super Admin (Root)",
    badge: "ROOT",
    description: "Unrestricted master access to all platform infrastructure, database backups, CMS, and admin management.",
    isSystem: true,
    permissions: [
      "overview.view",
      "projects.view",
      "projects.edit",
      "projects.delete",
      "creators.view",
      "creators.verify",
      "creators.suspend",
      "comments.moderate",
      "cms.edit",
      "taxonomy.manage",
      "media.manage",
      "ai.manage",
      "notifications.broadcast",
      "settings.manage",
      "roles.manage",
    ],
  },
  {
    id: "platform_admin",
    name: "Platform Operations Admin",
    badge: "ADMIN",
    description: "Operational management of projects, users, CMS, comments, and global announcements.",
    isSystem: true,
    permissions: [
      "overview.view",
      "projects.view",
      "projects.edit",
      "creators.view",
      "creators.verify",
      "creators.suspend",
      "comments.moderate",
      "cms.edit",
      "taxonomy.manage",
      "media.manage",
      "notifications.broadcast",
    ],
  },
  {
    id: "editorial_director",
    name: "Editorial Director / Curator",
    badge: "CURATOR",
    description: "Curation oversight: feature staff picks, edit monographs, manage homepage CMS, and inspect submissions.",
    isSystem: true,
    permissions: [
      "overview.view",
      "projects.view",
      "projects.edit",
      "comments.moderate",
      "cms.edit",
      "media.manage",
    ],
  },
  {
    id: "community_moderator",
    name: "Community & Critique Lead",
    badge: "MOD",
    description: "Content moderation queue: review comments, handle flagged projects, and verify studios.",
    isSystem: true,
    permissions: [
      "overview.view",
      "projects.view",
      "creators.view",
      "creators.verify",
      "comments.moderate",
    ],
  },
  {
    id: "ai_technical_lead",
    name: "AI & Technical Specialist",
    badge: "TECH",
    description: "Manages Gemini Multimodal AI benchmarks, storage vaults, and telemetry diagnostics.",
    isSystem: true,
    permissions: [
      "overview.view",
      "media.manage",
      "ai.manage",
      "taxonomy.manage",
    ],
  },
];

export const DEFAULT_CUSTOM_ROLES: RoleDefinition[] = [
  {
    id: "role-critique-lead",
    name: "Critique & Review Lead",
    badge: "REVIEW",
    description: "Evaluates studio monographs, verifies design documentation standards, and curates design feedback.",
    isSystem: false,
    permissions: ["projects.view", "creators.view", "comments.moderate"],
  },
  {
    id: "role-brand-custodian",
    name: "Brand & Taxonomy Custodian",
    badge: "BRAND",
    description: "Supervises creative disciplines, software tools list, platform guidelines, and media storage.",
    isSystem: false,
    permissions: ["taxonomy.manage", "media.manage", "cms.edit"],
  },
];

export const INITIAL_ADMIN_MEMBERS: AdminMember[] = [
  {
    id: "2d6ea33a-fc53-4b4c-bf82-40db29b3b998",
    name: "Ahmed Al-Azaiza",
    email: "ahmedazy.uxui@gmail.com",
    username: "ahmed_al_azaiza",
    avatarUrl: "https://ttjobsgglwgyioqlldqj.supabase.co/storage/v1/object/public/avatars/avatars/1788444338918-hid4ogb.webp",
    roleId: "super_admin",
    status: "active",
    lastActive: "Active now",
    createdAt: "2026-09-03",
  },
  {
    id: "91d16866-1a9c-4bd8-9ada-07bd0307cce9",
    name: "Israa Zorob",
    email: "israa_zorob@layerat.com",
    username: "israa_zorob",
    avatarUrl: "https://ttjobsgglwgyioqlldqj.supabase.co/storage/v1/object/public/avatars/avatars/1788445372684-sjarzzy.webp",
    roleId: "editorial_director",
    status: "active",
    lastActive: "Active today",
    createdAt: "2026-09-03",
  },
  {
    id: "f9fe1e80-b5b5-4b95-a98d-85ebdc5d1d26",
    name: "sarah elgarousha",
    email: "sarah_elgarousha@layerat.com",
    username: "sarah_elgarousha",
    avatarUrl: "/default-avatar.svg",
    roleId: "curator",
    status: "active",
    lastActive: "Yesterday",
    createdAt: "2026-09-02",
  },
  {
    id: "f9057561-87e7-4302-b7df-87957a41e8c1",
    name: "Saphie",
    email: "saphie@layerat.com",
    username: "saphie",
    avatarUrl: "/default-avatar.svg",
    roleId: "community_moderator",
    status: "active",
    lastActive: "Active today",
    createdAt: "2026-09-02",
  },
];

// =============================================================================
// LAYERAT MASTER BLUEPRINT RBAC MATRIX
// =============================================================================

import { UserRole } from "./types";

export type BlueprintModule =
  | "analytics"
  | "settings"
  | "featured"
  | "creators"
  | "roles"
  | "users"
  | "collections"
  | "moderation"
  | "taxonomy"
  | "legal";

export const RBAC_MATRIX: Record<UserRole, Record<BlueprintModule, "Full" | "Read" | "None">> = {
  admin: {
    analytics: "Full",
    settings: "Full",
    featured: "Full",
    creators: "Full",
    roles: "Full",
    users: "Full",
    collections: "Full",
    moderation: "Full",
    taxonomy: "Full",
    legal: "Full",
  },
  curator: {
    analytics: "Read",
    settings: "None",
    featured: "Full",
    creators: "Read",
    roles: "None",
    users: "Read",
    collections: "Full",
    moderation: "Read",
    taxonomy: "Read",
    legal: "None",
  },
  moderator: {
    analytics: "Read",
    settings: "None",
    featured: "Read",
    creators: "Read",
    roles: "None",
    users: "Read",
    collections: "None",
    moderation: "Full",
    taxonomy: "None",
    legal: "None",
  },
  member: {
    analytics: "None",
    settings: "None",
    featured: "None",
    creators: "None",
    roles: "None",
    users: "None",
    collections: "None",
    moderation: "None",
    taxonomy: "None",
    legal: "None",
  },
};

export function canAccessModule(role: UserRole = "admin", module: BlueprintModule): boolean {
  const access = RBAC_MATRIX[role]?.[module] ?? "None";
  return access !== "None";
}

export function canMutateModule(role: UserRole = "admin", module: BlueprintModule): boolean {
  const access = RBAC_MATRIX[role]?.[module] ?? "None";
  return access === "Full";
}

export function getModuleAccess(role: UserRole = "admin", module: BlueprintModule): "Full" | "Read" | "None" {
  return RBAC_MATRIX[role]?.[module] ?? "None";
}

