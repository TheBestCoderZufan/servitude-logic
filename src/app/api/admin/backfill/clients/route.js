// src/app/api/admin/backfill/clients/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserRole, isStaffRole } from "@/lib/api-helpers";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = await getUserRole(userId);
    if (!isStaffRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        clients: { none: {} },
      },
      select: { clerkId: true, email: true, name: true },
    });

    let created = 0;
    for (const u of users) {
      try {
        await prisma.client.create({
          data: {
            userId: u.clerkId,
            companyName: (u.name || (u.email?.split("@")[0] || "New Client")).trim(),
            contactName: u.name || "Client",
            contactEmail: u.email || `${u.clerkId}@example.com`,
          },
        });
        created += 1;
      } catch (e) {
        // ignore duplicates
      }
    }

    return NextResponse.json({ scanned: users.length, created });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

