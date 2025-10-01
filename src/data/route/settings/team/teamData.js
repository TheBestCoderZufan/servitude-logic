// src/data/route/settings/team/teamData.js
/**
 * Maps internal role enums to human‑readable labels.
 *
 * Used by `src/app/api/settings/team/route.js` when formatting team member payloads
 * for the Settings > Team UI.
 * @type {Object<string, string>}
 */
export const getRoleLabel = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  CLIENT: "Client",
  MEMBER: "Member",
};
