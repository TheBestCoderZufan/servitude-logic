// src/app/api/webhooks/clerk/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Webhook } from "svix";
import { removeClientForUser, syncUserFromEvent } from "@/lib/userSync";

/**
 * POST
 * Clerk webhook receiver: verifies Svix signature then synchronizes the user
 * record inside the application database.
 * @param {Request} request - Incoming Next.js request
 * @returns {Promise<NextResponse>} JSON response
 */
export async function POST(request) {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_SIGNING_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const payload = await request.text();
    const wh = new Webhook(secret);
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    const { type, data } = evt;
    if (!data?.id) {
      return NextResponse.json({ message: "ignored" });
    }

    if (type === "user.deleted") {
      await removeClientForUser(data.id);
      try {
        await prisma.user.delete({ where: { clerkId: data.id } });
      } catch {
        // Ignore missing records; user might not exist locally.
      }
      return NextResponse.json({ ok: true });
    }

    if (type === "user.created" || type === "user.updated") {
      await syncUserFromEvent(data);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}
