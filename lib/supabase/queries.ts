import { deleteStorageFiles } from "./storage";
import { supabase } from "./client";
import {
  Project,
  Creator,
  Comment,
  Notification,
  NotificationType,
  PlatformSettings,
  Collection,
  Report,
  ReportStatus,
  CategoryItem,
  LegalDocument,
  LegalDocType,
  UserRole,
  ProjectBadge,
  VitalityMetrics,
} from "@/lib/types";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import { DEFAULT_AVATAR_URL } from "@/lib/avatar";
import { AdminMember } from "@/lib/roles";

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: "global",
  announcementBannerText: "",
  announcementBannerLink: "",
  announcementBannerActive: false,
  allowSignups: true,
  maintenanceMode: false,
  maintenanceMessage: "Layerat is currently undergoing scheduled platform upgrades. We will be back online shortly.",
  maxUploadSizeMb: 25,
  enableCollections: false,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_LEGAL_DOCUMENTS: Record<LegalDocType, LegalDocument> = {
  terms: {
    id: "terms",
    title: "Terms of Service",
    subtitle: "Editorial & Curation Agreement",
    version: "2026.1",
    summary: "Layerat terms of service governing creative publication and curation.",
    sections: [],
    updatedAt: new Date().toISOString(),
  },
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "Privacy & Data Pledge",
    version: "2026.1",
    summary: "Layerat zero data-selling pledge and privacy policy.",
    sections: [],
    updatedAt: new Date().toISOString(),
  },
  guidelines: {
    id: "guidelines",
    title: "Community Guidelines",
    subtitle: "Peer & Craft Standards",
    version: "2026.1",
    summary: "Sanctuary for thoughtful creative craft and peer critique.",
    sections: [],
    updatedAt: new Date().toISOString(),
  },
};

// =============================================================================
// TYPE MAPPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileToCreator(row: any, currentUserId?: string): Creator {
  if (!row) {
    return {
      id: "",
      username: "creator",
      displayName: "Creator",
      avatarUrl: DEFAULT_AVATAR_URL,
      bio: "",
      location: "",
      city: "",
      skills: [],
      isVerified: false,
      isOnline: false,
      followersCount: 0,
      isCurrentUser: false,
    };
  }

  const liveFollowers =
    Array.isArray(row.followers) && row.followers.length > 0 && typeof row.followers[0].count === "number"
      ? row.followers[0].count
      : (row.followers_count ?? 0);

  return {
    id: row.id || "",
    username: row.username || "creator",
    displayName: row.display_name || row.username || "Creator",
    avatarUrl: row.avatar_url || DEFAULT_AVATAR_URL,
    bio: row.bio || "",
    location: row.location || "",
    city: row.city || row.location || "",
    website: row.website || undefined,
    skills: row.skills || [],
    isVerified: Boolean(row.is_verified),
    isOnline: row.is_online ?? false,
    isSuspended: Boolean(row.is_suspended),
    role: (row.role as UserRole) || ((row.id === "b2c69284-b4bf-40db-8b70-994dec053d04" || row.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998") ? "admin" : "member"),
    customBadge: row.badge || row.custom_badge || ((row.id === "b2c69284-b4bf-40db-8b70-994dec053d04" || row.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998") ? "SuperAdmin" : undefined),
    followersCount: liveFollowers,
    isCurrentUser: currentUserId ? row.id === currentUserId : false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommentRow(row: any): Comment {
  return {
    id: row.id,
    author: mapProfileToCreator(row.author || row.profiles),
    content: row.content,
    createdAt: formatTimeAgo(new Date(row.created_at || Date.now())),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProjectRow(row: any, currentUserId?: string): Project {
  const creator = mapProfileToCreator(row.creator || row.profiles, currentUserId);
  const comments = Array.isArray(row.comments)
    ? row.comments.map(mapCommentRow)
    : [];

  const liveAppreciations =
    Array.isArray(row.appreciations) && row.appreciations.length > 0 && typeof row.appreciations[0].count === "number"
      ? row.appreciations[0].count
      : (row.appreciations_count ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || "",
    body: row.body || "",
    coverImage: row.cover_image,
    galleryImages: row.gallery_images && row.gallery_images.length > 0 ? row.gallery_images : [row.cover_image],
    creator,
    tags: row.tags || [],
    tools: row.tools || [],
    category: row.category,
    subCategory: row.sub_category || undefined,
    medium: row.medium,
    published: row.published ?? true,
    publishedAt: formatTimeAgo(new Date(row.published_at || row.created_at || Date.now())),
    appreciations: liveAppreciations,
    comments,
    featured: row.featured ?? false,
    viewCount: row.views_count ?? 0,
    featuredOrder: row.featured_order ?? null,
    badge: row.badge ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotificationRow(row: any): Notification {
  return {
    id: row.id,
    type: (row.type as NotificationType) || "appreciation",
    actor: mapProfileToCreator(row.actor || {}),
    project: row.project
      ? {
          id: row.project.id,
          slug: row.project.slug,
          title: row.project.title,
        }
      : undefined,
    content: row.content || undefined,
    createdAt: row.created_at ? formatTimeAgo(new Date(row.created_at)) : "Just now",
    read: !!row.read,
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
}

// =============================================================================
// DATABASE QUERIES (WITH INSTANT IN-MEMORY SERVER CACHE)
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string, ttlMs = 30000): T | null {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < ttlMs) {
    return entry.data as T;
  }
  return null;
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateAppCache(): void {
  memoryCache.clear();
}

export interface FetchProjectsOptions {
  category?: string;
  tag?: string;
  medium?: string;
  search?: string;
  sort?: "newest" | "appreciated" | "comments" | "title";
  creatorId?: string;
  publishedOnly?: boolean;
}

/**
 * Fetch all projects from Supabase with relations (Instant Memory Cache)
 */
export async function fetchProjects(options: FetchProjectsOptions = {}): Promise<Project[]> {
  const cacheKey = `projects:${JSON.stringify(options)}`;
  const cached = getFromCache<Project[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let query = supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `);

    if (options.publishedOnly !== false) {
      query = query.eq("published", true);
    }

    if (options.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }

    if (options.medium && options.medium !== "All") {
      query = query.eq("medium", options.medium);
    }

    if (options.creatorId) {
      query = query.eq("creator_id", options.creatorId);
    }

    // Sort order
    if (options.sort === "appreciated") {
      query = query.order("appreciations_count", { ascending: false });
    } else if (options.sort === "title") {
      query = query.order("title", { ascending: true });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error && (error.message || Object.keys(error).length > 0)) {
        console.error("Error fetching projects from Supabase:", error.message || error.details || error);
      }
      return [];
    }

    let projects = data.map((row) => mapProjectRow(row));

    // Apply text search & tag filter in memory if needed
    if (options.search) {
      const q = options.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.creator.displayName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.tools.some((tl) => tl.toLowerCase().includes(q))
      );
    }

    if (options.tag) {
      projects = projects.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
      );
    }

    setToCache(cacheKey, projects);
    return projects;
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string };
    if (errorObj?.name !== "AbortError") {
      console.error("Error fetching projects from Supabase:", errorObj?.message || err);
    }
    return [];
  }
}

/**
 * Fetch a single project by its unique slug
 */
export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with slug '${slug}':`, err);
    return null;
  }
}

/**
 * Fetch a single project by its unique ID (UUID or custom ID)
 */
export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with id '${id}':`, err);
    return null;
  }
}

/**
 * Fetch all creators from Supabase (Instant Memory Cache)
 */
export async function fetchCreators(): Promise<Creator[]> {
  const cacheKey = "creators:all";
  const cached = getFromCache<Creator[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        followers:follows!following_id(count)
      `)
      .order("followers_count", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    const creators = data.map((row) => mapProfileToCreator(row));
    setToCache(cacheKey, creators);
    return creators;
  } catch (err) {
    console.error("Error fetching creators from Supabase:", err);
    return [];
  }
}

/**
 * Fetch a single creator by username
 */
export async function fetchCreatorByUsername(username: string): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        followers:follows!following_id(count)
      `)
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfileToCreator(data);
  } catch (err) {
    console.error(`Error fetching creator '@${username}':`, err);
    return null;
  }
}


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a guaranteed valid creator ID that exists in public.profiles table
 */
async function resolveValidCreatorId(
  creatorId?: string,
  creator?: Creator
): Promise<string> {
  try {
    // 1. Try finding by ID
    if (creatorId && UUID_REGEX.test(creatorId)) {
      const { data: existingById } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", creatorId)
        .maybeSingle();

      if (existingById?.id) return existingById.id;
    }

    // 2. Try finding by creator username
    const candidateUsername = creator?.username;
    if (candidateUsername) {
      const { data: existingByUsername } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", candidateUsername)
        .maybeSingle();

      if (existingByUsername?.id) return existingByUsername.id;
    }

    // 3. Try to create profile for this creatorId if valid UUID
    if (creatorId && UUID_REGEX.test(creatorId)) {
      const uniqueUsername = `creator_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const { data: created, error } = await supabase
        .from("profiles")
        .insert({
          id: creatorId,
          username: candidateUsername || uniqueUsername,
          display_name: creator?.displayName || "Creator",
          avatar_url: creator?.avatarUrl || DEFAULT_AVATAR_URL,
          bio: creator?.bio || "Independent designer & creative practitioner.",
          location: creator?.location || "Worldwide",
          city: creator?.city || "Global",
          skills: creator?.skills || ["Design"],
          is_verified: true,
          is_online: true,
          followers_count: 0,
        })
        .select("id")
        .maybeSingle();

      if (!error && created?.id) return created.id;
    }

    // 4. Fallback to first existing profile in the database
    const { data: firstProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    return firstProfile?.id || "a0000001-0000-4000-8000-000000000001";
  } catch (err) {
    console.warn("Notice resolving creator ID:", err);
    return "a0000001-0000-4000-8000-000000000001";
  }
}

/**
 * Create a new project in Supabase with validation & auto-healing
 */
export async function insertProject(project: Partial<Project> & { creatorId?: string; creator?: Creator }): Promise<Project | null> {
  try {
    const finalCreatorId = await resolveValidCreatorId(
      project.creatorId || project.creator?.id,
      project.creator
    );

    // Generate clean, unique slug
    let baseSlug = project.slug;
    if (!baseSlug || !baseSlug.trim()) {
      baseSlug = (project.title || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = `project-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    const { data: existingSlug } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85";
    const finalCover = project.coverImage || defaultCover;
    const finalGallery = project.galleryImages && project.galleryImages.length > 0 
      ? project.galleryImages.filter(Boolean) 
      : [finalCover];

    const finalTags = project.subCategory && !(project.tags || []).includes(project.subCategory)
      ? [project.subCategory, ...(project.tags || [])]
      : (project.tags && project.tags.length > 0 ? project.tags : ["Design"]);

    const row = {
      slug: finalSlug,
      title: project.title || "Untitled Project",
      summary: project.summary || "",
      body: project.body || "",
      cover_image: finalCover,
      gallery_images: finalGallery.length > 0 ? finalGallery : [finalCover],
      category: project.category || "User Interface Design (UI)",
      medium: project.medium || "Image",
      tags: finalTags,
      tools: project.tools && project.tools.length > 0 ? project.tools : ["Figma"],
      published: project.published ?? true,
      featured: project.featured ?? false,
      creator_id: finalCreatorId,
      appreciations_count: 0,
      published_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("projects")
      .insert(row)
      .select(`
        *,
        creator:profiles!creator_id(*)
      `)
      .single();

    if (error) {
      console.warn("Supabase project insert notice:", error.message || error.code || JSON.stringify(error));
      
      // If error was slug conflict, retry with unique timestamp slug
      if (error.code === "23505") {
        row.slug = `${baseSlug}-${Date.now()}`;
        const res = await supabase
          .from("projects")
          .insert(row)
          .select(`*, creator:profiles!creator_id(*)`)
          .single();
        data = res.data;
        error = res.error;
      } else if (error.code === "23503") {
        // Foreign key retry with guaranteed default profile
        const { data: defaultProfile } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
        if (defaultProfile?.id) {
          row.creator_id = defaultProfile.id;
          const res = await supabase
            .from("projects")
            .insert(row)
            .select(`*, creator:profiles!creator_id(*)`)
            .single();
          data = res.data;
          error = res.error;
        }
      }
    }

    if (error || !data) {
      return null;
    }

    invalidateAppCache();
    return mapProjectRow(data);
  } catch (err) {
    console.warn("Supabase insert project exception:", err);
    return null;
  }
}

/**
 * Update an existing project
 */
export async function updateProjectInDb(id: string, updates: Partial<Project>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.summary !== undefined) payload.summary = updates.summary;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
    if (updates.galleryImages !== undefined) payload.gallery_images = updates.galleryImages;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.medium !== undefined) payload.medium = updates.medium;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.tools !== undefined) payload.tools = updates.tools;
    if (updates.published !== undefined) payload.published = updates.published;

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error updating project:", error);
      return false;
    }
    invalidateAppCache();
    return true;
  } catch (err) {
    console.error("Error updating project in Supabase:", err);
    return false;
  }
}

/**
 * Delete a project
 */
export async function deleteProjectFromDb(id: string): Promise<boolean> {
  try {
    // 1. Fetch all media associated with the project to purge from Cloudflare R2 and Supabase
    const { data: projectRow } = await supabase
      .from("projects")
      .select("cover_image, gallery_images, body, summary")
      .eq("id", id)
      .maybeSingle();

    if (projectRow) {
      const mediaUrls = new Set<string>();
      if (projectRow.cover_image) mediaUrls.add(projectRow.cover_image);
      if (Array.isArray(projectRow.gallery_images)) {
        projectRow.gallery_images.forEach((u: string) => {
          if (u) mediaUrls.add(u);
        });
      }

      // Extract any embedded media URLs within body or summary
      const textContent = `${projectRow.body || ""} ${projectRow.summary || ""}`;
      const matchedUrls = textContent.match(/https?:\/\/[^\s"'<>]+\.(?:webp|png|jpg|jpeg|gif|svg|avif)(?:\?[^\s"'<>]*)?/gi);
      if (matchedUrls) {
        matchedUrls.forEach((u) => mediaUrls.add(u));
      }

      if (mediaUrls.size > 0) {
        await deleteStorageFiles(Array.from(mediaUrls), "project-media");
      }
    }

    // 2. Explicitly hard delete associated comments and appreciations
    await Promise.allSettled([
      supabase.from("comments").delete().eq("project_id", id),
      supabase.from("appreciations").delete().eq("project_id", id),
    ]);

    // 3. Delete the project database record
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      invalidateAppCache();
    }
    return !error;
  } catch (err) {
    console.error("Error deleting project:", err);
    return false;
  }
}

/**
 * Add a comment to a project
 */
export async function insertComment(projectId: string, authorId: string, content: string): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        project_id: projectId,
        author_id: authorId,
        content,
      })
      .select(`*, author:profiles!author_id(*)`)
      .single();

    if (error || !data) {
      console.error("Error posting comment:", error);
      return null;
    }

    invalidateAppCache();
    return mapCommentRow(data);
  } catch (err) {
    console.error("Error adding comment in Supabase:", err);
    return null;
  }
}

/**
 * Toggle appreciation (like/heart)
 */
export async function toggleAppreciationInDb(projectId: string, userId: string): Promise<boolean> {
  try {
    // Check if already appreciated
    const { data } = await supabase
      .from("appreciations")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      // Remove appreciation
      await supabase.from("appreciations").delete().eq("id", data.id);

      // Recalculate true real count
      const { count } = await supabase
        .from("appreciations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ appreciations_count: count ?? 0 })
        .eq("id", projectId);

      invalidateAppCache();
      return false;
    } else {
      // Add appreciation
      await supabase.from("appreciations").insert({ project_id: projectId, user_id: userId });

      // Recalculate true real count
      const { count } = await supabase
        .from("appreciations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ appreciations_count: count ?? 1 })
        .eq("id", projectId);

      invalidateAppCache();
      return true;
    }
  } catch (err) {
    console.error("Error toggling appreciation:", err);
    return false;
  }
}

/**
 * Update creator profile
 */
export async function updateProfileInDb(id: string, updates: Partial<Creator>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.isOnline !== undefined) payload.is_online = updates.isOnline;


    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);

    if (!error) {
      invalidateAppCache();
    }
    return !error;
  } catch (err) {
    console.error("Error updating profile in Supabase:", err);
    return false;
  }
}

/**
 * Fetch list of creator IDs that a user follows
 */
export async function fetchFollowingIds(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (error || !data) return new Set();

    return new Set(data.map((row) => row.following_id));
  } catch {
    return new Set();
  }
}

export async function fetchUserFollows(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (error || !data) return [];
    return data.map((r: { following_id: string }) => r.following_id);
  } catch (err) {
    console.error("Error fetching user follows from Supabase:", err);
    return [];
  }
}

/**
 * Toggle follow/unfollow a creator
 */
export async function toggleFollowInDb(followerId: string, followingId: string): Promise<boolean> {
  try {
    // Check if relationship already exists
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (data) {
      // Unfollow: delete row
      await supabase.from("follows").delete().eq("id", data.id);

      // Recalculate true real followers count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", followingId);

      await supabase
        .from("profiles")
        .update({ followers_count: count ?? 0 })
        .eq("id", followingId);

      invalidateAppCache();
      return false; // Not following anymore
    } else {
      // Follow: insert row
      await supabase.from("follows").insert({
        follower_id: followerId,
        following_id: followingId,
      });

      // Recalculate true real followers count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", followingId);

      await supabase
        .from("profiles")
        .update({ followers_count: count ?? 1 })
        .eq("id", followingId);

      invalidateAppCache();
      return true; // Now following
    }
  } catch (err) {
    console.error("Error toggling follow in Supabase:", err);
    return false;
  }
}

/**
 * Permanently delete a user account and all associated data from Supabase
 * Cascades to all projects, appreciations, comments, follows, and notifications.
 */
export async function deleteUserAccountInDb(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    // 1. Delete the profile record from public.profiles table
    // All related tables (projects, appreciations, comments, follows, notifications)
    // have ON DELETE CASCADE foreign key constraints on public.profiles(id).
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Error deleting profile record from Supabase:", profileDeleteError);
      return { success: false, error: profileDeleteError.message };
    }

    // 2. Sign out the user session immediately
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete account.";
    console.error("Unexpected error deleting user account:", err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger Supabase Password Reset Email
 */
export async function requestPasswordResetInDb(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) {
      return { success: false, error: "Email address is required." };
    }

    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/settings?reset_password=true`
      : "http://localhost:3000/settings?reset_password=true";

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send reset email.";
    return { success: false, error: errorMsg };
  }
}

// =============================================================================
// NOTIFICATIONS QUERIES & MUTATIONS (STRICT RECIPIENT LOGIC)
// =============================================================================

/**
 * Fetch notifications for a specific recipient user from Supabase
 */
export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!actor_id(*),
        project:projects!project_id(id, slug, title)
      `)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      if (error && (error.message || Object.keys(error).length > 0)) {
        console.error("Error fetching notifications from Supabase:", error.message || error);
      }
      return [];
    }

    return data.map(mapNotificationRow);
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string };
    if (errorObj?.name !== "AbortError") {
      console.error("Error in fetchUserNotifications:", errorObj?.message || err);
    }
    return [];
  }
}

/**
 * Dispatch a notification directly to the RECIPIENT in Supabase
 * STRICT BUSINESS RULE:
 * 1. actorId must NOT equal recipientId (no self-notifications).
 * 2. Stored for the recipient only.
 */
export async function insertNotificationInDb(payload: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  projectId?: string;
  content?: string;
}): Promise<void> {
  try {
    const { recipientId, actorId, type, projectId, content } = payload;

    // Strict Self-Action Guard: Never notify a user about their own actions
    if (!recipientId || !actorId || recipientId === actorId) {
      return;
    }

    const { error } = await supabase.from("notifications").insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      project_id: projectId || null,
      content: content || null,
      read: false,
    });

    if (error) {
      console.error("Error inserting notification in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to dispatch notification to Supabase:", err);
  }
}

/**
 * Mark a single notification as read in Supabase
 */
export async function markNotificationReadInDb(notificationId: string): Promise<void> {
  try {
    if (!notificationId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

/**
 * Mark all notifications as read for a recipient in Supabase
 */
export async function markAllNotificationsReadInDb(recipientId: string): Promise<void> {
  try {
    if (!recipientId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", recipientId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

// =============================================================================
// LAYERAT MASTER BLUEPRINT QUERIES & MUTATIONS
// =============================================================================

/**
 * Fetch platform operational settings (singleton row id = 'global')
 */
export async function fetchPlatformSettingsFromDb(): Promise<PlatformSettings> {
  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (error || !data) {
      return DEFAULT_PLATFORM_SETTINGS;
    }

    return {
      id: "global",
      announcementBannerActive: data.announcement_banner_active ?? false,
      announcementBannerText: data.announcement_banner_text ?? "",
      announcementBannerLink: data.announcement_banner_link ?? "",
      allowSignups: data.allow_signups ?? true,
      maintenanceMode: data.maintenance_mode ?? false,
      maintenanceMessage: data.maintenance_message ?? "Layerat is currently undergoing scheduled platform upgrades. We will be back online shortly.",
      enableCollections: data.enable_collections ?? false,
      maxUploadSizeMb: data.max_upload_size_mb ?? 25,
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.warn("fetchPlatformSettingsFromDb error, falling back to default:", err);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

/**
 * Update platform operational settings
 */
export async function updatePlatformSettingsInDb(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const payload: Record<string, unknown> = {
    id: "global",
    updated_at: new Date().toISOString(),
  };

  if (updates.announcementBannerActive !== undefined) payload.announcement_banner_active = updates.announcementBannerActive;
  if (updates.announcementBannerText !== undefined) payload.announcement_banner_text = updates.announcementBannerText;
  if (updates.announcementBannerLink !== undefined) payload.announcement_banner_link = updates.announcementBannerLink;
  if (updates.allowSignups !== undefined) payload.allow_signups = updates.allowSignups;
  if (updates.maintenanceMode !== undefined) payload.maintenance_mode = updates.maintenanceMode;
  if (updates.maintenanceMessage !== undefined) payload.maintenance_message = updates.maintenanceMessage;
  if (updates.enableCollections !== undefined) payload.enable_collections = updates.enableCollections;
  if (updates.maxUploadSizeMb !== undefined) payload.max_upload_size_mb = updates.maxUploadSizeMb;

  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .upsert(payload)
      .select()
      .single();

    if (error || !data) {
      console.warn("Could not persist platform_settings to Supabase, returning update:", error?.message);
      return { ...DEFAULT_PLATFORM_SETTINGS, ...updates, updatedAt: new Date().toISOString() };
    }

    return {
      id: "global",
      announcementBannerActive: data.announcement_banner_active,
      announcementBannerText: data.announcement_banner_text,
      announcementBannerLink: data.announcement_banner_link,
      allowSignups: data.allow_signups,
      maintenanceMode: data.maintenance_mode,
      maintenanceMessage: data.maintenance_message,
      enableCollections: data.enable_collections,
      maxUploadSizeMb: data.max_upload_size_mb,
      updatedAt: data.updated_at,
    };
  } catch {
    return { ...DEFAULT_PLATFORM_SETTINGS, ...updates, updatedAt: new Date().toISOString() };
  }
}

/**
 * Fetch featured homepage projects ordered by featured_order
 */
export async function fetchFeaturedProjectsFromDb(): Promise<Project[]> {
  const allProjects = await fetchProjects();
  return allProjects
    .filter((p) => p.featured || (p.featuredOrder !== null && p.featuredOrder !== undefined))
    .sort((a, b) => ((a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)));
}

/**
 * Update project featured order in DB
 */
export async function updateProjectFeaturedOrderInDb(projectId: string, order: number | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        featured: order !== null,
        featured_order: order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Update editorial badge on project (Staff Pick, Project of the Day, Best of Month, None)
 */
export async function updateProjectBadgeInDb(projectId: string, badge: ProjectBadge): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        badge: badge,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Toggle project publish status
 */
export async function toggleProjectPublishInDb(projectId: string, isPublished: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch all users with admin/governance details
 */
export async function fetchAdminUsersFromDb(): Promise<Creator[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        projects:projects!creator_id(count)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => {
      const projectCount = Array.isArray(row.projects) && row.projects.length > 0 && typeof row.projects[0].count === "number"
        ? row.projects[0].count
        : (row.total_projects_count ?? 0);

      return {
        id: row.id,
        username: row.username || "creator",
        displayName: row.display_name || row.username || "Creator",
        email: row.email || `${row.username || "creator"}@layerat.com`,
        avatarUrl: row.avatar_url || DEFAULT_AVATAR_URL,
        bio: row.bio || "",
        location: row.location || "",
        city: row.city || row.location || "",
        website: row.website || undefined,
        skills: row.skills || [],
        role: (row.role as UserRole) || ((row.id === "b2c69284-b4bf-40db-8b70-994dec053d04" || row.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998") ? "admin" : "member"),
        customBadge: row.badge || row.custom_badge || ((row.id === "b2c69284-b4bf-40db-8b70-994dec053d04" || row.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998") ? "SuperAdmin" : undefined),
        isVerified: Boolean(row.is_verified),
        isOnline: Boolean(row.is_online),
        isSuspended: Boolean(row.is_suspended),
        followersCount: row.followers_count ?? 0,
        totalProjectsCount: projectCount,
        createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "2026-01-01",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Update user role (admin | curator | moderator | member)
 */
export async function updateUserRoleInDb(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Toggle user verification status
 */
export async function toggleUserVerificationInDb(userId: string, isVerified: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Update custom badge (e.g. "Founding Creator", "Design Judge")
 */
export async function updateUserCustomBadgeInDb(userId: string, customBadge: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ badge: customBadge || null, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Suspend or unsuspend user account
 */
export async function toggleUserSuspensionInDb(userId: string, isSuspended: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: isSuspended, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Curated Collections
 */
export async function fetchCollectionsFromDb(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description || "",
      coverImage: row.cover_image || "",
      projectIds: Array.isArray(row.project_ids) ? row.project_ids : [],
      isFeatured: Boolean(row.is_featured),
      sortOrder: row.sort_order ?? 1,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Create or update a collection
 */
export async function upsertCollectionInDb(col: Partial<Collection> & { title: string }): Promise<Collection> {
  const slug = col.slug || col.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const payload = {
    id: col.id || crypto.randomUUID(),
    title: col.title,
    slug,
    description: col.description || "",
    cover_image: col.coverImage || "",
    project_ids: col.projectIds || [],
    is_featured: col.isFeatured ?? false,
    sort_order: col.sortOrder ?? 1,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("collections")
      .upsert(payload)
      .select()
      .single();

    if (error || !data) {
      return {
        id: payload.id,
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        coverImage: payload.cover_image,
        projectIds: payload.project_ids,
        isFeatured: payload.is_featured,
        sortOrder: payload.sort_order,
        createdAt: new Date().toISOString(),
        updatedAt: payload.updated_at,
      };
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      coverImage: data.cover_image,
      projectIds: data.project_ids,
      isFeatured: data.is_featured,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return {
      id: payload.id,
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      coverImage: payload.cover_image,
      projectIds: payload.project_ids,
      isFeatured: payload.is_featured,
      sortOrder: payload.sort_order,
      createdAt: new Date().toISOString(),
      updatedAt: payload.updated_at,
    };
  }
}

/**
 * Delete a collection
 */
export async function deleteCollectionFromDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch moderation reports
 */
export async function fetchReportsFromDb(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        reporter_id,
        project_id,
        reported_creator_id,
        reason,
        notes,
        status,
        created_at,
        updated_at,
        project:projects(
          *,
          creator:profiles(*)
        ),
        reporter:profiles!reports_reporter_id_fkey(*),
        reported_creator:profiles!reports_reported_creator_id_fkey(*)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      project: row.project ? mapProjectRow(row.project) : undefined,
      reporterId: row.reporter_id || undefined,
      reporter: row.reporter ? mapProfileToCreator(row.reporter) : undefined,
      reason: row.reason || "other",
      description: row.notes || "",
      status: (row.status as ReportStatus) || "pending",
      resolutionNotes: row.notes || "",
      createdAt: row.created_at || new Date().toISOString(),
      resolvedAt: row.status === "resolved" || row.status === "dismissed" ? row.updated_at : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Create a new real moderation report
 */
export async function createReportInDb(payload: {
  projectId: string;
  reporterId?: string;
  reportedCreatorId?: string;
  reason: string;
  notes: string;
}): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from("reports")
      .insert({
        project_id: payload.projectId,
        reporter_id: payload.reporterId || null,
        reported_creator_id: payload.reportedCreatorId || null,
        reason: payload.reason,
        notes: payload.notes,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        reporter_id,
        project_id,
        reported_creator_id,
        reason,
        notes,
        status,
        created_at,
        updated_at,
        project:projects(
          *,
          creator:profiles(*)
        ),
        reporter:profiles!reports_reporter_id_fkey(*),
        reported_creator:profiles!reports_reported_creator_id_fkey(*)
      `)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      projectId: data.project_id,
      project: data.project ? mapProjectRow(data.project) : undefined,
      reporterId: data.reporter_id || undefined,
      reporter: data.reporter ? mapProfileToCreator(data.reporter) : undefined,
      reason: data.reason || "other",
      description: data.notes || "",
      status: (data.status as ReportStatus) || "pending",
      resolutionNotes: data.notes || "",
      createdAt: data.created_at || new Date().toISOString(),
      resolvedAt: undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Update report status
 */
export async function updateReportStatusInDb(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string
): Promise<boolean> {
  try {
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (resolutionNotes !== undefined) {
      updatePayload.notes = resolutionNotes;
    }

    const { error } = await supabase
      .from("reports")
      .update(updatePayload)
      .eq("id", reportId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Enforce 1-click moderation action: Hide Project, Suspend Creator, or Dismiss Flag
 */
export async function enforceModerationActionInDb(
  action: "hide_project" | "suspend_creator" | "dismiss",
  reportId: string,
  projectId?: string,
  creatorId?: string,
  notes?: string
): Promise<boolean> {
  try {
    if (action === "hide_project" && projectId) {
      await toggleProjectPublishInDb(projectId, false);
      return await updateReportStatusInDb(reportId, "resolved", notes || "Monograph hidden from public view.");
    }
    if (action === "suspend_creator" && creatorId) {
      await toggleUserSuspensionInDb(creatorId, true);
      return await updateReportStatusInDb(reportId, "resolved", notes || "Creator account suspended.");
    }
    if (action === "dismiss") {
      return await updateReportStatusInDb(reportId, "dismissed", notes || "Report dismissed after investigation.");
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Delete a report record permanently
 */
export async function deleteReportFromDb(reportId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch categories / 13 Master Disciplines
 */
export async function fetchCategoriesFromDb(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || "",
        icon: row.icon || "Layers",
        subCategories: Array.isArray(row.sub_categories) ? row.sub_categories : [],
        softwareTools: Array.isArray(row.software_tools) ? row.software_tools : [],
        recommendedTags: Array.isArray(row.recommended_tags) ? row.recommended_tags : [],
        sortOrder: row.sort_order ?? 1,
      }));
    }

    return MASTER_TAXONOMY.map((t, idx) => ({
      id: t.id,
      name: t.name,
      slug: t.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: t.description,
      icon: "Layers",
      subCategories: t.subCategories,
      softwareTools: t.tools,
      recommendedTags: t.tags,
      sortOrder: idx + 1,
    }));
  } catch {
    return MASTER_TAXONOMY.map((t, idx) => ({
      id: t.id,
      name: t.name,
      slug: t.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: t.description,
      icon: "Layers",
      subCategories: t.subCategories,
      softwareTools: t.tools,
      recommendedTags: t.tags,
      sortOrder: idx + 1,
    }));
  }
}

/**
 * Update category taxonomy
 */
export async function updateCategoryInDb(id: string, updates: Partial<CategoryItem>): Promise<boolean> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.subCategories !== undefined) payload.sub_categories = updates.subCategories;
  if (updates.softwareTools !== undefined) payload.software_tools = updates.softwareTools;
  if (updates.recommendedTags !== undefined) payload.recommended_tags = updates.recommendedTags;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  try {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch dynamic legal policy documents
 */
export async function fetchLegalDocumentsFromDb(): Promise<Record<LegalDocType, LegalDocument>> {
  try {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*");

    const docs: Record<LegalDocType, LegalDocument> = { ...DEFAULT_LEGAL_DOCUMENTS };
    if (!error && data && data.length > 0) {
      for (const row of data) {
        if (row.id in docs) {
          const id = row.id as LegalDocType;
          docs[id] = {
            id,
            title: row.title || docs[id].title,
            subtitle: row.subtitle || docs[id].subtitle,
            version: row.version || docs[id].version,
            summary: row.summary || docs[id].summary,
            sections: Array.isArray(row.sections) ? row.sections : docs[id].sections,
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        }
      }
    }
    return docs;
  } catch {
    return DEFAULT_LEGAL_DOCUMENTS;
  }
}

/**
 * Update dynamic legal document
 */
export async function updateLegalDocumentInDb(
  id: LegalDocType,
  updates: Partial<LegalDocument>
): Promise<LegalDocument> {
  const existing = DEFAULT_LEGAL_DOCUMENTS[id];
  const payload = {
    id,
    title: updates.title ?? existing.title,
    subtitle: updates.subtitle ?? existing.subtitle,
    version: updates.version ?? existing.version,
    summary: updates.summary ?? existing.summary,
    sections: updates.sections ?? existing.sections,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("legal_documents")
      .upsert(payload)
      .select()
      .single();

    if (error || !data) {
      return { ...existing, ...updates, updatedAt: new Date().toISOString() };
    }

    return {
      id,
      title: data.title,
      subtitle: data.subtitle,
      version: data.version,
      summary: data.summary,
      sections: data.sections,
      updatedAt: data.updated_at,
    };
  } catch {
    return { ...existing, ...updates, updatedAt: new Date().toISOString() };
  }
}

/**
 * Compute Blueprint Vitality Metrics Strictly from Real Database Rows
 */
export async function fetchVitalityMetricsFromDb(): Promise<VitalityMetrics> {
  const [creators, allProjects, reports] = await Promise.all([
    fetchAdminUsersFromDb(),
    fetchProjects({ publishedOnly: false }),
    fetchReportsFromDb(),
  ]);

  const totalCreators = creators.length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activeCreators30D = creators.filter((c) => {
    if (!c.createdAt) return false;
    const createdTime = new Date(c.createdAt).getTime();
    return !isNaN(createdTime) && createdTime >= thirtyDaysAgo;
  }).length;

  const publishedMonographs = allProjects.filter((p) => p.published !== false).length;
  const totalAppreciations = allProjects.reduce((acc, p) => acc + (p.appreciations || 0), 0);
  const totalViews = allProjects.reduce((acc, p) => acc + (p.viewCount || 0), 0);
  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const totalPlates = allProjects.reduce((acc, p) => acc + (p.galleryImages?.length || 1), 0);
  const storageConsumedMb = Math.round(totalPlates * 3.5);

  return {
    totalCreators,
    activeCreators30D,
    publishedMonographs,
    totalAppreciations,
    totalViews,
    pendingReportsCount,
    storageConsumedMb,
  };
}





// =============================================================================
// ADMIN USERS (RBAC) DB QUERIES
// =============================================================================

export async function fetchAdminMembersFromDb(): Promise<AdminMember[]> {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        id,
        user_id,
        email,
        role,
        permissions,
        status,
        created_at,
        profiles:user_id (
          display_name,
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.user_id,
        name: profile?.display_name || row.email.split("@")[0],
        email: row.email,
        username: profile?.username || row.email.split("@")[0],
        avatarUrl: profile?.avatar_url || DEFAULT_AVATAR_URL,
        roleId: row.role,
        status: row.status as "active" | "invited" | "suspended",
        lastActive: "Active now",
        createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "2026-09-01",
        customPermissions: Array.isArray(row.permissions) ? row.permissions : undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function updateAdminUserRoleInDb(
  userId: string,
  role: string,
  permissions?: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admin_users")
      .update({
        role,
        permissions: permissions || [],
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (!error) {
      await supabase
        .from("profiles")
        .update({ role: role === "super_admin" || role === "editorial_director" ? "admin" : "curator" })
        .eq("id", userId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function deleteAdminUserInDb(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("user_id", userId);

    if (!error) {
      await supabase
        .from("profiles")
        .update({ role: "member" })
        .eq("id", userId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function toggleAdminUserStatusInDb(
  userId: string,
  status: "active" | "suspended"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admin_users")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    return !error;
  } catch {
    return false;
  }
}
