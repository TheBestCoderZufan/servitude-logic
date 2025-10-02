// src/app/admin/intake/IntakeQueuePageClient.jsx
/** @module admin/intake/IntakeQueuePageClient */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/shadcn/Button";
import { FiUserCheck, FiSend, FiCornerUpLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";
import { useToastNotifications } from "@/components/ui/Toast";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import { cn } from "@/lib/utils/cn";

const STATUS_BADGE_CLASSES = {
  REVIEW_PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  RETURNED_FOR_INFO: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  APPROVED_FOR_ESTIMATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  ESTIMATE_IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
  ESTIMATE_SENT: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  CLIENT_SCOPE_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  CLIENT_SCOPE_DECLINED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

const actionLabels = {
  approve_for_estimate: "Approve for estimation",
  return_for_info: "Request more info",
  assign_to_me: "Assign to me",
};

const ACTIONS_REQUIRING_COMMENT = new Set(["approve_for_estimate", "return_for_info"]);

/**
 * @typedef {Object} Intake
 * @property {string} id
 * @property {string} status
 * @property {string|null} summary
 * @property {string} submittedAt
 * @property {string|null} approvedForEstimateAt
 * @property {string|null} returnedForInfoAt
 * @property {{id:string,name:string,email:string}|null} assignedAdmin
 * @property {{id:string,companyName:string,contactName:string,contactEmail:string}} client
 * @property {Object} formData
 * @property {string[]} missingRequired
 */

/**
 * Admin intake queue client component built with Tailwind primitives.
 *
 * @param {Object} props - Component props.
 * @param {Array<Intake>} props.initialIntakes - Intake records sourced from the server.
 * @param {Array<{value:string,label:string}>} props.statusOptions - Status filter options.
 * @param {Object} props.viewer - Details about the signed-in admin.
 * @param {string} props.activeStatus - Currently applied status filter key.
 * @returns {JSX.Element}
 */
export default function IntakeQueuePageClient({ initialIntakes, statusOptions, viewer, activeStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notifyError, notifySuccess } = useToastNotifications();

  const [intakes, setIntakes] = useState(initialIntakes || []);
  const [pendingAction, setPendingAction] = useState(null);
  const [commentValue, setCommentValue] = useState("");
  const [selectedMissing, setSelectedMissing] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    setIntakes(initialIntakes || []);
  }, [initialIntakes]);

  const statusCounts = useMemo(
    () =>
      intakes.reduce((accumulator, intake) => {
        accumulator[intake.status] = (accumulator[intake.status] || 0) + 1;
        return accumulator;
      }, {}),
    [intakes],
  );

  const filteredIntakes = useMemo(() => {
    if (!activeStatus || activeStatus === "all") return intakes;
    return intakes.filter((intake) => intake.status === activeStatus);
  }, [intakes, activeStatus]);

  function handleStatusChange(event) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`?${params.toString()}`);
  }

  function openAction(intakeId, action) {
    setPendingAction({ intakeId, action });
    setCommentValue("");
    setSelectedMissing([]);
  }

  function closeAction() {
    setPendingAction(null);
    setCommentValue("");
    setSelectedMissing([]);
    setSubmitting(false);
  }

  function toggleMissing(fieldId) {
    setSelectedMissing((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId],
    );
  }

  async function submitAction(event) {
    event?.preventDefault();
    if (!pendingAction) return;

    if (ACTIONS_REQUIRING_COMMENT.has(pendingAction.action) && !commentValue.trim()) {
      notifyError("Please add a comment before continuing.");
      return;
    }

    const payload = { action: pendingAction.action };
    if (commentValue.trim()) payload.comment = commentValue.trim();
    if (pendingAction.action === "return_for_info") {
      payload.missingFields = selectedMissing;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/intake/${pendingAction.intakeId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        throw new Error(message?.error || "Action failed");
      }

      notifySuccess(actionLabels[pendingAction.action] || "Action completed");
      closeAction();
      router.refresh();
    } catch (actionError) {
      notifyError(actionError.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  useWorkflowEvents({
    onEvent: (payload) => {
      if (!payload || payload.type !== "workflow.event") return;
      if (payload.event?.entity !== "intake") return;
      const now = Date.now();
      if (now - lastRefreshRef.current < 2500) return;
      lastRefreshRef.current = now;
      router.refresh();
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Intake Queue</h1>
          <p className="text-sm text-muted">
            Review new client submissions and move them toward estimation.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
        <label htmlFor="intake-status-filter" className="text-xs font-semibold uppercase tracking-wide text-muted">
          Status
        </label>
        <select
          id="intake-status-filter"
          value={activeStatus || "all"}
          onChange={handleStatusChange}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All statuses ({intakes.length})</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({statusCounts[option.value] || 0})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredIntakes.map((intake) => {
          const activeAction = pendingAction?.intakeId === intake.id ? pendingAction.action : null;
          const assignedLabel = intake.assignedAdmin?.name || "Unassigned";
          const submittedLabel = formatDate(intake.submittedAt);
          const missingList = intake.missingRequired || [];
          const badgeClass = STATUS_BADGE_CLASSES[intake.status] || STATUS_BADGE_CLASSES.default;

          return (
            <div key={intake.id} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {intake.summary || intake.formData?.projectName || "Untitled request"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    <strong className="font-semibold text-foreground">Client:</strong> {" "}
                    {intake.client.companyName} ({intake.client.contactName})
                  </p>
                </div>
                <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", badgeClass)}>
                  {intake.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid gap-1 text-sm text-muted">
                <span>
                  <strong className="font-semibold text-foreground">Submitted:</strong> {submittedLabel}
                </span>
                <span>
                  <strong className="font-semibold text-foreground">Owner:</strong> {assignedLabel}
                </span>
                <span>
                  <strong className="font-semibold text-foreground">Budget:</strong> {intake.formData?.budgetRange || "—"}
                </span>
                <span>
                  <strong className="font-semibold text-foreground">Target launch:</strong> {intake.formData?.targetLaunch || "—"}
                </span>
              </div>

              {missingList.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">Missing context</p>
                  <ul className="ml-4 list-disc text-xs text-amber-600 dark:text-amber-200">
                    {missingList.map((field) => (
                      <li key={field}>{field.replace(/([A-Z])/g, " $1").toLowerCase()}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => openAction(intake.id, "assign_to_me")}
                  disabled={submitting}
                >
                  <FiUserCheck className="h-4 w-4" aria-hidden="true" />
                  Assign to me
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => openAction(intake.id, "approve_for_estimate")}
                  disabled={
                    submitting || !["REVIEW_PENDING", "RETURNED_FOR_INFO"].includes(intake.status)
                  }
                >
                  <FiSend className="h-4 w-4" aria-hidden="true" />
                  Approve for estimation
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => openAction(intake.id, "return_for_info")}
                  disabled={submitting}
                >
                  <FiCornerUpLeft className="h-4 w-4" aria-hidden="true" />
                  Request updates
                </Button>
                <Button variant="secondary" size="sm" className="gap-2" asChild>
                  <Link href={`/admin/intake/${intake.id}/proposal`}>Workspace</Link>
                </Button>
              </div>

              {activeAction ? (
                <form
                  onSubmit={submitAction}
                  className="space-y-3 rounded-xl border border-border bg-background/60 p-4"
                  aria-label={`${actionLabels[activeAction]} for intake`}
                >
                  {ACTIONS_REQUIRING_COMMENT.has(activeAction) ? (
                    <div className="space-y-1">
                      <label htmlFor={`comment-${intake.id}`} className="text-sm font-semibold text-foreground">
                        Comment
                      </label>
                      <textarea
                        id={`comment-${intake.id}`}
                        value={commentValue}
                        onChange={(event) => setCommentValue(event.target.value)}
                        rows={3}
                        placeholder="Share context for the client or internal team."
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ) : null}

                  {activeAction === "return_for_info" && missingList.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Missing items</p>
                      <p className="text-xs text-muted">
                        Select the fields you&apos;re requesting from the client.
                      </p>
                      <div className="grid gap-2 text-sm text-foreground">
                        {missingList.map((field) => {
                          const prettyLabel = field.replace(/([A-Z])/g, " $1");
                          return (
                            <label key={`${intake.id}-${field}`} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedMissing.includes(field)}
                                onChange={() => toggleMissing(field)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                              />
                              <span>{prettyLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={closeAction}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={submitting}>
                      {submitting ? "Working..." : actionLabels[activeAction] || "Submit"}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
