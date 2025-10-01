// src/app/dashboard/messages/MessagesPageClient.jsx
"use client";
import { useRef, useState } from "react";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import { Card, CardContent, Input, Select, Button, TextArea } from "@/components/ui";
import { PageHeader, Title, List, MessageItem } from "./style";
import { FiSend, FiSearch } from "react-icons/fi";

/**
 * Messages & Support client island with SSR project filter + pagination.
 * @param {Object} props - Props
 * @param {Array} props.projects - Project options
 * @param {Array} props.messages - Messages list
 * @param {Object} props.pagination - Pagination info
 * @param {Object} props.filters - Current filters
 */
export default function MessagesPageClient({ projects = [], messages = [], pagination, filters }) {
  const formRef = useRef(null);
  const [projectId, setProjectId] = useState(filters.projectId || "");
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportDetails, setSupportDetails] = useState("");
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const submitOnChange = () => formRef.current?.requestSubmit();
  const withPage = (page) => {
    const params = new URLSearchParams({ projectId, page: String(page), limit: String(pagination.limit || 20) });
    if (!projectId) params.delete("projectId");
    return `?${params.toString()}`;
  };

  const send = async () => {
    if (!text.trim() || !projectId) return;
    await fetch(`/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, projectId }) });
    setText("");
    formRef.current?.requestSubmit();
  };

  const submitSupport = async () => {
    if (!projectId || !supportSubject.trim()) return;
    setSubmittingSupport(true);
    try {
      await fetch(`/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `Support: ${supportSubject} — ${supportDetails}`, projectId, type: "support_request" }) });
      setSupportSubject(""); setSupportDetails("");
    } finally { setSubmittingSupport(false); }
  };

  return (
    <div>
      <PageHeader>
        <Title>Messages &amp; Support</Title>
      </PageHeader>

      <form ref={formRef} method="get" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Select name="projectId" value={projectId} onChange={(e) => { setProjectId(e.target.value); submitOnChange(); }} style={{ maxWidth: 300 }}>
          <option value="">Select project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Input name="page" defaultValue={String(pagination.page)} type="hidden" />
        <Input name="limit" defaultValue={String(pagination.limit)} type="hidden" />
      </form>

      <div style={{ display: "inline-flex", gap: 8, marginBottom: 12 }}>
        <Button variant={activeTab === "messages" ? "primary" : "outline"} size="sm" onClick={() => setActiveTab("messages")}>Messages</Button>
        <Button variant={activeTab === "support" ? "primary" : "outline"} size="sm" onClick={() => setActiveTab("support")}>Support</Button>
      </div>

      {activeTab === "messages" ? (
        <>
          <Card style={{ marginBottom: 12 }}>
            <CardContent>
              <div style={{ display: "flex", gap: 8 }}>
                <Input placeholder="Write a message..." value={text} onChange={(e) => setText(e.target.value)} />
                <Button onClick={send} disabled={!projectId || !text.trim()}><FiSend /> Send</Button>
              </div>
            </CardContent>
          </Card>

          <List>
            {messages.map((m) => (
              <MessageItem key={m.id}>
                <div style={{ fontWeight: 600 }}>{m.project?.name || "—"}</div>
                <div style={{ color: "#64748b" }}>{typeof m.text === 'string' ? m.text : JSON.stringify(m.text)}</div>
              </MessageItem>
            ))}
          </List>
        </>
      ) : (
        <Card>
          <CardContent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <Input placeholder="Subject" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} />
              <TextArea placeholder="Details" value={supportDetails} onChange={(e) => setSupportDetails(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Button onClick={submitSupport} disabled={submittingSupport || !projectId || !supportSubject.trim()}>{submittingSupport ? "Submitting..." : "Submit Request"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={withPage(Math.max(1, (pagination.page || 1) - 1))} aria-disabled={!(pagination.page > 1)}>
            <Button $variant="outline" size="sm" disabled={!(pagination.page > 1)}>Prev</Button>
          </a>
          <a href={withPage((pagination.page || 1) + 1)} aria-disabled={!(pagination.page < (pagination.totalPages || 1))}>
            <Button $variant="outline" size="sm" disabled={!(pagination.page < (pagination.totalPages || 1))}>Next</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/messages/MessagesPageClient */
