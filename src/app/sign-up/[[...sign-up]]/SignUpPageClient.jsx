// src/app/sign-up/[[...sign-up]]/SignUpPageClient.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiFolder, FiStar, FiShield } from "react-icons/fi";
import appInfo from "@/data/appInfo.js";
import { features, mockTestimonial } from "@/data/page/sign-in/signinData";
import { useAppSignUp } from "@/lib/auth/client";
import {
  SignUpContainer,
  LeftPanel,
  LeftContent,
  Logo,
  LogoIcon,
  WelcomeTitle,
  WelcomeDescription,
  FeaturesList,
  FeatureItem,
  FeatureIcon,
  FeatureText,
  Testimonial,
  TestimonialText,
  TestimonialAuthor,
  AuthorAvatar,
  AuthorInfo,
  AuthorName,
  AuthorTitle,
  AuthorRating,
  RightPanel,
  BackButton,
  Card,
  Title,
  Text,
  HelperRow,
  InlineLink,
  CaptchaSlot,
  ResendRow,
  ResendLink,
} from "./style";
import {
  Input,
  Label,
  Button,
  FormGroup,
  HelperText,
  ErrorText,
} from "@/components/ui";

/**
 * SignUpPageClient
 *
 * Custom, accessible sign‑up flow that collects first name, last name,
 * email, phone, and password, then verifies the email via Clerk using the
 * app's auth abstraction. No Clerk components are rendered directly.
 *
 * @returns {JSX.Element}
 */
export default function SignUpPageClient() {
  const router = useRouter();
  const {
    isLoaded,
    createAccount,
    prepareEmailVerification,
    verifyEmailCode,
    preparePhoneVerification,
    verifyPhoneCode,
  } = useAppSignUp();

  // 'form' | 'verifyEmail' | 'verifyPhone'
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailForVerify, setEmailForVerify] = useState("");
  const [phoneForVerify, setPhoneForVerify] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resentInfo, setResentInfo] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    password: "",
  });
  const [code, setCode] = useState("");

  /**
   * onChange
   * Handles input updates for the sign‑up form fields.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   * @returns {void}
   */
  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * onSubmit
   * Validates form values, creates the account, and triggers email verification.
   * @param {React.FormEvent<HTMLFormElement>} e - Submit event
   * @returns {Promise<void>}
   */
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!isLoaded) return;

    // Basic validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.emailAddress ||
      !form.phoneNumber ||
      !form.password
    ) {
      setError("Please fill out all required fields.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.emailAddress)) {
      setError("Please enter a valid email address.");
      return;
    }
    const phoneRe = /^\+?[1-9]\d{7,14}$/; // basic E.164 validation
    if (!phoneRe.test(form.phoneNumber.trim())) {
      setError("Please enter a valid phone number (E.164 format).");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await createAccount({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.emailAddress.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });
      // Always require email then phone verification in our app flow.
      await prepareEmailVerification("email_code");
      setEmailForVerify(form.emailAddress.trim());
      setPhoneForVerify(form.phoneNumber.trim());
      setStep("verifyEmail");
      setResendCooldown(60);
      setResentInfo("");
    } catch (err) {
      setError("Sign‑up failed. Please try again or use a different email.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * onVerify
   * Attempts to verify the emailed 6‑digit code and completes sign‑up.
   * @param {React.FormEvent<HTMLFormElement>} e - Submit event
   * @returns {Promise<void>}
   */
  async function onVerifyEmail(e) {
    e.preventDefault();
    setError("");
    if (!code || code.length < 6) {
      setError("Enter the 6‑digit verification code.");
      return;
    }
    setLoading(true);
    try {
      const normalized = String(code).trim().replace(/\D/g, "");
      const res = await verifyEmailCode(normalized);
      if (res?.verifications?.emailAddress?.status === "verified") {
        // Send phone code next and transition to phone verification step
        await preparePhoneVerification("phone_code");
        setResentInfo("");
        setResendCooldown(60);
        setCode("");
        setStep("verifyPhone");
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    } catch (_) {
      setError("Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * onVerifyPhone
   * Attempts to verify the SMS 6‑digit code and completes sign‑up.
   * @param {React.FormEvent<HTMLFormElement>} e - Submit event
   * @returns {Promise<void>}
   */
  async function onVerifyPhone(e) {
    e.preventDefault();
    setError("");
    if (!code || code.length < 6) {
      setError("Enter the 6‑digit verification code.");
      return;
    }
    setLoading(true);
    try {
      const normalized = String(code).trim().replace(/\D/g, "");
      const res = await verifyPhoneCode(normalized);
      if (res?.status === "complete") {
        const next = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard";
        router.replace(next);
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    } catch (_) {
      setError("Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * onResend
   * Requests a new verification email/code and restarts the cooldown timer.
   * @param {React.MouseEvent} e - Click event
   * @returns {Promise<void>}
   */
  async function onResend(e) {
    e.preventDefault();
    if (resendCooldown > 0 || !isLoaded) return;
    try {
      if (step === "verifyEmail") {
        await prepareEmailVerification("email_code");
        setResentInfo(
          "We sent a new code to " + (emailForVerify || "your email") + "."
        );
      } else if (step === "verifyPhone") {
        await preparePhoneVerification("phone_code");
        setResentInfo(
          "We sent a new code to " + (phoneForVerify || "your phone") + "."
        );
      }
      setResendCooldown(60);
    } catch (_) {
      // keep quiet to avoid leaking details
    }
  }

  // Cooldown timer for resend link
  useEffect(
    function tickResendCooldown() {
      if ((step !== "verifyEmail" && step !== "verifyPhone") || resendCooldown <= 0) return;
      const t = setTimeout(() => {
        setResendCooldown((v) => (v > 0 ? v - 1 : 0));
      }, 1000);
      return () => clearTimeout(t);
    },
    [step, resendCooldown]
  );

  return (
    <SignUpContainer>
      <LeftPanel>
        <LeftContent>
          <Logo>
            <LogoIcon>
              <FiFolder />
            </LogoIcon>
            {appInfo.name}
          </Logo>
          <WelcomeTitle>Client management that feels effortless</WelcomeTitle>
          <WelcomeDescription>
            Centralize clients, projects, tasks, approvals, and invoices in a
            single, secure workspace. Built for software agencies to deliver
            faster with clarity.
          </WelcomeDescription>
          <FeaturesList>
            {features.map((f, i) => (
              <FeatureItem key={i}>
                <FeatureIcon>
                  <f.icon size={20} />
                </FeatureIcon>
                <FeatureText>{f.text}</FeatureText>
              </FeatureItem>
            ))}
          </FeaturesList>
          {mockTestimonial.map((t) => (
            <Testimonial key={t.id}>
              <TestimonialText>&quot;{t.text}&quot;</TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar>{t.authorInitials}</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>{t.authorName}</AuthorName>
                  <AuthorTitle>{t.authorTitle}</AuthorTitle>
                </AuthorInfo>
                <AuthorRating>
                  {[...Array(t.authorRating)].map((_, idx) => (
                    <FiStar key={idx} size={16} fill="currentColor" />
                  ))}
                </AuthorRating>
              </TestimonialAuthor>
            </Testimonial>
          ))}
        </LeftContent>
      </LeftPanel>

      <RightPanel>
        {step === "form" ? (
          <BackButton onClick={() => router.push("/")}>
            <FiArrowLeft size={16} /> Back to home
          </BackButton>
        ) : null}
        <Card aria-busy={loading} aria-live="polite">
          <Title>Create your account</Title>
          <Text>Start your {appInfo.name} journey in minutes.</Text>

          {step === "form" ? (
            <form onSubmit={onSubmit} noValidate>
              <FormGroup>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  value={form.firstName}
                  onChange={onChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  value={form.lastName}
                  onChange={onChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="emailAddress">Email address</Label>
                <Input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={form.emailAddress}
                  onChange={onChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  value={form.phoneNumber}
                  onChange={onChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={onChange}
                />
                <HelperText>At least 8 characters.</HelperText>
              </FormGroup>

              {error && (
                <ErrorText role="alert" id="signup-error">
                  {error}
                </ErrorText>
              )}

              {/* Smart CAPTCHA mount point for Clerk (prevents invisible fallback warning) */}
              <CaptchaSlot id="clerk-captcha" aria-hidden="true" />

              <Button
                type="submit"
                $variant="primary"
                fullWidth
                disabled={loading}
              >
                Create account
              </Button>

              <HelperRow>
                <span>Already have an account?</span>
                <Link href="/sign-in" passHref legacyBehavior>
                  <InlineLink>Sign in</InlineLink>
                </Link>
              </HelperRow>
            </form>
          ) : step === "verifyEmail" ? (
            <form onSubmit={onVerifyEmail} noValidate>
              <FormGroup>
                <Label htmlFor="code">Enter verification code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="6‑digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <HelperText>
                  We sent a code to {emailForVerify || "your email"}. Check your
                  inbox.
                </HelperText>
                {resentInfo ? <HelperText>{resentInfo}</HelperText> : null}
              </FormGroup>

              {error && (
                <ErrorText role="alert" id="verify-error">
                  {error}
                </ErrorText>
              )}

              <Button
                type="submit"
                $variant="primary"
                fullWidth
                disabled={loading}
              >
                Verify email
              </Button>

              <ResendRow>
                <span>Didn&apos;t get a code?</span>
                <ResendLink
                  href="#"
                  onClick={onResend}
                  aria-disabled={resendCooldown > 0 ? "true" : "false"}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </ResendLink>
              </ResendRow>
            </form>
          ) : (
            <form onSubmit={onVerifyPhone} noValidate>
              <FormGroup>
                <Label htmlFor="code">Enter SMS verification code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="6‑digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <HelperText>
                  We sent a code to {phoneForVerify || "your phone"}. Enter the
                  6‑digit code to finish creating your account.
                </HelperText>
                {resentInfo ? <HelperText>{resentInfo}</HelperText> : null}
              </FormGroup>

              {error && (
                <ErrorText role="alert" id="verify-phone-error">
                  {error}
                </ErrorText>
              )}

              <Button
                type="submit"
                $variant="primary"
                fullWidth
                disabled={loading}
              >
                Verify phone and continue
              </Button>

              <ResendRow>
                <span>Didn&apos;t get a code?</span>
                <ResendLink
                  href="#"
                  onClick={onResend}
                  aria-disabled={resendCooldown > 0 ? "true" : "false"}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </ResendLink>
              </ResendRow>
            </form>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <FiShield size={16} color="#10b981" />
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Your data is protected with enterprise‑grade security
            </span>
          </div>
        </Card>
      </RightPanel>
    </SignUpContainer>
  );
}

/** @module sign-up/SignUpPageClient */
