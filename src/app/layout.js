// src/app/layout.js
import "@/styles/tailwind.css";
import StyledComponentsRegistry from "@/registry";
import { Suspense } from "react";
import Script from "next/script";
import SuspenseFallback from "@/components/Loading/SuspenseFallback";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast"; // Import ToastProvider
import { Inter, Fira_Code } from "next/font/google";
import { cookies, headers } from "next/headers";

// Preload and self-host fonts via next/font to improve LCP and avoid FOIT/FOUT
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const firaMono = Fira_Code({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

const VALID_THEME_PREFERENCES = new Set(["light", "dark", "system"]);

function resolveRequestPath(headerList) {
  if (!headerList) return "/";
  const candidates = [
    "x-invoke-path",
    "x-matched-path",
    "x-next-path",
    "next-url",
  ];

  for (const key of candidates) {
    const value = headerList.get(key);
    if (value) {
      if (key === "next-url") {
        try {
          const parsed = new URL(value, "http://localhost");
          return parsed.pathname || "/";
        } catch (_) {
          return value.startsWith("/") ? value : `/${value}`;
        }
      }
      return value.startsWith("/") ? value : `/${value}`;
    }
  }

  return "/";
}

function resolveInitialTheme(headerList, cookieStore) {
  const path = resolveRequestPath(headerList);
  const scoped = path.startsWith("/admin") || path.startsWith("/dashboard");
  const cookiePref = cookieStore?.get("themePreference")?.value ?? null;
  const initialPreference = VALID_THEME_PREFERENCES.has(cookiePref)
    ? cookiePref
    : "system";
  const initialMode = scoped && initialPreference === "dark" ? "dark" : "light";

  return { initialPreference, initialMode, scoped };
}

export default async function RootLayout({ children }) {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const { initialPreference, initialMode } = resolveInitialTheme(headerList, cookieStore);
  const initialBg = initialMode === "dark" ? "#0f172a" : "#ffffff";
  const initialFg = initialMode === "dark" ? "#f8fafc" : "#1e293b";

  return (
    <html lang="en" suppressHydrationWarning data-mode={initialMode}>
      <head>
        {/* Performance hints: low risk preconnects for Clerk assets */}
        <link rel="preconnect" href="https://clerk.accounts.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.clerk.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://clerk.accounts.dev" />
        <link rel="dns-prefetch" href="https://cdn.clerk.com" />
        {/* Theming */}
        <meta name="theme-color" content={initialBg} />
      </head>
      <body
        className={`${inter.variable} ${firaMono.variable} ${inter.className}`}
        style={{ backgroundColor: initialBg, color: initialFg }}
        suppressHydrationWarning
      >
        {/* Initialize theme early to avoid flashes on admin/dashboard routes */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var storedPref = null;
                try { storedPref = window.localStorage.getItem('themePreference'); } catch (storageError) { storedPref = null; }
                if (!storedPref) {
                  var match = document.cookie.match(/(?:^|; )themePreference=([^;]+)/);
                  if (match && match[1]) {
                    storedPref = decodeURIComponent(match[1]);
                  }
                }
                var pref = storedPref === 'light' || storedPref === 'dark' || storedPref === 'system' ? storedPref : 'system';
                var path = location.pathname || '';
                var scoped = path.indexOf('/admin') === 0 || path.indexOf('/dashboard') === 0;
                var systemDark = false;
                try { systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (matchError) { systemDark = false; }
                var mode = 'light';
                if (scoped) {
                  if (pref === 'dark') mode = 'dark';
                  else if (pref === 'light') mode = 'light';
                  else mode = systemDark ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-mode', mode);
                var bg = mode === 'dark' ? '#0f172a' : '#ffffff';
                var fg = mode === 'dark' ? '#f8fafc' : '#1e293b';
                document.documentElement.style.backgroundColor = bg;
                if (document.body) { document.body.style.backgroundColor = bg; document.body.style.color = fg; }
                try { document.cookie = 'themePreference=' + encodeURIComponent(pref) + '; path=/; max-age=31536000; SameSite=Lax'; } catch (cookieError) {}
                try { window.localStorage.setItem('themePreference', pref); } catch (persistError) {}
                window.__themePreference = pref;
                window.__themeMode = mode;
              } catch (e) {}
            })();
          `}
        </Script>
        <StyledComponentsRegistry>
          <ClerkProvider>
            <ThemeProvider initialPreference={initialPreference} initialMode={initialMode}>
              <Suspense fallback={<SuspenseFallback />}>
                <ToastProvider>{children}</ToastProvider>
              </Suspense>
            </ThemeProvider>
          </ClerkProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
// Default metadata for SEO; public pages can override via route metadata
export const metadata = {
  metadataBase: new URL("https://servitudelogic.com"),
  title: {
    default: "Servitude Logic",
    template: "%s | Servitude Logic",
  },
  description:
    "Servitude Logic is a client management and collaboration platform for software development agencies.",
  robots: { index: true, follow: true },
};
