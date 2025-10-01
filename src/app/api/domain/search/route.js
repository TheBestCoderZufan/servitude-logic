// src/app/api/domain/search/route.js
import { NextResponse } from "next/server";
import { domainSearch } from "@/lib/domain/domainSearch";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ error: "Missing query (?q=example.com)" }, { status: 400 });

    const result = await domainSearch(q);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

