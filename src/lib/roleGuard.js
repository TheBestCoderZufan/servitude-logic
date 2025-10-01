// src/lib/roleGuard.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/**
 * React hook that protects sections of the app by role.
 *
 * Fetches the current user's profile from `/api/settings/profile` and, when
 * signed in, redirects the user away if their role is not included in
 * `allowedRoles`. This is typically used to block clients from accessing
 * administrative pages.
 *
 * The check runs on mount and whenever `isSignedIn`, `allowedRoles`, or
 * `redirectTo` change. Failures while fetching the profile are silent to avoid
 * blocking navigation in error states.
 *
 * @param {Object}   [options] - Optional configuration.
 * @param {string[]} [options.allowedRoles=["ADMIN","PROJECT_MANAGER","DEVELOPER"]]
 *   List of roles allowed to remain on the current page.
 * @param {string}   [options.redirectTo="/"] - Path to redirect disallowed users to.
 * @returns {void}
 */
export function useBlockClientRole({
  allowedRoles = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"],
  redirectTo = "/",
} = {}) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!isSignedIn) return;
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) return; // no-op if profile not found
        const data = await res.json();
        if (active && data?.role && !allowedRoles.includes(data.role)) {
          router.replace(redirectTo);
        }
      } catch (e) {
        // silent fail; do not block navigation if profile fetch fails
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [isSignedIn, router, allowedRoles, redirectTo]);
}
