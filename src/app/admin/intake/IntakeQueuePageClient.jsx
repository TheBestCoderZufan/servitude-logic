// src/app/admin/intake/IntakeQueuePageClient.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Badge, HelperText, TextArea } from "@/components/ui";
import { FiUserCheck, FiSend, FiCornerUpLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";
import { useToastNotifications } from "@/components/ui/Toast";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import {
  PageHeader,
  TitleGroup,
  PageTitle,
  PageSubtitle,
  FiltersRow,
  StatusFilterSelect,
  IntakeGrid,
  IntakeCard,
  IntakeHeader,
  IntakeTitle,
  IntakeMeta,
  MissingList,
  ActionsRow,
  InlineForm,
  InlineActions,
} from "./IntakeQueuePageClient.style";

const statusVariants = {
  REVIEW_PENDING: "warning",
  RETURNED_FOR_INFO: "warning",
  APPROVED_FOR_ESTIMATE: "success",
  ESTIMATE_IN_PROGRESS: "inProgress",
  ESTIMATE_SENT: "info",
  CLIENT_SCOPE_APPROVED: "success",
  CLIENT_SCOPE_DECLINED: "error",
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
 * Admin intake queue client component.
 *
 * @param {Object} props - Component props.
 * @param {Intake[]} props.initialIntakes - Intake records sourced from the server.
 * @param {Array} props.statusOptions - Status filter options for the view.
 * @param {Object} props.viewer - Details about the signed-in admin.
 * @param {string} props.activeStatus - Currently applied status filter key.
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

  const statusCounts = useMemo(() => {
    return intakes.reduce((accumulator, intake) => {
      accumulator[intake.status] = (accumulator[intake.status] || 0) + 1;
      return accumulator;
    }, {});
  }, [intakes]);

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
    setSelectedMissing((prev) => {
      if (prev.includes(fieldId)) {
        return prev.filter((id) => id !== fieldId);
      }
      return [...prev, fieldId];
    });
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
    <div>
      <PageHeader>
        <TitleGroup>
          <PageTitle>Intake Queue</PageTitle>
          <PageSubtitle>Review new client submissions and move them toward estimation.</PageSubtitle>
        </TitleGroup>
      </PageHeader>

      <FiltersRow>
        <StatusFilterSelect value={activeStatus || "all"} onChange={handleStatusChange} aria-label="Filter by intake status">
          <option value="all">All statuses ({intakes.length})</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({statusCounts[option.value] || 0})
            </option>
          ))}
        </StatusFilterSelect>
      </FiltersRow>

      <IntakeGrid>
        {filteredIntakes.map((intake) => {
          const activeAction = pendingAction?.intakeId === intake.id ? pendingAction.action : null;
          const assignedLabel = intake.assignedAdmin?.name || "Unassigned";
          const submittedLabel = formatDate(intake.submittedAt);
          const missingList = intake.missingRequired || [];

          return (
            <IntakeCard key={intake.id}>
              <IntakeHeader>
                <IntakeTitle>{intake.summary || intake.formData?.projectName || "Untitled request"}</IntakeTitle>
                <Badge variant={statusVariants[intake.status] || "default"}>{intake.status.replace(/_/g, " ")}</Badge>
              </IntakeHeader>

              <IntakeMeta>
                <span>
                  <strong>Client:</strong> {intake.client.companyName} ({intake.client.contactName})
                </span>
                <span>
                  <strong>Submitted:</strong> {submittedLabel}
                </span>
                <span>
                  <strong>Owner:</strong> {assignedLabel}
                </span>
                <span>
                  <strong>Budget:</strong> {intake.formData?.budgetRange || "—"}
                </span>
                <span>
                  <strong>Target launch:</strong> {intake.formData?.targetLaunch || "—"}
                </span>
              </IntakeMeta>

              {missingList.length > 0 && (
                <div>
                  <strong>Missing context</strong>
                  <MissingList>
                    {missingList.map((field) => (
                      <li key={field}>{field.replace(/([A-Z])/g, " $1").toLowerCase()}</li>
                    ))}
                  </MissingList>
                </div>
              )}

              <ActionsRow>
                <Button size="sm" variant="outline" onClick={() => openAction(intake.id, "assign_to_me")} disabled={submitting}>
                  <FiUserCheck /> Assign to me
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAction(intake.id, "approve_for_estimate")}
                  disabled={submitting || !["REVIEW_PENDING", "RETURNED_FOR_INFO"].includes(intake.status)}
                >
                  <FiSend /> Approve for estimation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAction(intake.id, "return_for_info")}
                  disabled={submitting}
                >
                  <FiCornerUpLeft /> Request updates
                </Button>
                <Link href={`/admin/intake/${intake.id}/proposal`} legacyBehavior>
                  <Button as="a" size="sm" variant="outline">
                    Workspace
                  </Button>
                </Link>
              </ActionsRow>

              {activeAction && (
                <InlineForm onSubmit={submitAction} aria-label={`${actionLabels[activeAction]} for intake` }>
                  {ACTIONS_REQUIRING_COMMENT.has(activeAction) && (
                    <>
                      <label htmlFor={`comment-${intake.id}`} style={{ fontWeight: 600 }}>Comment</label>
                      <TextArea
                        id={`comment-${intake.id}`}
                        value={commentValue}
                        onChange={(event) => setCommentValue(event.target.value)}
                        rows={3}
                        placeholder="Share context for the client or internal team."
                        required
                      />
                    </>
                  )}

                  {activeAction === "return_for_info" && missingList.length > 0 && (
                    <div>
                      <strong>Missing items</strong>
                      <HelperText>Select the fields you&apos;re requesting from the client.</HelperText>
                      <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {missingList.map((field) => {
                          const fieldId = `${intake.id}-${field}`;
                          const prettyLabel = field.replace(/([A-Z])/g, " $1");
                          return (
                            <label key={fieldId} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input
                                type="checkbox"
                                checked={selectedMissing.includes(field)}
                                onChange={() => toggleMissing(field)}
                              />
                              <span>{prettyLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <InlineActions>
                    <Button type="button" variant="outline" onClick={closeAction} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Working..." : actionLabels[activeAction] || "Submit"}
                    </Button>
                  </InlineActions>
                </InlineForm>
              )}
            </IntakeCard>
          );
        })}
      </IntakeGrid>
    </div>
  );
}
/** @module admin/intake/IntakeQueuePageClient */
