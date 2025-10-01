// src/app/sign-out/[[...sign-out]]/SignOutClient.jsx
"use client";
import { AuthSignOutButton } from "@/lib/auth/client";

/**
 * SignOutClient
 * Client island wrapping the sign-out interaction.
 * @returns {JSX.Element}
 */
export default function SignOutClient() {
  return <AuthSignOutButton redirectUrl="/">Sign out</AuthSignOutButton>;
}

/** @module sign-out/SignOutClient */
