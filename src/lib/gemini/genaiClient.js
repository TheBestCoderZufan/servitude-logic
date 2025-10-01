// src/libs/gemini/genaiClient.js
/**
 * Google GenAI client factory and helpers.
 * Uses the @google/genai SDK per official docs:
 * - https://github.com/googleapis/js-genai#readme
 * - https://googleapis.github.io/js-genai/release_docs/index.html
 * - https://ai.google.dev/gemini-api/docs
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Returns a configured GoogleGenAI instance for the Gemini Developer API.
 * Prefers the server-side environment variable `GOOGLE_GENERATIVE_AI_API_KEY`.
 * Falls back to `GOOGLE_API_KEY` or `GEMINI_API_KEY` if present.
 *
 * @returns {GoogleGenAI} Configured Google GenAI client.
 */
export function getGoogleGenAI() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY;

  return new GoogleGenAI({ apiKey });
}

