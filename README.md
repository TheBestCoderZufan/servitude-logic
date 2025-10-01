# Application Overview

## Purpose

This application is a client management and collaboration platform for software development agencies. It centralizes client records, projects, tasks, file approvals, invoices, and reporting — with separate experiences for staff (admin) and clients (client portal). Role‑based access ensures clients only see their own data while staff manage all operational workflows.

## Primary Capabilities

- Client management: create/search/update clients, with activity and revenue rollups.
- Project tracking: statuses, priorities, team members, progress, and timelines.
- Task management: grid/table/kanban views, filters, assignees, comments, and time logs.
- File approvals: upload versioned files per project; approve or request revisions with history.
- Billing: draft/send/mark‑paid invoices, overdue detection, and revenue metrics.
- Dashboards and reports: KPIs, trends, upcoming work, and recent activity for staff; tailored overview for clients.
- Messaging/support: activity‑log backed messages for collaboration and scheduling requests.

## Major User Journeys (by area)

- Admin Dashboard: at‑a‑glance stats, recent projects, upcoming tasks, and activity.

  - `src/app/admin/page.js:1`
  - `src/app/api/dashboard/stats/route.js:1`, `src/app/api/dashboard/overview/route.js:1`, `src/app/api/dashboard/activity/route.js:1`

- Clients: list/filter/search; view client details (projects, invoices, messages, files; schedule meetings); backfill from users.

  - `src/app/admin/clients/page.js:1`, `src/app/admin/clients/[id]/page.js:1`
  - `src/app/api/clients/route.js:1`, `src/app/api/clients/[id]/route.js:1`, `src/app/api/admin/backfill/clients/route.js:1`, `src/app/api/clients/stats/route.js:1`

- Projects: browse with search/status/priority filters, view progress and team composition.

  - `src/app/admin/projects/page.js:1`
  - `src/app/api/projects/route.js:1`, `src/app/api/projects/stats/route.js:1`

- Tasks: grid/table/kanban, filter by status/priority/project/assignee, and view task stats.

  - `src/app/admin/tasks/page.js:1`
  - `src/app/api/tasks/route.js:1`, `src/app/api/tasks/stats/route.js:1`

- Invoices: list/create/send/mark paid; compute overdue and date‑based views.

  - `src/app/admin/invoices/page.js:1`
  - `src/app/api/invoices/route.js:1`, `src/app/api/invoices/[id]/send/route.js:1`, `src/app/api/invoices/[id]/mark-paid/route.js:1`, `src/app/api/invoices/stats/route.js:1`

- Files & Approvals: upload project files; approvals and revision requests with audit trail.

  - `src/app/api/files/route.js:1`
  - `src/app/api/files/[id]/approve/route.js:1`, `src/app/api/files/[id]/request-revision/route.js:1`

- Messages & Support: post activity/log messages and meeting requests scoped to projects.

  - `src/app/api/messages/route.js:1`

- Client Portal: client‑focused dashboard with active projects, outstanding invoices, upcoming milestones, recent files, and activity.
  - `src/app/dashboard/page.js:1`

## Data Model (Prisma)

- Users and roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `CLIENT`.
- Clients linked to a `User` (portal access); Projects per Client and Project Manager.
- Tasks with status/priority, assignee, comments, time logs.
- Invoices with status lifecycle (DRAFT → SENT → PAID/OVERDUE).
- Files with versioning, approval status, and `FileApproval` history entries.
- ActivityLog for audit/messaging streams.
  - `prisma/schema.prisma:1`

## Access Control & Auth

- Authentication via Clerk; webhook upserts Users and auto‑creates Client rows for `CLIENT` role.
  - `src/app/api/webhooks/clerk/route.js:1`
- Route handlers consistently scope data by role:
  - Clients see their own records and projects.
  - Staff see items they manage or are assigned to (or all, depending on scope/role).
  - `src/lib/api-helpers.js:1`, multiple API routes under `src/app/api/*`

## Integrations & Utilities

- Storage: R2/S3 presign endpoint placeholder (`501` until implemented).
  - `src/app/api/storage/presign/route.js:1`
- Domain search: Dynadot availability API wrapper and response normalization.
  - `src/app/api/domain/search/route.js:1`, `src/lib/domain/domainSearch.js:1`
- AI (Gemini): model listing using `@google/genai` with a minimal client wrapper.
  - `src/app/api/ai/models/route.js:1`, `src/lib/gemini/genaiClient.js:1`, `src/lib/gemini/listAvailableModels.js:1`

## Tech & Structure

- Next.js App Router (server route handlers in `src/app/api`, pages in `src/app`).
- Prisma + PostgreSQL for persistence.
- Styled‑components with centralized theme; custom layouts and UI components.
- Marketing site (home, pricing, about, contact) alongside admin and client portals.
  - `src/app/layout.js:1`, `src/app/page.js:1`, plus related routes under `src/app/*`

## Summary

In short, this is a role‑aware client operations platform. Staff handle the full delivery lifecycle (clients → projects → tasks → files/invoices), monitor performance via dashboards and reports, and collaborate through messages and approvals. Clients get a focused portal for visibility, approvals, and billing — all powered by a clean Prisma schema and guarded by consistent server‑side access rules.
