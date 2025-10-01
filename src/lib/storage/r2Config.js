// src/lib/storage/r2Config.js
export function getR2Config() {
  const env = process.env.NODE_ENV === "production" ? "PROD" : "STAGING";
  const prefix = env === "PROD" ? "PROD_CLOUDFLARE" : "STAGING_CLOUDFLARE";

  const cfg = {
    endpoint: process.env[`${prefix}_ENDPOINT`] || process.env[`${prefix}_ENDPOINTS`],
    accessKeyId: process.env[`${prefix}_ACCESS_KEY_ID`],
    secretAccessKey: process.env[`${prefix}_SECRET_ACCESS_KEY`],
    bucket: process.env[`${prefix}_BUCKET_NAME`],
    token: process.env[`${prefix}_TOKEN_VALUE`],
    env,
  };

  const missing = Object.entries(cfg)
    .filter(([k, v]) => !v && k !== "token" && k !== "env")
    .map(([k]) => k);

  return { ...cfg, missing };
}

