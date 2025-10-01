// src/lib/api-helpers.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { normalizeRole } from "@/lib/roles";

/**
 * Wraps a Next.js Route Handler with Clerk authentication.
 *
 * Ensures the incoming request is associated with an authenticated user. If
 * authentication fails, a 401 response is returned. On success, the resolved
 * `userId` is attached to the `request` object as `request.userId` and the
 * original handler is invoked.
 *
 * @param {Function} handler - The route handler to secure.
 * @returns {Function} An authenticated handler with the same signature as `handler`.
 */
export async function withAuth(handler) {
  return async (request, context) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Add userId to request context
      request.userId = userId;
      return await handler(request, context);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

/**
 * Normalizes thrown errors into API responses.
 *
 * Maps common Prisma error codes to HTTP responses:
 * - `P2002` → 409 Conflict (unique constraint)
 * - `P2025` → 404 Not Found (record does not exist)
 * Falls back to 500 Internal Server Error for unknown cases.
 *
 * @param {any} error - The caught error (can be from Prisma or generic).
 * @returns {Response} A Next.js JSON response describing the error.
 */
export function handleApiError(error) {
  console.error("API Error:", error);

  if (error.code === "P2002") {
    return NextResponse.json(
      { error: "A record with this information already exists" },
      { status: 409 }
    );
  }

  if (error.code === "P2025") {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Validates that all required fields are present on the given payload.
 *
 * @param {Record<string, any>} data - The source object to validate.
 * @param {string[]} requiredFields - Keys that must be present and truthy.
 * @throws {Error} When one or more required fields are missing.
 * @returns {void}
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}

/**
 * Extracts pagination values from URL search parameters.
 *
 * Applies sane defaults and guards the `limit` to a maximum of 100.
 *
 * @param {URLSearchParams} searchParams - Query params to parse.
 * @returns {{ page: number, limit: number, skip: number }} Pagination info for DB queries.
 */
export function getPaginationParams(searchParams) {
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100); // Max 100 items
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds a Prisma-compatible sort object from URL search parameters.
 *
 * When `sortBy` is absent, defaults to `{ createdAt: "desc" }`.
 *
 * @param {URLSearchParams} searchParams - Query params to parse.
 * @returns {Record<string, "asc"|"desc">} Prisma orderBy object.
 */
export function buildSortObject(searchParams) {
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "desc";

  if (!sortBy) {
    return { createdAt: "desc" };
  }

  return { [sortBy]: sortOrder };
}

// package.json scripts addition
/*
Add this to your package.json scripts section:

"scripts": {
  "db:seed": "node prisma/seed.js",
  "db:reset": "npx prisma migrate reset && npm run db:seed",
"db:studio": "npx prisma studio"
}
*/

// --- Role helpers ---
/**
 * Fetches the application's role for the given Clerk user ID.
 *
 * @param {string} userId - The Clerk user identifier.
 * @returns {Promise<"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT"|null>} The role or null if not found.
 */
export async function getUserRole(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });
    return user?.role || null;
  } catch (e) {
    return null;
  }
}

/**
 * Checks if the provided role is a client role.
 * @param {string|null|undefined} role - Role to test.
 * @returns {boolean} True when role equals "CLIENT".
 */
export function isClientRole(role) {
  return normalizeRole(role) === "CLIENT";
}

/**
 * Checks if the provided role is any staff role.
 * @param {string|null|undefined} role - Role to test.
 * @returns {boolean} True when role is ADMIN, PROJECT_MANAGER, or DEVELOPER.
 */
export function isStaffRole(role) {
  const normalized = normalizeRole(role);
  return normalized === "ADMIN" || normalized === "PROJECT_MANAGER" || normalized === "DEVELOPER";
}
