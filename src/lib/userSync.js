// src/lib/userSync.js
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { normalizeRole, roleToMetadata } from "@/lib/roles";

/**
 * pickEmail
 * Safely selects the primary email address from a Clerk user payload.
 * @param {any} data - Clerk webhook `data` object or Clerk user response
 * @returns {string|null} Primary email or null
 */
export function pickEmail(data) {
  try {
    const primaryId =
      data?.primary_email_address_id || data?.primaryEmailAddressId;
    const emails = data?.email_addresses || data?.emailAddresses || [];
    const serialized = emails.map((email) =>
      email?.email_address
        ? email
        : { id: email?.id, email_address: email?.emailAddress }
    );
    const primary = serialized.find((e) => e.id === primaryId)?.email_address;
    return primary || serialized[0]?.email_address || null;
  } catch {
    return null;
  }
}

/**
 * defaultCompanyName
 * Derives a fallback company name using name or the left part of an email.
 * @param {string} name - Full name
 * @param {string} email - Email address
 * @returns {string} Company name fallback
 */
export function defaultCompanyName(name, email) {
  if (name && name.trim()) return name.trim();
  if (email && email.includes("@")) return email.split("@")[0];
  return "New Client";
}

/**
 * ensureMetadataRole
 * Synchronizes Clerk public metadata with the normalized role.
 * @param {string} clerkId - Clerk user identifier
 * @param {string} role - Normalized role value
 * @param {string|undefined|null} currentMetadataRole - Metadata role present on the payload
 * @returns {Promise<void>}
 */
export async function ensureMetadataRole(clerkId, role, currentMetadataRole) {
  const targetMetadataRole = roleToMetadata(role);
  if (
    (currentMetadataRole || "").toString().toLowerCase() === targetMetadataRole
  ) {
    return;
  }
  const clerkC = await clerkClient();
  await clerkC.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role: targetMetadataRole,
    },
  });
}

/**
 * ensureUserRecord
 * Upserts a Prisma User row based on the Clerk payload.
 * @param {Object} options - Sync options
 * @param {string} options.clerkId - Clerk user id
 * @param {string|null} options.email - Primary email
 * @param {string} options.name - Display name
 * @param {string} options.role - Normalized role
 * @returns {Promise<void>}
 */
export async function ensureUserRecord({ clerkId, email, name, role }) {
  const fallbackEmail = `${clerkId}@zufan.client`;
  await prisma.user.upsert({
    where: { clerkId },
    update: {
      email: email || fallbackEmail,
      name,
      role,
    },
    create: {
      clerkId,
      email: email || fallbackEmail,
      name,
      role,
    },
  });
}

/**
 * ensureClientForRole
 * Guarantees a Client row exists whenever a user holds the CLIENT role.
 * @param {Object} options - Sync options
 * @param {string} options.clerkId - Clerk user id
 * @param {string} options.name - User full name
 * @param {string|null} options.email - User email
 * @returns {Promise<void>}
 */
export async function ensureClientForRole({ clerkId, name, email }) {
  const existing = await prisma.client.findUnique({
    where: { userId: clerkId },
  });

  const fallbackEmail = email || `${clerkId}@zufan.client`;
  const fallbackName = name && name.trim() ? name.trim() : "Client";
  if (existing) {
    await prisma.client.update({
      where: { userId: clerkId },
      data: {
        contactName: fallbackName,
        contactEmail: fallbackEmail,
      },
    });
    return;
  }

  await prisma.client.create({
    data: {
      userId: clerkId,
      companyName: defaultCompanyName(name, fallbackEmail),
      contactName: fallbackName,
      contactEmail: fallbackEmail,
      contactPhone: null,
      address: null,
    },
  });
}

/**
 * removeClientForUser
 * Deletes the Client row linked to the given user when no dependent projects exist.
 * @param {string} clerkId - Clerk user id
 * @returns {Promise<void>}
 */
export async function removeClientForUser(clerkId) {
  const client = await prisma.client.findUnique({
    where: { userId: clerkId },
    include: {
      projects: {
        select: { id: true },
        take: 1,
      },
    },
  });
  if (!client) {
    return;
  }
  if (client.projects && client.projects.length > 0) {
    return;
  }
  await prisma.client.delete({ where: { userId: clerkId } });
}

/**
 * syncUserFromEvent
 * Handles Clerk user created/updated payloads and syncs the local database.
 * @param {any} data - Clerk webhook data payload
 * @returns {Promise<void>}
 */
export async function syncUserFromEvent(data) {
  const clerkId = data.id;
  const email = pickEmail(data);
  const name = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const metadataRole =
    data?.public_metadata?.role ||
    data?.private_metadata?.role ||
    data?.unsafe_metadata?.role ||
    data?.role;
  const role = normalizeRole(metadataRole);

  await ensureMetadataRole(clerkId, role, data?.public_metadata?.role);
  await ensureUserRecord({ clerkId, email, name, role });

  if (role === "CLIENT") {
    await ensureClientForRole({ clerkId, name, email });
  } else {
    await removeClientForUser(clerkId);
  }
}
