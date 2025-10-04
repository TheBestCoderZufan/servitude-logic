// src/app/dashboard/invoices/InvoicesPageClient.jsx
"use client";
import React, { useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Select,
  Button,
} from "@/components/ui/dashboard";
import { FiSearch } from "react-icons/fi";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  PAID: "success",
  OVERDUE: "error",
  SENT: "warning",
  DRAFT: "default",
};

/**
 * Invoices list client island with SSR filters/pagination/sorting.
 *
 * @param {{ invoices: Array<Object>, pagination: { page: number, totalPages: number, limit: number }, filters: Record<string, string> }} props - Component props.
 * @returns {JSX.Element}
 */
export default function InvoicesPageClient({ invoices = [], pagination, filters }) {
  const formRef = useRef(null);
  const submitOnChange = () => formRef.current?.requestSubmit();

  const withPage = (page) => {
    const params = new URLSearchParams({
      search: filters.search || "",
      status: filters.status || "all",
      sortBy: filters.sortBy || "issueDate",
      sortOrder: filters.sortOrder || "desc",
      limit: String(pagination.limit || 20),
      page: String(page),
      projectId: filters.projectId || "",
    });
    if (!filters.projectId) {
      params.delete("projectId");
    }
    return `?${params.toString()}`;
  };

  const hasInvoices = invoices.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Invoices</h1>
        <p className="text-base text-muted">
          {filters.projectId ? "Project invoices" : "All outstanding and historical invoices"}
        </p>
      </header>

      <form
        ref={formRef}
        method="get"
        className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-surface/80 p-4"
      >
        <div className="relative flex-1 min-w-[280px]">
          <FiSearch aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            name="search"
            placeholder="Search invoices..."
            defaultValue={filters.search || ""}
            onChange={submitOnChange}
            aria-label="Search invoices"
            className="rounded-xl bg-surface pl-11"
          />
        </div>
        <Select
          name="status"
          defaultValue={filters.status || "all"}
          onChange={submitOnChange}
          aria-label="Status filter"
          className="w-full rounded-xl bg-surface sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
        </Select>
        <Select
          name="sortBy"
          defaultValue={filters.sortBy || "issueDate"}
          onChange={submitOnChange}
          aria-label="Sort by"
          className="w-full rounded-xl bg-surface sm:w-44"
        >
          <option value="issueDate">Issue Date</option>
          <option value="dueDate">Due Date</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
        </Select>
        <Select
          name="sortOrder"
          defaultValue={filters.sortOrder || "desc"}
          onChange={submitOnChange}
          aria-label="Sort order"
          className="w-full rounded-xl bg-surface sm:w-32"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>
        <Select
          name="limit"
          defaultValue={String(pagination.limit || 20)}
          onChange={submitOnChange}
          aria-label="Per page"
          className="w-full rounded-xl bg-surface sm:w-28"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </form>

      <Card className="rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Due</TableHead>
              <TableHead aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasInvoices ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm font-semibold text-foreground">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-sm text-muted">{invoice.project?.name || "—"}</TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[invoice.status] || "default"}>
                      {invoice.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted">
                    {invoice.issueDate ? formatDate(invoice.issueDate) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/invoices/${invoice.id}`} className="inline-flex">
                      <Button variant="secondary" size="sm" className="rounded-lg">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <CardContent className="py-10 text-center text-sm text-muted">
                    No invoices match your filters.
                  </CardContent>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-surface/80 px-6 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div className="flex gap-3">
          <Link
            href={withPage(Math.max(1, (pagination.page || 1) - 1))}
            aria-disabled={!(pagination.page > 1)}
            className={!(pagination.page > 1) ? "pointer-events-none opacity-60" : ""}
          >
            <Button variant="secondary" size="sm" className="rounded-lg" disabled={!(pagination.page > 1)}>
              Prev
            </Button>
          </Link>
          <Link
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
          </Link>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/invoices/InvoicesPageClient */
