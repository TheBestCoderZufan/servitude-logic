// src/app/dashboard/messages/MessagesPageClient.jsx
"use client";
import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  Input,
  Select,
  Button,
  Textarea,
  Badge,
} from "@/components/ui/dashboard";
import { FiSend } from "react-icons/fi";

/**
 * Messages & Support client island with SSR project filter + pagination.
 *
 * @param {{ projects: Array<Object>, messages: Array<Object>, pagination: { page: number, totalPages: number, limit: number }, filters: Record<string, string> }} props - Component props.
 * @returns {JSX.Element}
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
    const params = new URLSearchParams({ projectId, page: String(pagination.page || 1), limit: String(pagination.limit || 20) });
    params.set("page", String(page));
    if (!projectId) {
      params.delete("projectId");
    }
    return `?${params.toString()}`;
  };

  const send = async () => {
    if (!text.trim() || !projectId) {
      return;
    }
    await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, projectId }),
    });
    setText("");
    formRef.current?.requestSubmit();
  };

  const submitSupport = async () => {
    if (!projectId || !supportSubject.trim()) {
      return;
    }
    setSubmittingSupport(true);
    try {
      await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Support: ${supportSubject} — ${supportDetails}`,
          projectId,
          type: "support_request",
        }),
      });
      setSupportSubject("");
      setSupportDetails("");
    } finally {
      setSubmittingSupport(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Messages &amp; Support</h1>
        <p className="text-base text-muted">
          Stay aligned with the team, or submit support requests when you need help.
        </p>
      </header>

      <form
        ref={formRef}
        method="get"
        className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-surface/80 p-4"
      >
        <Select
          name="projectId"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            submitOnChange();
          }}
          aria-label="Select project"
          className="w-full rounded-xl bg-surface sm:w-64"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Input name="page" defaultValue={String(pagination.page)} type="hidden" />
        <Input name="limit" defaultValue={String(pagination.limit)} type="hidden" />
      </form>

      <div className="inline-flex gap-3 rounded-full border border-border/70 bg-surface/80 p-1">
        <Button
          type="button"
          variant={activeTab === "messages" ? "primary" : "secondary"}
          size="sm"
          className="rounded-full px-4"
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </Button>
        <Button
          type="button"
          variant={activeTab === "support" ? "primary" : "secondary"}
          size="sm"
          className="rounded-full px-4"
          onClick={() => setActiveTab("support")}
        >
          Support
        </Button>
      </div>

      {activeTab === "messages" ? (
        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center">
              <Input
                placeholder="Write a message..."
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="rounded-xl bg-surface"
              />
              <Button
                type="button"
                variant="primary"
                className="rounded-xl"
                onClick={send}
                disabled={!projectId || !text.trim()}
              >
                <FiSend aria-hidden className="mr-2" />
                Send
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4 rounded-3xl border border-border/70 bg-surface/80 p-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="space-y-2 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <Badge variant="outline">{message.project?.name || "General"}</Badge>
                    <span className="text-xs text-muted">{message.createdAt ? formatDate(message.createdAt) : ""}</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {typeof message.text === "string" ? message.text : JSON.stringify(message.text)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No messages yet. Select a project to get started.</p>
            )}
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl">
          <CardContent className="space-y-6 px-6 py-6">
            <div className="space-y-3">
              <Input
                placeholder="Subject"
                value={supportSubject}
                onChange={(event) => setSupportSubject(event.target.value)}
                className="rounded-xl bg-surface"
              />
              <Textarea
                placeholder="Details"
                value={supportDetails}
                onChange={(event) => setSupportDetails(event.target.value)}
                className="rounded-xl bg-surface"
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                className="rounded-xl"
                onClick={submitSupport}
                disabled={submittingSupport || !projectId || !supportSubject.trim()}
              >
                {submittingSupport ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-surface/80 px-6 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div className="flex gap-3">
          <a
            href={withPage(Math.max(1, (pagination.page || 1) - 1))}
            aria-disabled={!(pagination.page > 1)}
            className={!(pagination.page > 1) ? "pointer-events-none opacity-60" : ""}
          >
            <Button variant="secondary" size="sm" className="rounded-lg" disabled={!(pagination.page > 1)}>
              Prev
            </Button>
          </a>
          <a
            href={withPage((pagination.page || 1) + 1)}
            aria-disabled={!(pagination.page < (pagination.totalPages || 1))}
            className={!(pagination.page < (pagination.totalPages || 1)) ? "pointer-events-none opacity-60" : ""}
          >
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              disabled={!(pagination.page < (pagination.totalPages || 1))}
            >
              Next
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/messages/MessagesPageClient */
