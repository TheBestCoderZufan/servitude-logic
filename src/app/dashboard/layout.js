// src/app/dashboard/layout.js
import { ProjectProvider } from "@/providers/ProjectProvider";

/**
 * Dashboard Layout
 * Wraps all /dashboard routes with ProjectProvider so project selection and
 * scoping are available only in authenticated areas.
 * @param {{ children: React.ReactNode }} props
 */
export default function DashboardLayout({ children }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}

/** @module dashboard/layout */

