export * from "./taxonomy";

export type UserRole = "admin" | "curator" | "moderator" | "member";

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl: string;
  bio: string;
  location: string;
  city: string;
  website?: string;
  skills: string[];
  role?: UserRole;
  customBadge?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  isSuspended?: boolean;
  followersCount?: number;
  totalProjectsCount?: number;
  isCurrentUser?: boolean;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface Comment {
  id: string;
  author: Creator;
  content: string;
  createdAt: string;
}

export type MasterProjectCategory =
  | "User Interface Design (UI)"
  | "User Experience Design (UX)"
  | "Graphic Design"
  | "Brand Identity"
  | "Motion Design"
  | "3D Design"
  | "Illustration"
  | "Game Design"
  | "AR/VR & Spatial Design"
  | "Industrial & Physical Product Design"
  | "Animation (2D & Traditional)"
  | "Type Design & Lettering"
  | "Presentation & Information Design";

export type LegacyProjectCategory =
  | "UI"
  | "Brand"
  | "Photo"
  | "Editorial"
  | "3D & Motion"
  | "Product"
  | "Architecture"
  | "Type";

export type ProjectCategory = MasterProjectCategory | LegacyProjectCategory | string;

export type ProjectMedium =
  | "Image"
  | "Video"
  | "PDF/Case study"
  | "Prototype"
  | "3D"
  | string;

export type ProjectBadge = "Staff Pick" | "Project of the Day" | "Best of Month" | null;

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  galleryImages: string[];
  creator: Creator;
  tags: string[];
  tools: string[];
  category: ProjectCategory;
  subCategory?: string;
  medium: ProjectMedium;
  published: boolean;
  isPublished?: boolean; // Blueprint alias
  publishedAt: string;
  appreciations: number;
  viewCount?: number;
  featured?: boolean;
  featuredOrder?: number | null;
  badge?: ProjectBadge;
  comments: Comment[];
}

export type NotificationType = "appreciation" | "comment" | "follow" | "publish";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: Creator;
  project?: {
    id: string;
    slug: string;
    title: string;
  };
  content?: string;
  createdAt: string;
  read: boolean;
}

// =============================================================================
// LAYERAT ADMIN & CURATION DASHBOARD SPECIFICATION TYPES
// =============================================================================

export interface PlatformSettings {
  id: "global";
  announcementBannerActive: boolean;
  announcementBannerText: string;
  announcementBannerLink: string;
  allowSignups: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableCollections: boolean;
  maxUploadSizeMb: number;
  updatedAt: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  projectIds: string[];
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ReportReason =
  | "copyright"
  | "inappropriate_content"
  | "spam"
  | "harassment"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: string;
  projectId: string;
  project?: Project;
  reporterId?: string;
  reporter?: Creator;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subCategories: string[];
  softwareTools: string[];
  recommendedTags: string[];
  sortOrder: number;
}

export interface LegalDocumentSection {
  id: string;
  title: string;
  content: string;
  points?: string[];
}

export type LegalDocType = "terms" | "privacy" | "guidelines";

export interface LegalDocument {
  id: LegalDocType;
  title: string;
  subtitle: string;
  version: string;
  summary: string;
  sections: LegalDocumentSection[];
  updatedAt: string;
}

export interface VitalityMetrics {
  totalCreators: number;
  activeCreators30D: number;
  publishedMonographs: number;
  totalAppreciations: number;
  totalViews: number;
  pendingReportsCount: number;
  storageConsumedMb: number;
}
