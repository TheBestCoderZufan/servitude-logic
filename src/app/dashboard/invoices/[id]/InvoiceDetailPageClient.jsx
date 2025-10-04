// src/app/dashboard/invoices/[id]/InvoiceDetailPageClient.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/dashboard";
import { FiChevronLeft } from "react-icons/fi";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  PAID: "success",
  OVERDUE: "error",
  SENT: "warning",
  DRAFT: "default",
};

/**
 * Invoice detail client island.
 *
 * @param {{ invoice: Object }} props - Props containing invoice payload with breakdown data.
 * @returns {JSX.Element}
 */
export default function InvoiceDetailPageClient({ invoice }) {
  const [paying, setPaying] = useState(false);
  const badgeVariant = STATUS_VARIANTS[invoice.status] || "default";
  const breakdown = invoice.timeLogsByUser?.flatMap((user) => user.logs) || [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-sm text-muted">
            {invoice.project?.client?.companyName || invoice.project?.name || "Client"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={badgeVariant}>{invoice.status.toLowerCase()}</Badge>
          {invoice.status !== "PAID" ? (
            <Button
              type="button"
              variant="primary"
              className="rounded-lg"
              disabled={paying}
              onClick={() => {
                setPaying(true);
                setTimeout(() => setPaying(false), 800);
              }}
            >
              {paying ? "Opening..." : "Pay Now"}
            </Button>
          ) : null}
          <Link href="/dashboard/invoices" className="inline-flex">
            <Button variant="secondary" size="sm" className="rounded-lg">
              <FiChevronLeft aria-hidden className="mr-2" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted">Amount</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted">Issue Date</p>
            <p className="text-sm text-foreground/80">{formatDate(invoice.issueDate)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-muted">Due Date</p>
            <p className="text-sm text-foreground/80">{formatDate(invoice.dueDate)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.length > 0 ? (
              breakdown.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-foreground/80">
                    {log.description || log.taskTitle || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted">{log.hours}</TableCell>
                  <TableCell className="text-sm text-muted">{log.user?.name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted">{formatDate(log.date)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <CardContent className="py-10 text-center text-sm text-muted">
                    No breakdown available.
                  </CardContent>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
/** @module dashboard/invoices/InvoiceDetailPageClient */
