// src/app/dashboard/approvals/[id]/ApprovalDetailPageClient.jsx
"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui/dashboard";
import { FiChevronLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  COMPLETED: "success",
  OVERDUE: "error",
  "DUE-SOON": "warning",
};

/**
 * Approval detail page client component.
 *
 * @param {{ item: Object }} props - Server-provided approval record.
 * @returns {JSX.Element}
 */
export default function ApprovalDetailPageClient({ item }) {
  const isCompleted = item.status === "COMPLETED";
  const dueStatus = isCompleted
    ? "COMPLETED"
    : item.dueDateStatus === "overdue"
    ? "OVERDUE"
    : item.dueDateStatus === "due-soon"
    ? "DUE-SOON"
    : null;
  const badgeVariant = dueStatus ? STATUS_VARIANTS[dueStatus] || "default" : "default";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Approval: {item.title}
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{item.project?.name || "Unassigned project"}</span>
            <span aria-hidden="true" className="text-muted">&bull;</span>
            <span>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"}</span>
          </p>
        </div>
        <Link href="/dashboard/approvals" className="inline-flex">
          <Button variant="secondary" size="sm" className="rounded-lg">
            <FiChevronLeft aria-hidden className="mr-2" /> Back
          </Button>
        </Link>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted">Status</p>
              <Badge variant={badgeVariant}>
                {isCompleted ? "Completed" : "Awaiting Your Signature"}
              </Badge>
            </div>
            {!isCompleted ? (
              <div className="ml-auto">
                <Button
                  type="button"
                  variant="primary"
                  className="rounded-lg"
                  onClick={() => window.location.assign("/dashboard/approvals")}
                >
                  Sign
                </Button>
              </div>
            ) : null}
          </div>

          {item.description ? (
            <p className="text-sm text-foreground/80">{item.description}</p>
          ) : (
            <p className="text-sm text-muted">No additional instructions were provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
/** @module dashboard/approvals/ApprovalDetailPageClient */
