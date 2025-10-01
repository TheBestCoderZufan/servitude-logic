"use server";
// src/lib/fileWriter.js
import fs from "fs";
import path from "path";

/**
 * Writes content to a temporary file under `src/tempFiles` and returns its path.
 *
 * - When `content` is an object, writes JSON and appends `.json` to the file name.
 * - For all other content types, writes text and appends `.txt`.
 * - Ensures the destination directory exists (created recursively if needed).
 *
 * This function is designed for server-side use only.
 *
 * @param {string} fileName - Base name (without extension) for the file.
 * @param {string|object} content - Data to write. Objects are stringified as JSON.
 * @returns {Promise<string>} Absolute path to the written file.
 * @throws {Error} If `fileName` or `content` are missing, or if writing fails.
 */
export default async function writeFile(fileName, content) {
  try {
    if (!content) throw new Error("No content provided");
    if (!fileName) throw new Error("No file name provided");
    const contentType = typeof content;
    // if the content is an object, add .json extension, if not then add .txt
    const ext = contentType === "object" ? ".json" : ".txt";
    // if the content is an object, convert it to JSON
    const fileContent =
      contentType === "object" ? JSON.stringify(content, null, 2) : content;
    const filename = `${fileName}${ext}`;
    const dir = path.join(process.cwd(), "src", "tempFiles", filename);
    if (!fs.existsSync(dir))
      fs.mkdirSync(path.dirname(dir), { recursive: true });
    fs.writeFileSync(dir, fileContent);
    console.log("dir", dir);
    return dir;
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
}
/** @module lib/fileWriter */
