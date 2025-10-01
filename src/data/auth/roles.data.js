// src/data/auth/roles.data.js

/**
 * Ordered list of application roles from highest to lowest privilege.
 *
 * Used by role utilities to determine inheritance rules (e.g., Admin inherits
 * Project Manager capabilities).
 * @type {Array<"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT">}
 */
export const roleHierarchy = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER", "CLIENT"];

/**
 * Maps internal role constants to Clerk public metadata values.
 *
 * Ensures metadata updates stay consistent with the configuration documented in
 * `AI-Doc/Configuration/Clerk.md`.
 * @type {Record<"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT", string>}
 */
export const roleMetadataMap = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  DEVELOPER: "developer",
  CLIENT: "client",
};

/**
 * Role options presented in administrative filters and dropdowns.
 *
 * @type {Array<{value: "ALL"|"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT", label: string}>}
 */
export const roleFilterOptions = [
  { value: "ALL", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "CLIENT", label: "Client" },
];
