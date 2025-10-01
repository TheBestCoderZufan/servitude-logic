// src/data/page/admin/users/usersData.js

/**
 * Column configuration for the admin user directory table.
 *
 * Each column maps to a property returned by `/api/admin/users` and provides the
 * label rendered in the table header.
 * @type {Array<{id: string, label: string}>}
 */
export const userTableColumns = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "role", label: "Role" },
  { id: "client", label: "Client Account" },
  { id: "createdAt", label: "Created" },
  { id: "updatedAt", label: "Updated" },
];

/**
 * Sorting options surfaced in the directory toolbar.
 *
 * @type {Array<{value: string, label: string}>}
 */
export const userSortOptions = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A to Z)" },
  { value: "name:desc", label: "Name (Z to A)" },
  { value: "role:asc", label: "Role (A to Z)" },
  { value: "role:desc", label: "Role (Z to A)" },
];
/**
 * Fields supported in sorting and Prisma queries.
 *
 * @type {string[]}
 */
export const userSortableFields = ["name", "email", "role", "createdAt", "updatedAt"];

/**
 * Page size choices used for pagination controls.
 *
 * @type {number[]}
 */
export const userPageSizeOptions = [10, 25, 50];
