// src/app/dashboard/proposals/ProposalsPageClient.jsx
"use client";
import React from "react";
import Link from "next/link";
import { Badge, Card, CardContent } from "@/components/ui/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  DRAFT: "default",
  IN_REVIEW: "warning",
  CLIENT_APPROVAL_PENDING: "info",
  APPROVED: "success",
  DECLINED: "error",
};

/**
 * Client proposals overview page.
 *
 * @param {{proposals: Array<Object>}} props - Component props.
 * @returns {JSX.Element}
 */
export default function ProposalsPageClient({ proposals = [] }) {
  const hasProposals = proposals.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Proposals</h1>
        <p className="text-base text-muted">
          Review scopes awaiting approval and revisit past agreements.
        </p>
      </header>

      {hasProposals ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {proposals.map((proposal) => {
            const variant = STATUS_VARIANTS[proposal.status] || "default";
            const estimate = formatCurrency(proposal.estimateAmount || 0);
            const hours = Number(proposal.estimatedHours || 0).toFixed(1);
            const title = proposal.intake?.projectName || proposal.project?.name || "Project proposal";

            return (
              <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`} className="block">
                <Card interactive className="h-full rounded-3xl">
                  <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
                      <Badge variant={variant}>{proposal.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <CardContent className="space-y-3 px-0 pb-0">
                      <p className="text-sm text-muted">
                        <strong className="font-semibold text-foreground">Estimate:</strong> {estimate} · {hours} hrs
                      </p>
                      {proposal.sentAt ? (
                        <p className="text-sm text-muted">
                          <strong className="font-semibold text-foreground">Shared:</strong> {formatDate(proposal.sentAt)}
                        </p>
                      ) : null}
                      {proposal.clientApprovedAt ? (
                        <p className="text-sm text-muted">
                          <strong className="font-semibold text-foreground">Approved:</strong> {formatDate(proposal.clientApprovedAt)}
                        </p>
                      ) : null}
                      {proposal.clientDeclinedAt ? (
                        <p className="text-sm text-muted">
                          <strong className="font-semibold text-foreground">Declined:</strong> {formatDate(proposal.clientDeclinedAt)}
                        </p>
                      ) : null}
                      <p className="text-sm text-muted">
                        {proposal.summary || "No summary provided."}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-border/70 bg-surface/80 p-12 text-center text-sm text-muted">
          No proposals yet. New proposals will appear here once Servitude Logic prepares them.
        </div>
      )}
    </div>
  );
}
/** @module dashboard/proposals/ProposalsPageClient */
