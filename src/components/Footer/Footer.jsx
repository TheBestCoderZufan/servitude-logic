// src/components/Footer/Footer.jsx
"use client";
import appInfo from "@/data/appInfo.js";

export default function Footer() {
  return (
    <footer className="bg-foreground px-4 py-6 text-center text-background">
      <p className="text-sm">&copy; 2025 {appInfo.name}. All rights reserved.</p>
    </footer>
  );
}
