// src/app/api/ai/models/route.js
import { NextResponse } from "next/server";
import { listAvailableModels } from "@/lib/gemini/listAvailableModels";
import { handleApiError } from "@/lib/api-helpers";

/**
 * GET /api/ai/models
 * Returns a list of available Gemini models via @google/genai.
 *
 * Query params:
 * - pageSize?: number - Max items per page (default 20)
 *
 * @param {Request} request - The incoming request.
 * @returns {Promise<NextResponse>} A JSON response with a `models` array property.
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const pageSizeParam = url.searchParams.get("pageSize");
    const pageSize = Math.min(
      Math.max(parseInt(pageSizeParam || "20", 10), 1),
      50
    );

    const models = await listAvailableModels({ pageSize });
    return NextResponse.json({ models });
  } catch (error) {
    return handleApiError(error);
  }
}
