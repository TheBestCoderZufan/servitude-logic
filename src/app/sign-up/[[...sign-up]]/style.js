// src/app/sign-up/[[...sign-up]]/style.js
import styled from "styled-components";

// Layout
const SignUpContainer = styled.div`
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
  color: ${({ theme }) => theme.colors.text.white};
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
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.1;
  }
`;

const LeftContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 520px;
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
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.white};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const AuthorTitle = styled.span`
  opacity: 0.9;
`;

const AuthorRating = styled.div`
  margin-left: auto;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

// Right panel (form)
const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing["2xl"]} ${theme.spacing["4xl"]}`};
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
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
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing["2xl"]};
  max-width: 520px;
  width: 100%;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
`;

export {
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
};

// Footer helper row under the form CTA
const HelperRow = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InlineLink = styled.a`
  margin-left: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

// Captcha placeholder that Clerk uses to render the Smart CAPTCHA widget
const CaptchaSlot = styled.div`
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
`;

export { HelperRow, InlineLink, CaptchaSlot };

// Resend section on verification step
const ResendRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResendLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
`;

export { ResendRow, ResendLink };
