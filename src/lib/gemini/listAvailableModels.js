// src/libs/gemini/listAvailableModels.js
/**
 * List available Gemini models using @google/genai.
 * Implements the listing approach from official samples:
 * https://github.com/googleapis/js-genai (sdk-samples/list_models.ts)
 */

import { getGoogleGenAI } from "./genaiClient";

/**
 * Lists available model metadata from the Gemini API.
 *
 * @param {object} [options] Optional configuration.
 * @param {number} [options.pageSize=20] Max number of models to request per page.
 * @returns {Promise<object[]>} An array of model objects returned by the API.
 */
export async function listAvailableModels(options = {}) {
  const { pageSize = 20 } = options;
  const ai = getGoogleGenAI();

  const modelsIterable = await ai.models.list({ config: { pageSize } });
  const results = [];
  for await (const model of modelsIterable) {
    results.push(model);
  }
  return results;
}
