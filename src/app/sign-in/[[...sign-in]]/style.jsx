// src/app/sign-in/[[...sign-in]]/style.jsx
"use client";
import styled from "styled-components";

// border: 2px solid red;

const SignInContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.primaryHover} 100%
  );
  color: white;
  padding: ${({ theme }) => `${theme.spacing["xl"]} ${theme.spacing["4xl"]}`};
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      repeat;
    opacity: 0.1;
  }
`;

const LeftContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 480px;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.text.white};
`;

const WelcomeDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing["3xl"]};
  opacity: 0.9;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.white};
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing["3xl"]};
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FeatureIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.white};
`;

const FeatureText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.base};
  opacity: 0.9;
`;

const Testimonial = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TestimonialText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: 0.9;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.white};
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: 2px;
`;

const AuthorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.8;
`;

const AuthorRating = styled.div`
  display: flex;
  gap: 2px;
  margin-left: auto;
`;

const RightPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing["2xl"]} ${theme.spacing["4xl"]}`};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 100vh;
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  }
`;

const BackButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }
`;

const SignInCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing["3xl"]};
  /* max-width: 400px; */
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SignInHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
`;

const SignInTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SignInSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0;
`;

const ClerkWrapper = styled.div`
  /* Custom Clerk component styling */
  --clerk-accent-color: ${({ theme }) => theme.colors.primary};
  --clerk-background-color: transparent;
  --clerk-text-color: ${({ theme }) => theme.colors.text.primary};
  --clerk-border-radius: ${({ theme }) => theme.radii.md};
  --clerk-border-color: ${({ theme }) => theme.colors.border};
  --clerk-input-background-color: ${({ theme }) => theme.colors.surface};

  .cl-card {
    box-shadow: none;
    border: none;
    background: transparent;
  }

  .cl-headerTitle {
    display: none;
  }

  .cl-headerSubtitle {
    display: none;
  }

  .cl-socialButtonsBlockButton {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    transition: all ${({ theme }) => theme.transitions.fast};

    &:hover {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
      border-color: ${({ theme }) => theme.colors.borderDark};
    }
  }

  .cl-formButtonPrimary {
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.radii.md};
    font-weight: ${({ theme }) => theme.fontWeights.medium};

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  .cl-input {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    background-color: ${({ theme }) => theme.colors.surface};

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    }
  }

  .cl-footerActionLink {
    color: ${({ theme }) => theme.colors.primary};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SecurityText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

//
//
export {
  SignInCard,
  SignInHeader,
  SignInTitle,
  SignInSubtitle,
  ClerkWrapper,
  SecurityNote,
  SecurityText,
  BackButton,
  RightPanel,
  AuthorInfo, // 10
  AuthorName,
  AuthorAvatar,
  TestimonialText,
  TestimonialAuthor,
  Logo,
  LogoIcon,
  WelcomeTitle,
  WelcomeDescription,
  FeaturesList,
  FeatureItem, // 20
  FeatureIcon,
  SignInContainer,
  LeftPanel,
  LeftContent,
  FeatureText,
  Testimonial,
  AuthorTitle,
  AuthorRating,
};

// Custom form styles for the right panel
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: ${({ theme }) => theme.transitions.base};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const SubmitButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.white};
  border: none;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const HelperRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const InlineLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;
