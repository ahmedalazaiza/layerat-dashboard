// =============================================================================
// LAYERAT PLATFORM — SUPER ADMIN IDENTITY & SECURITY HELPERS
// =============================================================================

import { Creator } from "./types";

export const SUPER_ADMIN_ID = "b2c69284-b4bf-40db-8b70-994dec053d04";
export const SUPER_ADMIN_EMAIL = "ahmedazy.uxui@gmail.com";
export const SUPER_ADMIN_USERNAME = "ahmed_al_azaiza";
export const SUPER_ADMIN_NAME = "Ahmed Al-Azaiza";
export const SUPER_ADMIN_AVATAR = "https://ttjobsgglwgyioqlldqj.supabase.co/storage/v1/object/public/avatars/avatars/1788444338918-hid4ogb.webp";

/**
 * Check if the provided email matches the Root Super Admin email
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === SUPER_ADMIN_EMAIL.toLowerCase() || clean === "ahmed@layerat.com";
}

/**
 * Returns the fully hydrated Super Admin Creator profile
 */
export function getSuperAdminCreator(): Creator {
  return {
    id: SUPER_ADMIN_ID,
    username: SUPER_ADMIN_USERNAME,
    displayName: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    avatarUrl: SUPER_ADMIN_AVATAR,
    bio: '"If UI is a galaxy, then UX is an entire universe."\n\nWith 8+ years of hands-on experience in UX/UI design, I specialize in turning complex ideas into simple, meaningful, and visually engaging digital experiences.',
    location: "Worldwide",
    city: "Worldwide",
    website: "https://www.azaiza.com",
    skills: ["User Interface Design (UI)", "User Experience Design (UX)", "Creative Direction", "Design Systems"],
    role: "admin",
    customBadge: "SuperAdmin",
    isVerified: true,
    isOnline: true,
    followersCount: 0,
    isCurrentUser: true,
  };
}

export function isSuperAdminId(id?: string | null): boolean {
  return id === "b2c69284-b4bf-40db-8b70-994dec053d04" || id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998";
}
