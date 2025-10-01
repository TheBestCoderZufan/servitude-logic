// src/lib/roles.js
import { roleHierarchy, roleMetadataMap } from "@/data/auth/roles.data";

/**
 * Normalizes a loose role value into a known application role.
 *
 * Accepts Clerk metadata strings (e.g., "project_manager"), enum-style values
 * ("PROJECT_MANAGER"), or other case variations. Falls back to "CLIENT" when
 * the value cannot be resolved.
 *
 * @param {string|null|undefined} value - Input role value from metadata or DB.
 * @returns {"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT"} Normalized role.
 */
export function normalizeRole(value) {
  if (!value) {
    return "CLIENT";
  }

  const raw = value.toString().trim();
  if (!raw) {
    return "CLIENT";
  }

  const upperCandidate = raw.replace(/[^a-zA-Z]+/g, "_").toUpperCase();
  if (roleHierarchy.includes(upperCandidate)) {
    return upperCandidate;
  }

  const flattened = raw.replace(/[^a-zA-Z]+/g, "").toLowerCase();
  if (flattened === "projectmanager") {
    return "PROJECT_MANAGER";
  }

  const metadataMatch = Object.entries(roleMetadataMap).find(
    ([, metaValue]) => metaValue === raw.toLowerCase()
  );
  if (metadataMatch) {
    return metadataMatch[0];
  }

  return "CLIENT";
}

/**
 * Translates a normalized role into the Clerk public metadata string.
 *
 * @param {string} role - Application role constant.
 * @returns {string} Metadata value matching Clerk configuration.
 */
export function roleToMetadata(role) {
  const normalized = normalizeRole(role);
  return roleMetadataMap[normalized];
}

/**
 * Checks whether the actor role includes at least the privileges of the
 * required role according to the documented hierarchy.
 *
 * @param {string} actorRole - Role associated with the current user.
 * @param {string} requiredRole - Minimum role required for the action.
 * @returns {boolean} True when `actorRole` grants the requested privileges.
 */
export function hasRolePrivilege(actorRole, requiredRole) {
  const actor = normalizeRole(actorRole);
  const required = normalizeRole(requiredRole);
  const actorIndex = roleHierarchy.indexOf(actor);
  const requiredIndex = roleHierarchy.indexOf(required);
  if (actorIndex === -1 || requiredIndex === -1) {
    return false;
  }
  return actorIndex <= requiredIndex;
}

/**
 * Provides the numeric rank for a role (lower index = higher privilege).
 *
 * @param {string} role - Role to evaluate.
 * @returns {number} Zero-based rank (Infinity when unknown).
 */
export function getRoleRank(role) {
  const normalized = normalizeRole(role);
  const idx = roleHierarchy.indexOf(normalized);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}
