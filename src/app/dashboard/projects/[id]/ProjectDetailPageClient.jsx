// src/app/dashboard/projects/[id]/ProjectDetailPageClient.jsx
"use client";
import Link from "next/link";
import { useState } from "react";
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
  TableRow,
  TableHead,
  TableCell,
  TextArea,
} from "@/components/ui";
import { FiCalendar, FiUsers, FiChevronLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";
import { Header, TitleWrap, Title, Subtitle, Grid, SectionTitle } from "./stye";

/**
 * Project detail client island.
 * Renders a single project with tasks, invoices, and files. Allows client
 * interactions like approving files and requesting revisions via API calls.
 *
 * @param {{ project: any }} props - Server-provided project payload.
 */
export default function ProjectDetailPageClient({ project }) {
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [revNote, setRevNote] = useState("");
  const [activeFile, setActiveFile] = useState(null);

  return (
    <div>
      <Header>
        <TitleWrap>
          <Title>{project.name}</Title>
          <Subtitle>
            {project.startDate ? formatDate(project.startDate) : "—"}
            {project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
          </Subtitle>
        </TitleWrap>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Badge
            variant={
              project.status === "COMPLETED"
                ? "success"
                : project.status === "IN_PROGRESS"
                ? "inProgress"
                : project.status === "ON_HOLD"
                ? "warning"
                : project.status === "CANCELLED"
                ? "error"
                : "planning"
            }
          >
            {project.status.toLowerCase().replace("_", " ")}
          </Badge>
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm">
              <FiChevronLeft /> Back
            </Button>
          </Link>
        </div>
      </Header>

      <Grid>
        <div>
          <SectionTitle>Overview</SectionTitle>
          <Card style={{ marginBottom: 24 }}>
            <CardContent>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ color: "#64748b" }}>Client</div>
                  <div style={{ fontWeight: 700 }}>{project.client?.companyName || "—"}</div>
                </div>
                <div style={{ minWidth: 200 }}>
                  <div style={{ color: "#64748b" }}>Status</div>
                  <div style={{ fontWeight: 700 }}>{project.status.toLowerCase().replace("_", " ")}</div>
                </div>
                <div style={{ minWidth: 200 }}>
                  <div style={{ color: "#64748b" }}>Progress</div>
                  <div style={{ fontWeight: 700 }}>{project.progress}%</div>
                </div>
              </div>
              <ProgressBar>
                <ProgressFill progress={project.progress} />
              </ProgressBar>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiCalendar /> Start {project.startDate ? formatDate(project.startDate) : "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiCalendar /> End {project.endDate ? formatDate(project.endDate) : "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiUsers /> Team {project.teamSize || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionTitle>Milestones</SectionTitle>
          <Card style={{ marginBottom: 24 }}>
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
              <tbody>
                {project.tasks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "DONE"
                            ? "success"
                            : t.status === "IN_PROGRESS"
                            ? "inProgress"
                            : t.status === "TODO"
                            ? "warning"
                            : "default"
                        }
                      >
                        {t.status.toLowerCase().replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.priority === "HIGH"
                            ? "error"
                            : t.priority === "MEDIUM"
                            ? "warning"
                            : "success"
                        }
                      >
                        {t.priority.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.assignee?.name || "—"}</TableCell>
                    <TableCell>{t.dueDate ? formatDate(t.dueDate) : "—"}</TableCell>
                  </TableRow>
                ))}
                {project.tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div style={{ color: "#64748b", textAlign: "center", padding: 16 }}>No milestones yet</div>
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </Card>

          <SectionTitle>Files</SectionTitle>
          <Card>
            <CardContent>
              {project.files.length === 0 ? (
                <div style={{ color: "#64748b" }}>No files yet</div>
              ) : (
                project.files.map((f) => (
                  <div key={f.id} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar size="28">{(f.fileType || "F").slice(0, 2).toUpperCase()}</Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {f.fileName} {f.version > 1 ? `(v${f.version})` : ""}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                            {f.uploadedAt ? formatDate(f.uploadedAt) : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge variant={f.approvalStatus === "APPROVED" ? "success" : f.approvalStatus === "CHANGES_REQUESTED" ? "warning" : "default"}>
                          {f.approvalStatus?.toLowerCase().replace("_", " ")}
                        </Badge>
                        {f.approvalStatus !== "APPROVED" && (
                          <Button size="sm" onClick={async () => { await fetch(`/api/files/${f.id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: "Approved by client" }) }); }}>
                            Approve
                          </Button>
                        )}
                        <Button $variant="outline" size="sm" onClick={() => { setActiveFile(f); setRevNote(""); setRevModalOpen(true); }}>
                          Request Revisions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {revModalOpen && activeFile && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400 }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: 20, width: 520, maxWidth: "95%" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Request Revisions</div>
                <div style={{ color: "#64748b", marginBottom: 12 }}>Provide details on what changes are needed.</div>
                <TextArea value={revNote} onChange={(e) => setRevNote(e.target.value)} placeholder="Please change the hero image and update the CTA copy..." />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <Button $variant="outline" onClick={() => setRevModalOpen(false)}>Cancel</Button>
                  <Button onClick={async () => { await fetch(`/api/files/${activeFile.id}/request-revision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: revNote }) }); setRevModalOpen(false); setRevNote(""); }}>Submit</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Grid>
    </div>
  );
}
/** @module dashboard/projects/ProjectDetailPageClient */
