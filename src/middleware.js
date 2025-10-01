// src/middleware.js
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
const l = console.log;
// Routes accessible to everyone, logged in or not
const publicPaths = ["/", "/help", "/pricing", "/services", "/work", "/workflow", "/stories", "/faqs", "/contact", "/terms"];

const clerkSpecificPublicPaths = [
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-out(.*)",
];

// API routes that need to be included in the matcher
const apiRoutes = [
  "/api/(.*)", // Match all API routes
];

// Webhook routes that should be publicly accessible
const webhookPaths = [
  "/api/webhooks/clerk", // Add your Clerk webhook path here
];

const allPublicPaths = [
  ...new Set([...publicPaths, ...clerkSpecificPublicPaths, ...webhookPaths]),
];

const isPublicRoute = createRouteMatcher(allPublicPaths);
const authedPaths = createRouteMatcher(apiRoutes);
const adminPaths = createRouteMatcher(["/admin(.*)"]);
// Specifically match Clerk auth routes like /sign-in and /sign-up
const isClerkAuthRoute = createRouteMatcher(clerkSpecificPublicPaths);

export default clerkMiddleware(async (auth, req) => {
  // return NextResponse.redirect(new URL("/admin", req.url));
  const { pathname } = req.nextUrl;
  const isPublic = isPublicRoute(req);

  // Special case for webhook endpoints
  if (webhookPaths.some((path) => pathname.startsWith(path)))
    return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const isAuthed = !!userId;

  if (!isPublic && !isAuthed)
    return NextResponse.redirect(new URL("/", req.url));

  const isAdmin = isAuthed
    ? sessionClaims?.role?.toLowerCase() === "admin"
    : false;

  // If authenticated users hit Clerk auth pages, redirect by role
  if (isAuthed && isClerkAuthRoute(req)) {
    const redirectUrl = new URL(isAdmin ? "/admin" : "/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthed && adminPaths(req)) {
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/api")) {
    // Never redirect API routes — allow handlers to respond with JSON
    return NextResponse.next();
  }

  // Optionally, redirect signed-in users hitting the home page
  const isAuthedRoute = authedPaths(req);
  if (isAuthed && isAuthedRoute) {
    const dest = new URL(isAdmin ? "/admin" : "/dashboard", req.url);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
