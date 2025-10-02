// src/app/admin/invoices/InvoicesPageClient.jsx
/** @module admin/invoices/InvoicesPageClient */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/shadcn/Button";
import {
  FiDownload,
  FiPlus,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiLoader,
} from "react-icons/fi";
import { statsData, getStatusText, statusOption, timeOption } from "@/data/page/invoices/invoicesData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

const STATUS_COLORS = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  SENT: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

const DUE_STATUS_COLORS = {
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
  "due-soon": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  normal: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

const workflowStateLabels = {
  AWAITING_VALIDATION: "Awaiting Validation",
  READY_TO_SEND: "Ready to Send",
  SCHEDULED: "Scheduled",
  SENT_AND_PENDING_PAYMENT: "Awaiting Payment",
  IN_REMINDER_SEQUENCE: "Reminder Sequence",
  PAID_AND_CONFIRMED: "Paid & Confirmed",
  CLOSED: "Closed",
};

function StatusBadge({ status }) {
  const variant = STATUS_COLORS[status] || STATUS_COLORS.default;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variant)}>
      {getStatusText[status] || status}
    </span>
  );
}

function WorkflowBadge({ workflowState }) {
  if (!workflowState) return null;
  const label = workflowStateLabels[workflowState];
  if (!label) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      {label}
    </span>
  );
}

function DueBadge({ status }) {
  const variant = DUE_STATUS_COLORS[status] || DUE_STATUS_COLORS.normal;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", variant)}>
      {status === "overdue" ? "Overdue" : status === "due-soon" ? "Due soon" : "On track"}
    </span>
  );
}

function getDueDateStatus(dueDate, status) {
  if (!dueDate || status === "PAID" || status === "DRAFT") return "normal";
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due-soon";
  return "normal";
}

function getClientInitials(companyName) {
  if (!companyName) return "??";
  return companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function extractInvoiceMetadata(invoice) {
  const meta = invoice?.metadata;
  return meta && typeof meta === "object" ? meta : {};
}

/**
 * Admin invoices page client component.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialInvoices - Prefetched invoices.
 * @param {Object} props.initialStats - Prefetched stats summary.
 * @param {string} [props.initialSearch=""] - Seed search term.
 * @param {string} [props.initialStatus="all"] - Seed status filter.
 * @param {string} [props.initialClient="all"] - Seed client filter.
 * @param {string} [props.initialDate="all"] - Seed time filter.
 * @param {Object} [props.initialPagination] - Pagination metadata.
 * @param {Object} [props.initialSort] - Sorting metadata.
 * @returns {JSX.Element}
 */
export default function InvoicesPageClient({
  initialInvoices,
  initialStats,
  initialSearch = "",
  initialStatus = "all",
  initialClient = "all",
  initialDate = "all",
  initialPagination = { page: 1, limit: 20, totalCount: 0, totalPages: 1, hasNext: false, hasPrev: false },
  initialSort = { sortBy: "issueDate", sortOrder: "desc" },
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [invoices, setInvoices] = useState(initialInvoices || []);
  const [filteredInvoices, setFilteredInvoices] = useState(initialInvoices || []);
  const [stats, setStats] = useState(initialStats || { totalRevenue: 0, outstanding: 0, paidInvoices: 0, overdue: 0 });
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [clientFilter, setClientFilter] = useState(initialClient);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [viewMode, setViewMode] = useState("grid");
  const [pagination] = useState(initialPagination);
  const [sort] = useState(initialSort);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uniqueClients = useMemo(
    () => [...new Set(invoices.map((invoice) => invoice.project?.client?.companyName).filter(Boolean))],
    [invoices],
  );

  useEffect(() => {
    filterInvoices(invoices, { search: searchTerm, status: statusFilter, client: clientFilter, date: dateFilter });
  }, [invoices, searchTerm, statusFilter, clientFilter, dateFilter]);

  useEffect(() => {
    setInvoices(initialInvoices || []);
    setFilteredInvoices(initialInvoices || []);
    setStats(initialStats || { totalRevenue: 0, outstanding: 0, paidInvoices: 0, overdue: 0 });
    setSearchTerm(initialSearch);
    setStatusFilter(initialStatus);
    setClientFilter(initialClient);
    setDateFilter(initialDate);
  }, [initialInvoices, initialStats, initialSearch, initialStatus, initialClient, initialDate]);

  function pushFilters(next) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.status && next.status !== "all") params.set("status", next.status);
    if (next.client && next.client !== "all") params.set("client", next.client);
    if (next.date && next.date !== "all") params.set("date", next.date);
    if (next.sortBy) params.set("sortBy", next.sortBy);
    if (next.sortOrder) params.set("sortOrder", next.sortOrder);
    if (typeof next.page === "number") params.set("page", String(next.page));
    if (typeof next.limit === "number") params.set("limit", String(next.limit));
    router.replace(`${pathname}?${params.toString()}`);
  }

  function filterInvoices(source, { search, status, client, date }) {
    let filtered = source;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(q) ||
          invoice.project?.client?.companyName?.toLowerCase().includes(q) ||
          invoice.project?.name?.toLowerCase().includes(q),
      );
    }
    if (status !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === status.toUpperCase());
    }
    if (client !== "all") {
      filtered = filtered.filter((invoice) => invoice.project?.client?.companyName === client);
    }
    if (date !== "all") {
      const now = new Date();
      filtered = filtered.filter((invoice) => {
        const issueDate = new Date(invoice.issueDate);
        switch (date) {
          case "this-month":
            return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
          case "last-month": {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return issueDate.getMonth() === lastMonth.getMonth() && issueDate.getFullYear() === lastMonth.getFullYear();
          }
          case "this-quarter": {
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            return issueDate >= quarterStart;
          }
          case "this-year":
            return issueDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    setFilteredInvoices(filtered);
    calculateStats(filtered);
  }

  function calculateStats(list) {
    const now = new Date();
    const totalRevenue = list.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + invoice.amount, 0);
    const outstanding = list
      .filter((invoice) => ["SENT", "OVERDUE"].includes(invoice.status))
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidInvoices = list.filter((invoice) => invoice.status === "PAID").length;
    const overdue = list.filter((invoice) => invoice.status === "SENT" && new Date(invoice.dueDate) < now).length;
    setStats({ totalRevenue, outstanding, paidInvoices, overdue });
  }

  function handleSearchChange(event) {
    const value = event.target.value;
    setSearchTerm(value);
    pushFilters({
      search: value,
      status: statusFilter,
      client: clientFilter,
      date: dateFilter,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      page: 1,
      limit: pagination.limit,
    });
  }

  function handleStatusChange(event) {
    const value = event.target.value;
    setStatusFilter(value);
    pushFilters({ search: searchTerm, status: value, client: clientFilter, date: dateFilter, sortBy: sort.sortBy, sortOrder: sort.sortOrder, page: 1, limit: pagination.limit });
  }

  function handleClientChange(event) {
    const value = event.target.value;
    setClientFilter(value);
    pushFilters({ search: searchTerm, status: statusFilter, client: value, date: dateFilter, sortBy: sort.sortBy, sortOrder: sort.sortOrder, page: 1, limit: pagination.limit });
  }

  function handleDateChange(event) {
    const value = event.target.value;
    setDateFilter(value);
    pushFilters({ search: searchTerm, status: statusFilter, client: clientFilter, date: value, sortBy: sort.sortBy, sortOrder: sort.sortOrder, page: 1, limit: pagination.limit });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-10 text-sm text-muted">
        <FiLoader className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading invoices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400 bg-red-500/10 p-6 text-red-600">
        <h2 className="text-lg font-semibold text-foreground">Error loading invoices</h2>
        <p className="mt-2 text-sm">{error}</p>
        <Button className="mt-4" variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted">Manage invoices, track payments, and monitor revenue.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" className="gap-2">
            <FiDownload className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button className="gap-2">
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsData.map((card) => (
          <div key={card.label} className="flex h-full items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <p className="text-2xl font-semibold text-foreground">{card.value(stats)}</p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
              <p className={cn("mt-3 inline-flex items-center gap-1 text-xs font-semibold", card.isPositive(stats) ? "text-emerald-500" : "text-red-500")}> 
                <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
                {card.change(stats)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: card.color }}>
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOption.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={clientFilter}
            onChange={handleClientChange}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Clients</option>
            {uniqueClients.map((clientName) => (
              <option key={clientName} value={clientName}>
                {clientName}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={handleDateChange}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {timeOption.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" className="gap-2">
            <FiFilter className="h-4 w-4" aria-hidden="true" />
            More Filters
          </Button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                viewMode === "grid"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary text-primary hover:bg-primary/10",
              )}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                viewMode === "table"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary text-primary hover:bg-primary/10",
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center text-sm text-muted">
          <FiFilter className="h-10 w-10" aria-hidden="true" />
          <p className="mt-4 text-base font-semibold text-foreground">No invoices found</p>
          <p className="mt-1 text-sm text-muted">Adjust your search or filters to see more results.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Invoice #{invoice.invoiceNumber}</p>
                  <p className="text-xs text-muted">{invoice.project?.client?.companyName || "Unknown Client"}</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={invoice.status} />
                  <WorkflowBadge workflowState={invoice.workflowState} />
                </div>
              </div>

              <div className="grid gap-2 text-xs text-muted">
                <div>
                  <span className="font-semibold text-foreground">Issue Date:</span> {formatDate(invoice.issueDate)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Due:</span>
                  <DueBadge status={getDueDateStatus(invoice.dueDate, invoice.status)} />
                  <span>{formatDate(invoice.dueDate)}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Project:</span> {invoice.project?.name || "Unknown Project"}
                </div>
                {(() => {
                  const meta = extractInvoiceMetadata(invoice);
                  if (!meta) return null;
                  const hasHours = typeof meta.hours === "number" && meta.hours > 0;
                  const hasRate = typeof meta.rate === "number" && meta.rate > 0;
                  if (!hasHours && !hasRate) return null;
                  return (
                    <div>
                      <span className="font-semibold text-foreground">Work Logged:</span> {hasHours ? `${meta.hours} hrs` : ""}
                      {hasRate ? ` @ ${formatCurrency(meta.rate)}/hr` : ""}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted">
                <span>#{invoice.id.slice(0, 8)}</span>
                <Button variant="secondary" className="gap-2" size="sm" asChild>
                  <Link href={`/admin/invoices/${invoice.id}`}>View details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="hidden bg-background text-xs font-semibold uppercase tracking-wide text-muted md:grid md:grid-cols-[160px,1fr,1fr,120px,140px,140px,80px] md:gap-4 md:px-6 md:py-3">
            <span>Invoice</span>
            <span>Client</span>
            <span>Project</span>
            <span className="text-right">Amount</span>
            <span>Status</span>
            <span>Issue Date</span>
            <span>Due</span>
          </div>
          <div className="divide-y divide-border">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid gap-4 px-4 py-4 text-sm text-foreground md:grid-cols-[160px,1fr,1fr,120px,140px,140px,80px] md:items-center md:px-6"
              >
                <div>
                  <p className="font-semibold">#{invoice.invoiceNumber}</p>
                  <p className="text-xs text-muted">ID: {invoice.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {getClientInitials(invoice.project?.client?.companyName)}
                  </span>
                  <span>{invoice.project?.client?.companyName || "Unknown Client"}</span>
                </div>
                <div className="text-sm text-muted">{invoice.project?.name || "Unknown Project"}</div>
                <div className="text-right text-sm font-semibold">{formatCurrency(invoice.amount)}</div>
                <div className="flex flex-col gap-2 text-sm">
                  <StatusBadge status={invoice.status} />
                  <WorkflowBadge workflowState={invoice.workflowState} />
                </div>
                <div className="text-sm text-muted">{formatDate(invoice.issueDate)}</div>
                <div className="flex items-center justify-between gap-2 text-sm text-muted md:justify-start">
                  <span>{formatDate(invoice.dueDate)}</span>
                  <DueBadge status={getDueDateStatus(invoice.dueDate, invoice.status)} />
                  <IconButton aria-label="Invoice actions">
                    <FiMoreVertical className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
