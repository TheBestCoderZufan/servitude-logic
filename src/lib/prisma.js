// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

/**
 * A global-guarded Prisma client singleton.
 *
 * Next.js with hot reloading can instantiate multiple Prisma clients during
 * development. To avoid exhausting database connections, we re-use a single
 * instance by caching it on `globalThis` outside of production.
 *
 * @type {PrismaClient}
 */
const globalForPrisma = globalThis;

/** @type {PrismaClient} */
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
