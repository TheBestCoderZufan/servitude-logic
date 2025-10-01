// src/components/Footer/Footer.jsx
"use client";
import appInfo from "@/data/appInfo.js";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.white};
  padding: ${({ theme }) => `${theme.spacing["md"]}`};
  text-align: center;
`;

export default function Footer() {
  return (
    <FooterContainer>
      <p>&copy; 2025 {appInfo.name}. All rights reserved.</p>
    </FooterContainer>
  );
}
