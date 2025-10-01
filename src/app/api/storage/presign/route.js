// src/app/api/storage/presign/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getR2Config } from "@/lib/storage/r2Config";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cfg = getR2Config();
  if (cfg.missing.length) {
    return NextResponse.json({ error: `R2 not configured: missing ${cfg.missing.join(", ")}` }, { status: 501 });
  }

  // Placeholder: integrate AWS S3 SDK (S3-compatible) to mint presigned URLs.
  // Return explicit 501 until implemented to avoid false assumptions in UI.
  return NextResponse.json({ error: "Presign not implemented yet" }, { status: 501 });
}

