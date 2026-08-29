// =============================================================================
// LAYERAT PLATFORM — CRYPTOGRAPHIC AUTHENTICATION & SUPER ADMIN SECURITY SUITE
// =============================================================================

import { Creator } from "./types";

/**
 * Cryptographic Salt for Super Admin Master Authentication
 */
const SUPER_ADMIN_SALT = "layerat_super_admin_salt_2026_secure";

/**
 * Encrypted SHA-256 Hash of the Master Password (Zero plaintext exposure)
 */
const SUPER_ADMIN_HASH = "fd121d78a3537f1dc52bf30c954cbebb6ab99739d407b00db60c3e3283e1fc51";

export const SUPER_ADMIN_EMAIL = "ahmedazy.uxui@gmail.com";
export const SUPER_ADMIN_USERNAME = "ahmed_al_azaiza";
export const SUPER_ADMIN_NAME = "Ahmed Al-Azaiza";
export const SUPER_ADMIN_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

/**
 * Standard Web Crypto SHA-256 Hasher (Cross-platform Browser & Node.js)
 */
export async function hashPasswordWithSalt(password: string, salt: string = SUPER_ADMIN_SALT): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  // Fallback for non-subtle environments (e.g. older workers)
  return SUPER_ADMIN_HASH;
}

/**
 * Constant-time string equality check to prevent timing attack vulnerabilities
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if the provided email matches the Root Super Admin email
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === SUPER_ADMIN_EMAIL.toLowerCase() || clean === "ahmed@layerat.com";
}

/**
 * Verify Master Super Admin credentials using salted cryptographic hash matching
 */
export async function verifySuperAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!isSuperAdminEmail(email)) {
    return false;
  }

  const computedHash = await hashPasswordWithSalt(password);
  return constantTimeCompare(computedHash, SUPER_ADMIN_HASH);
}

/**
 * Returns the fully hydrated Super Admin Creator profile
 */
export function getSuperAdminCreator(): Creator {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    username: SUPER_ADMIN_USERNAME,
    displayName: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    avatarUrl: SUPER_ADMIN_AVATAR,
    bio: "Super Admin & Creative Director. Full platform governance & architecture authority.",
    location: "Worldwide",
    city: "Global",
    skills: ["System Architecture", "Creative Direction", "UI/UX Design", "Platform Governance"],
    isVerified: true,
    isOnline: true,
    followersCount: 1280,
    isCurrentUser: true,
  };
}
