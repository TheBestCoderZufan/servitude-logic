// src/app/sign-up/[[...sign-up]]/page.js
import SignUpPageClient from "./SignUpPageClient";

/**
 * SignUpPage
 * Server component wrapper for the sign‑up client flow.
 * Keeps the route a server page while delegating interaction to the client.
 * @returns {Promise<JSX.Element>} Sign‑up page
 */
export default async function SignUpPage() {
  return <SignUpPageClient />;
}
