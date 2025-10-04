// src/middleware.js
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { normalizeRole } from "@/lib/roles";
/**
 * Routes that remain publicly accessible regardless of authentication state.
 *
 * @type {string[]}
 */
const publicPaths = [
  "/",
  "/help",
  "/pricing",
  "/services",
  "/work",
  "/workflow",
  "/stories",
  "/faqs",
  "/contact",
  "/terms",
];

/**
 * Public authentication routes exposed by the Clerk integration.
 *
 * @type {string[]}
 */
const clerkSpecificPublicPaths = ["/sign-in(.*)", "/sign-up(.*)", "/sign-out(.*)"];

/**
 * API routes that the middleware must evaluate for authentication and role routing.
 *
 * @type {string[]}
 */
const apiRoutes = ["/api/(.*)"];

/**
 * Webhook routes that bypass authentication enforcement to accept external callbacks.
 *
 * @type {string[]}
 */
const webhookPaths = ["/api/webhooks/clerk"];

/**
 * Combined list of paths that bypass authentication redirects.
 *
 * @type {string[]}
 */
const allPublicPaths = [
  ...new Set([...publicPaths, ...clerkSpecificPublicPaths, ...webhookPaths]),
];

/**
 * Precomputed matcher for publicly accessible routes.
 */
const matchPublicRoute = createRouteMatcher(allPublicPaths);

/**
 * Precomputed matcher for authenticated API routes.
 */
const matchAuthedRoute = createRouteMatcher(apiRoutes);

/**
 * Precomputed matcher for administrative routes.
 */
const matchAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Specifically match Clerk auth routes like /sign-in and /sign-up
/**
 * Precomputed matcher for Clerk-hosted authentication routes.
 */
const matchClerkAuthRoute = createRouteMatcher(clerkSpecificPublicPaths);

/**
 * Determines whether a request matches any publicly accessible path.
 *
 * @param {Request} req - Incoming request to evaluate.
 * @returns {boolean} True when the request targets a public route.
 */
function isPublicRoute(req) {
  return matchPublicRoute(req);
}

/**
 * Determines whether a request targets an authenticated API route.
 *
 * @param {Request} req - Incoming request to evaluate.
 * @returns {boolean} True when the request targets authenticated APIs.
 */
function isAuthedRoute(req) {
  return matchAuthedRoute(req);
}

/**
 * Determines whether a request targets an administrative route.
 *
 * @param {Request} req - Incoming request to evaluate.
 * @returns {boolean} True when the request targets /admin paths.
 */
function isAdminRoute(req) {
  return matchAdminRoute(req);
}

/**
 * Determines whether a request targets Clerk-hosted authentication routes.
 *
 * @param {Request} req - Incoming request to evaluate.
 * @returns {boolean} True when the request matches Clerk auth routes.
 */
function isClerkAuthRoute(req) {
  return matchClerkAuthRoute(req);
}

/**
 * Determines the normalized application role from Clerk session claims.
 *
 * @param {object|null|undefined} claims - Session claims returned by Clerk middleware.
 * @returns {"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT"} Normalized role resolved from the claims metadata.
 */
function deriveRoleFromSessionClaims(claims) {
  if (!claims) {
    return "CLIENT";
  }

  const directRoleCandidate =
    typeof claims.role === "string" ? claims.role : null;
  const metadataRoleCandidateSource = claims?.metadata?.role;
  const metadataRoleCandidate =
    typeof metadataRoleCandidateSource === "string"
      ? metadataRoleCandidateSource
      : null;
  const publicMetadataRoleCandidateSource = claims?.publicMetadata?.role;
  const publicMetadataRoleCandidate =
    typeof publicMetadataRoleCandidateSource === "string"
      ? publicMetadataRoleCandidateSource
      : null;

  const resolvedRole =
    (directRoleCandidate && directRoleCandidate.trim()) ||
    (metadataRoleCandidate && metadataRoleCandidate.trim()) ||
    (publicMetadataRoleCandidate && publicMetadataRoleCandidate.trim());

  if (resolvedRole) {
    return normalizeRole(resolvedRole);
  }

  return "CLIENT";
}

export default clerkMiddleware(async (auth, req) => {
  // return NextResponse.redirect(new URL("/admin", req.url));
  const { pathname } = req.nextUrl;
  const isPublic = isPublicRoute(req);

  // Special case for webhook endpoints
  if (webhookPaths.some((path) => pathname.startsWith(path)))
    return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const sessionRole = deriveRoleFromSessionClaims(sessionClaims);
  const isAuthed = !!userId;

  if (!isPublic && !isAuthed)
    return NextResponse.redirect(new URL("/", req.url));

  const isAdmin = isAuthed && sessionRole === "ADMIN";

  // If authenticated users hit Clerk auth pages, redirect by role
  if (isAuthed && isClerkAuthRoute(req)) {
    const redirectUrl = new URL(isAdmin ? "/admin" : "/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthed && isAdminRoute(req)) {
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/api")) {
    // Never redirect API routes — allow handlers to respond with JSON
    return NextResponse.next();
  }

  // Optionally, redirect signed-in users hitting the home page
  const hittingAuthedRoute = isAuthedRoute(req);
  if (isAuthed && hittingAuthedRoute) {
    const dest = new URL(isAdmin ? "/admin" : "/dashboard", req.url);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
});

/**
 * Next.js middleware configuration excluding static assets while protecting app and API routes.
 *
 * @type {{matcher: string[]}}
 */
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
