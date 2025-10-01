// src/app/dashboard/schedule/SchedulePageClient.jsx
"use client";
import { Card, CardContent, Button, Select, Input, TextArea } from "@/components/ui";
import styled from "styled-components";
import { useState } from "react";

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

/**
 * Schedule meeting client island. Uses SSR-provided projects list.
 * @param {{projects:any[]}} props
 */
export default function SchedulePageClient({ projects = [] }) {
  const [projectId, setProjectId] = useState("");
  const [duration, setDuration] = useState("30");
  const [tz, setTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [t3, setT3] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!projectId || !t1) return;
    setSubmitting(true);
    try {
      const text = `Meeting request (${duration} mins, ${tz})\nOptions:\n- ${t1}${t2 ? `\n- ${t2}` : ""}${t3 ? `\n- ${t3}` : ""}\nNotes: ${notes || "—"}`;
      await fetch(`/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, projectId, type: "meeting_request" }) });
      setT1(""); setT2(""); setT3(""); setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Title>Request a Meeting</Title>
      <Card>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input placeholder="Time option 1 (e.g., 2025-09-10 3:00 PM)" value={t1} onChange={(e) => setT1(e.target.value)} />
            <Input placeholder="Time option 2 (optional)" value={t2} onChange={(e) => setT2(e.target.value)} />
            <Input placeholder="Time option 3 (optional)" value={t3} onChange={(e) => setT3(e.target.value)} />
            <Input placeholder="Timezone" value={tz} onChange={(e) => setTz(e.target.value)} />
          </div>
          <TextArea placeholder="Agenda / notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <Button onClick={submit} disabled={submitting || !projectId || !t1}>{submitting ? "Submitting..." : "Submit Request"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
/** @module dashboard/schedule/SchedulePageClient */
