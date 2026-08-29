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

export const INITIAL_ADMIN_MEMBERS: AdminMember[] = [
  {
    id: "admin-1",
    name: "Ahmed Al-Azaiza",
    email: "ahmed@layerat.com",
    username: "ahmed_al_azaiza",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    roleId: "super_admin",
    status: "active",
    lastActive: "Just now",
    createdAt: "2026-08-01",
  },
  {
    id: "admin-2",
    name: "Ameera Hamada",
    email: "ameera@layerat.com",
    username: "ameera_hamada_1",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    roleId: "editorial_director",
    status: "active",
    lastActive: "2 hours ago",
    createdAt: "2026-08-10",
  },
  {
    id: "admin-3",
    name: "Kareem Editorial",
    email: "kareem@layerat.com",
    username: "kareem_curator",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    roleId: "community_moderator",
    status: "active",
    lastActive: "Yesterday",
    createdAt: "2026-08-15",
  },
];
