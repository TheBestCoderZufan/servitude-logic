// src/app/admin/layout.js
import { ProjectProvider } from "@/providers/ProjectProvider";

/**
 * Admin Layout
 * Wraps all /admin routes with ProjectProvider so project selection and
 * scoping are available only in authenticated areas.
 * @param {{ children: React.ReactNode }} props
 */
export default function AdminLayout({ children }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}

/** @module admin/layout */

