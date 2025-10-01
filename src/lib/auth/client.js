"use client";
// src/lib/auth/client.js
// Custom auth abstraction layer that wraps Clerk client APIs
// so app code never imports Clerk directly.

import {
  useSignIn,
  useSignUp,
  useUser,
  SignOutButton,
  SignUp,
} from "@clerk/nextjs";
import { normalizeRole } from "@/lib/roles";

/**
 * useAppSignIn
 * Lightweight wrapper around Clerk's useSignIn to abstract implementation.
 * @returns {{isLoaded: boolean, signIn: Function, setActive: Function}}
 */
export function useAppSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();

  /**
   * signInWithPassword
   * @param {string} identifier - email/username
   * @param {string} password - user password
   * @returns {Promise<any>} Clerk response
   */
  async function signInWithPassword(identifier, password) {
    if (!isLoaded) throw new Error("Auth not ready");
    return signIn.create({ identifier, password });
  }

  return { isLoaded, signIn: signInWithPassword, setActive };
}

/**
 * AuthSignOutButton
 * Minimal wrapper over Clerk's SignOutButton with a default redirect.
 * @param {Object} props
 * @param {string} [props.redirectUrl="/"]
 * @param {React.ReactNode} [props.children]
 */
export function AuthSignOutButton({ redirectUrl = "/", children }) {
  return (
    <SignOutButton signOutOptions={{ redirectUrl }}>{children}</SignOutButton>
  );
}

/**
 * useAppSignUp
 * Wrapper around Clerk's useSignUp to enable custom sign-up flows
 * without importing Clerk in page/components directly.
 *
 * @returns {Object} API for custom sign-up: `{ isLoaded, createAccount, prepareEmailVerification, verifyEmailCode, setActive }`.
 */
export function useAppSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();

  /**
   * createAccount
   * Creates a pending sign-up with Clerk.
   * @param {Object} payload - Account fields
   * @param {string} payload.firstName - User first name
   * @param {string} payload.lastName - User last name
   * @param {string} payload.emailAddress - Email address
   * @param {string} [payload.phoneNumber] - E.164 phone number
   * @param {string} payload.password - Password
   * @returns {Promise<any>} Clerk sign-up response
   */
  async function createAccount({
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    password,
  }) {
    if (!isLoaded) throw new Error("Auth not ready");
    return signUp.create({
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      password,
    });
  }

  /**
   * prepareEmailVerification
   * Triggers Clerk to send an email verification code.
   * @param {('email_code')} [strategy='email_code'] - Verification strategy
   * @returns {Promise<any>} Clerk response
   */
  async function prepareEmailVerification(strategy = "email_code") {
    if (!isLoaded) throw new Error("Auth not ready");
    return signUp.prepareEmailAddressVerification({ strategy });
  }

  /**
   * verifyEmailCode
   * Attempts to verify the email code and activates the session on success.
   * @param {string} code - 6-digit verification code
   * @returns {Promise<any>} Clerk response (status: 'complete' on success)
   */
  async function verifyEmailCode(code) {
    if (!isLoaded) throw new Error("Auth not ready");
    // Do NOT set active here; we require phone verification as well.
    return signUp.attemptEmailAddressVerification({ code });
  }

  /**
   * preparePhoneVerification
   * Triggers Clerk to send a phone verification code via SMS.
   * @param {('phone_code')} [strategy='phone_code'] - Verification strategy
   * @returns {Promise<any>} Clerk response
   */
  async function preparePhoneVerification(strategy = "phone_code") {
    if (!isLoaded) throw new Error("Auth not ready");
    return signUp.preparePhoneNumberVerification({ strategy });
  }

  /**
   * verifyPhoneCode
   * Attempts to verify the phone code; activates the session on success.
   * @param {string} code - 6-digit verification code
   * @returns {Promise<any>} Clerk response (status: 'complete' on success)
   */
  async function verifyPhoneCode(code) {
    if (!isLoaded) throw new Error("Auth not ready");
    const res = await signUp.attemptPhoneNumberVerification({ code });
    if (res?.status === "complete" && res?.createdSessionId) {
      await setActive({ session: res.createdSessionId });
    }
    return res;
  }

  return {
    isLoaded,
    createAccount,
    prepareEmailVerification,
    verifyEmailCode,
    preparePhoneVerification,
    verifyPhoneCode,
    setActive,
  };
}

/**
 * AuthSignUp
 * Thin abstraction around Clerk's SignUp UI component. This keeps
 * Clerk out of page-level imports while we iterate on a custom UI.
 * @param {Object} props - forwarded to underlying SignUp component
 */
export function AuthSignUp(props) {
  return <SignUp {...props} />;
}

/**
 * useAppUser
 * Normalizes the Clerk user state for components without exposing Clerk directly.
 *
 * @returns {Object} Auth state including loading, sign-in status, role, and user reference.
 * @returns {boolean} return.isLoaded - Whether the auth state is initialized.
 * @returns {boolean} return.isSignedIn - True when a session exists.
 * @returns {object|null} return.user - Clerk user resource when loaded.
 * @returns {"ADMIN"|"PROJECT_MANAGER"|"DEVELOPER"|"CLIENT"} return.role - Normalized application role.
 * @returns {boolean} return.isClient - When the normalized role is CLIENT.
 * @returns {boolean} return.isStaff - When the normalized role is a staff role.
 */
export function useAppUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const roleMetadata =
    user?.publicMetadata?.role ?? user?.privateMetadata?.role ?? null;
  const normalizedRole = normalizeRole(roleMetadata);
  const isClient = normalizedRole === "CLIENT";
  const isStaff =
    normalizedRole === "ADMIN" ||
    normalizedRole === "PROJECT_MANAGER" ||
    normalizedRole === "DEVELOPER";

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    user: isLoaded ? user : null,
    role: normalizedRole,
    isClient,
    isStaff,
  };
}
