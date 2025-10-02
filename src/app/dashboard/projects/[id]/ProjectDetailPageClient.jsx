// src/app/dashboard/projects/[id]/ProjectDetailPageClient.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Badge,
  Button,
  ProgressBar,
  ProgressFill,
  Avatar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Textarea,
} from "@/components/ui/dashboard";
import { FiCalendar, FiUsers, FiChevronLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

const PROJECT_STATUS_VARIANTS = {
  COMPLETED: "success",
  IN_PROGRESS: "inProgress",
  ON_HOLD: "warning",
  CANCELLED: "error",
  PLANNING: "planning",
};

const TASK_STATUS_VARIANTS = {
  DONE: "success",
  IN_PROGRESS: "inProgress",
  TODO: "warning",
};

const PRIORITY_VARIANTS = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "success",
};

const FILE_STATUS_VARIANTS = {
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  PENDING: "default",
};

/**
 * Project detail client island.
 * Renders a single project with tasks, invoices, and files. Allows client
 * interactions like approving files and requesting revisions via API calls.
 *
 * @param {{ project: any }} props - Server-provided project payload.
 * @returns {JSX.Element}
 */
export default function ProjectDetailPageClient({ project }) {
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [revNote, setRevNote] = useState("");
  const [activeFile, setActiveFile] = useState(null);

  const statusVariant = PROJECT_STATUS_VARIANTS[project.status] || "default";

  async function approveFile(fileId) {
    await fetch(`/api/files/${fileId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Approved by client" }),
    });
  }

  async function submitRevisionRequest(fileId) {
    await fetch(`/api/files/${fileId}/request-revision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: revNote }),
    });
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted">
            {project.startDate ? formatDate(project.startDate) : "—"}
            {project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant} className="capitalize">
            {project.status.toLowerCase().replace("_", " ")}
          </Badge>
          <Link href="/dashboard/projects" className="inline-flex">
            <Button variant="secondary" size="sm" className="rounded-lg">
              <FiChevronLeft aria-hidden className="mr-2" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Overview</h2>
        <Card className="rounded-3xl">
          <CardContent className="space-y-6 px-6 py-6">
            <div className="grid gap-4 text-sm text-muted md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide">Client</p>
                <p className="text-base font-semibold text-foreground">
                  {project.client?.companyName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Status</p>
                <p className="text-base font-semibold text-foreground">
                  {project.status.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Progress</p>
                <p className="text-base font-semibold text-foreground">{project.progress}%</p>
              </div>
            </div>
            <ProgressBar className="h-3 bg-border/60">
              <ProgressFill value={project.progress} tone="info" />
            </ProgressBar>
            <div className="grid gap-4 text-sm text-muted sm:grid-cols-2 lg:grid-cols-3">
              <div className="inline-flex items-center gap-2">
                <FiCalendar aria-hidden />
                <span>Start {project.startDate ? formatDate(project.startDate) : "—"}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <FiCalendar aria-hidden />
                <span>End {project.endDate ? formatDate(project.endDate) : "—"}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <FiUsers aria-hidden />
                <span>Team {project.teamSize || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Milestones</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={TASK_STATUS_VARIANTS[task.status] || "default"}>
                      {task.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANTS[task.priority] || "default"}>
                      {task.priority.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assignee?.name || "—"}</TableCell>
                  <TableCell>{task.dueDate ? formatDate(task.dueDate) : "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted">
                  No milestones yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Files</h2>
        <Card className="rounded-3xl">
          <CardContent className="space-y-4 px-6 py-6">
            {project.files.length === 0 ? (
              <p className="text-sm text-muted">No files yet</p>
            ) : (
              <ul className="space-y-4">
                {project.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size={40} className="bg-accent-soft text-info">
                        {(file.fileType || "F").slice(0, 2).toUpperCase()}
                      </Avatar>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground">
                          {file.fileName} {file.version > 1 ? `(v${file.version})` : ""}
                        </p>
                        <p className="text-muted">
                          {file.uploadedAt ? formatDate(file.uploadedAt) : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={FILE_STATUS_VARIANTS[file.approvalStatus] || "default"}>
                        {file.approvalStatus?.toLowerCase().replace("_", " ") || "pending"}
                      </Badge>
                      {file.approvalStatus !== "APPROVED" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => approveFile(file.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          setActiveFile(file);
                          setRevNote("");
                          setRevModalOpen(true);
                        }}
                      >
                        Request Revisions
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {revModalOpen && activeFile ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="w-full max-w-xl rounded-3xl border border-border/80 bg-surface px-6 py-6 shadow-xl"
          >
            <div className="space-y-2">
              <h3 id="revision-modal-title" className="font-heading text-lg font-semibold text-foreground">
                Request Revisions
              </h3>
              <p className="text-sm text-muted">
                Provide details on what changes are needed for {activeFile.fileName}.
              </p>
            </div>
            <Textarea
              value={revNote}
              onChange={(event) => setRevNote(event.target.value)}
              placeholder="Please change the hero image and update the CTA copy..."
              className="mt-4"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg"
                onClick={() => setRevModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg"
                onClick={async () => {
                  await submitRevisionRequest(activeFile.id);
                  setRevModalOpen(false);
                  setRevNote("");
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
/** @module dashboard/projects/ProjectDetailPageClient */
