// src/app/dashboard/proposals/[id]/ProposalDetailPageClient.jsx
"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/dashboard";
import { useToastNotifications } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  DRAFT: "default",
  IN_REVIEW: "warning",
  CLIENT_APPROVAL_PENDING: "info",
  APPROVED: "success",
  DECLINED: "error",
};

/**
 * Proposal detail component for clients.
 *
 * @param {{proposal: Object, modules: Array}} props - Component props.
 * @returns {JSX.Element}
 */
export default function ProposalDetailPageClient({ proposal, modules }) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useToastNotifications();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const moduleLookup = useMemo(
    () => modules.reduce((accumulator, module) => ({ ...accumulator, [module.id]: module }), {}),
    [modules],
  );

  const isFinalised = proposal.status === "APPROVED" || proposal.status === "DECLINED";

  async function respond(action) {
    if (isFinalised) {
      return;
    }

    if (action === "decline" && !comment.trim()) {
      setError("Please share feedback so the team knows what to update.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error || "Unable to update proposal");
      }

      notifySuccess(action === "approve" ? "Thanks! Proposal approved." : "Feedback sent to Servitude Logic.");
      setComment("");
      router.refresh();
    } catch (submitError) {
      notifyError(submitError.message || "Unable to process request");
    } finally {
      setSubmitting(false);
    }
  }

  const totalHours = proposal.estimatedHours?.toFixed(1) || "0.0";
  const selectedModules = proposal.selectedModules || [];
  const badgeVariant = STATUS_VARIANTS[proposal.status] || "default";

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">Proposal overview</h1>
          <p className="text-sm text-muted">
            {proposal.intake?.projectName || "Project"} · Shared {proposal.sentAt ? formatDate(proposal.sentAt) : "recently"}
          </p>
        </div>
        <Badge variant={badgeVariant}>{proposal.status.replace(/_/g, " ")}</Badge>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="rounded-3xl">
          <CardContent className="space-y-6 px-6 py-6">
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold text-foreground">Scope summary</h2>
              <p className="text-sm text-muted">
                {proposal.summary || "No summary provided."}
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line item</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposal.lineItems.map((item, index) => (
                  <TableRow key={`${item.title}-${index}`}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted">{item.description}</p>
                    </TableCell>
                    <TableCell>{Number(item.hours || 0).toFixed(1)}</TableCell>
                    <TableCell>{formatCurrency(item.rate || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.amount || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-1 text-sm text-muted">
              <p>
                <strong className="font-semibold text-foreground">Total investment:</strong> {formatCurrency(proposal.estimateAmount || 0)}
              </p>
              <p>
                <strong className="font-semibold text-foreground">Total hours:</strong> {totalHours} hours
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="space-y-6 px-6 py-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">Project context</h2>
              </div>
              <div className="space-y-3 text-sm text-muted">
                <div>
                  <p className="font-semibold text-foreground">Goals</p>
                  <p>{proposal.intake?.goalStatement || "No goals provided."}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Target launch</p>
                  <p>{proposal.intake?.targetLaunch || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Stakeholders</p>
                  <p>{proposal.intake?.stakeholders || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Selected modules</p>
                  <p>
                    {selectedModules.length === 0
                      ? "No preset modules were selected."
                      : selectedModules
                          .map((moduleId) => moduleLookup[moduleId]?.title || moduleId)
                          .join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {!isFinalised ? (
              <div className="space-y-3">
                <label htmlFor="proposal-comment" className="text-sm font-semibold text-foreground">
                  Share feedback (required for revisions)
                </label>
                <Textarea
                  id="proposal-comment"
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Let the team know if you agree or what needs revision."
                />
                <p className="text-xs text-muted">
                  Approvals are logged for compliance. Declining requires a short note so the team can address it.
                </p>
                {error ? <p className="text-xs font-semibold text-error">{error}</p> : null}
                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-lg"
                    onClick={() => respond("decline")}
                    disabled={submitting}
                  >
                    Request revision
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="rounded-lg"
                    onClick={() => respond("approve")}
                    disabled={submitting}
                  >
                    Approve proposal
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">
                {proposal.status === "APPROVED"
                  ? "This proposal has been approved. A new project plan is being prepared."
                  : "This proposal was declined. The team will follow up with next steps."}
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
/** @module dashboard/proposals/[id]/ProposalDetailPageClient */
