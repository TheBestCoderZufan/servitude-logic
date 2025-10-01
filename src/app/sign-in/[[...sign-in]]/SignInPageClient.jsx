// src/app/sign-in/[[...sign-in]]/SignInPageClient.jsx
"use client";
import React from "react";
import Link from "next/link";
import { FiFolder, FiShield, FiStar, FiArrowLeft } from "react-icons/fi";
import appInfo from "@/data/appInfo.js";
import { features, mockTestimonial } from "@/data/page/sign-in/signinData";
import {
  SignInCard,
  SignInHeader,
  SignInTitle,
  SignInSubtitle,
  ClerkWrapper,
  SecurityNote,
  SecurityText,
  BackButton,
  RightPanel,
  AuthorInfo,
  AuthorName,
  AuthorAvatar,
  TestimonialText,
  TestimonialAuthor,
  Logo,
  LogoIcon,
  WelcomeTitle,
  WelcomeDescription,
  FeaturesList,
  FeatureItem,
  FeatureIcon,
  SignInContainer,
  LeftPanel,
  LeftContent,
  FeatureText,
  Testimonial,
  AuthorTitle,
  AuthorRating,
  Form,
  FormGroup,
  Label,
  Input,
  SubmitButton,
  HelperRow,
  Muted,
  InlineLink,
} from "./style";
import { useRouter } from "next/navigation";
import { useAppSignIn } from "@/lib/auth/client";

/**
 * DisplayTestimonial
 * Renders a testimonial block used on the sign-in screen.
 * @param {{mockTestimonial: {text: string, authorInitials: string, authorName: string, authorTitle: string, authorRating: number}}} props
 * @returns {JSX.Element}
 */
function DisplayTestimonial({ mockTestimonial }) {
  return (
    <Testimonial>
      <TestimonialText>&quot;{mockTestimonial.text}&quot;</TestimonialText>
      <TestimonialAuthor>
        <AuthorAvatar>{mockTestimonial.authorInitials}</AuthorAvatar>
        <AuthorInfo>
          <AuthorName>{mockTestimonial.authorName}</AuthorName>
          <AuthorTitle>{mockTestimonial.authorTitle}</AuthorTitle>
        </AuthorInfo>
        <AuthorRating>
          {[...Array(mockTestimonial.authorRating)].map((_, i) => (
            <FiStar key={i} size={16} fill="currentColor" />
          ))}
        </AuthorRating>
      </TestimonialAuthor>
    </Testimonial>
  );
}

/**
 * SignInPageClient
 * Client island for the Sign In page using the app auth abstraction.
 * @returns {JSX.Element}
 */
export default function SignInPageClient() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useAppSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleBackClick = () => router.push("/");

  return (
    <SignInContainer>
      <LeftPanel>
        <LeftContent>
          <Logo>
            <LogoIcon>
              <FiFolder />
            </LogoIcon>
            {appInfo.name}
          </Logo>
          <WelcomeTitle>
            Welcome back to your project management hub
          </WelcomeTitle>
          <WelcomeDescription>
            Streamline your workflow and boost productivity with our
            comprehensive project management solution.
          </WelcomeDescription>
          <FeaturesList>
            {features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon>
                  <feature.icon size={20} />
                </FeatureIcon>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureItem>
            ))}
          </FeaturesList>
          {mockTestimonial.map((testimonial) => (
            <div key={testimonial.id}>
              <DisplayTestimonial mockTestimonial={testimonial} />
            </div>
          ))}
        </LeftContent>
      </LeftPanel>

      <RightPanel>
        <BackButton onClick={handleBackClick}>
          <FiArrowLeft size={16} />
          Back to home
        </BackButton>
        <SignInCard>
          <SignInHeader>
            <SignInTitle>Sign in to your account</SignInTitle>
            <SignInSubtitle>
              Welcome back! Please enter your details to continue.
            </SignInSubtitle>
          </SignInHeader>
          <Form
            aria-label="Sign in form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (!isLoaded) return;
              setSubmitting(true);
              try {
                const res = await signIn(email, password);
                if (res.status === "complete") {
                  await setActive({ session: res.createdSessionId });
                  router.push("/dashboard");
                  return;
                } else {
                  setError("Additional steps required. Please continue.");
                }
              } catch (err) {
                const msg =
                  err?.errors?.[0]?.longMessage ||
                  err?.message ||
                  "Sign in failed";
                setError(msg);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <FormGroup>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>

            {error && (
              <div
                role="alert"
                style={{ color: "#ef4444", fontSize: "0.875rem" }}
              >
                {error}
              </div>
            )}

            <SubmitButton type="submit" disabled={submitting || !isLoaded}>
              {submitting ? "Signing in..." : "Sign In"}
            </SubmitButton>

            <HelperRow>
              <Muted>Don’t have an account?</Muted>
              <Link href="/sign-up" passHref legacyBehavior>
                <InlineLink>Sign up</InlineLink>
              </Link>
            </HelperRow>
          </Form>
          <SecurityNote>
            <FiShield size={16} color="#10b981" />
            <SecurityText>
              Your data is protected with enterprise-grade security
            </SecurityText>
          </SecurityNote>
        </SignInCard>
      </RightPanel>
    </SignInContainer>
  );
}

/** @module sign-in/SignInPageClient */
