// src/app/admin/invoices/InvoicesPageClient.jsx
/** @module admin/invoices/InvoicesPageClient */
"use client";
import { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui";
import {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  HeaderActions,
  StatsGrid,
  StatInfo,
  StatValue,
  StatLabel,
  StatChange,
  StatIcon,
  FiltersBar,
  SearchContainer,
  ViewToggle,
  InvoicesGrid,
  StatusIndicator,
  InvoiceCardHeader,
  InvoiceInfo,
  InvoiceNumber,
  InvoiceClient,
  InvoiceAmount,
  InvoiceMeta,
  InvoiceMetaItem,
  InvoiceMetaLabel,
  InvoiceMetaValue,
  DueDateIndicator,
  LoadingContainer,
  ErrorContainer,
  LoadingSpinner,
  StatCard,
  StatContent,
  SearchIcon,
  SearchInput,
  FilterSelect,
  ViewButton,
  InvoiceCard,
} from "./style";
import { FiPlus, FiFilter, FiDownload, FiMoreVertical, FiTrendingUp } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { statsData, getStatusVariant, getStatusText, statusOption, timeOption } from "@/data/page/invoices/invoicesData";
import { formatCurrency, formatDate } from "@/lib/utils";

const workflowStateLabels = {
  AWAITING_VALIDATION: "Awaiting Validation",
  READY_TO_SEND: "Ready to Send",
  SCHEDULED: "Scheduled",
  SENT_AND_PENDING_PAYMENT: "Awaiting Payment",
  IN_REMINDER_SEQUENCE: "Reminder Sequence",
  PAID_AND_CONFIRMED: "Paid & Confirmed",
  CLOSED: "Closed",
};

/**
 * Client island for Admin Invoices page.
 * @param {Object} props
 * @param {Array<Object>} props.initialInvoices
 * @param {Object} props.initialStats
 */
export default function InvoicesPageClient({ initialInvoices, initialStats, initialSearch = "", initialStatus = "all", initialClient = "all", initialDate = "all", initialPagination = { page: 1, limit: 20, totalCount: 0, totalPages: 1, hasNext: false, hasPrev: false }, initialSort = { sortBy: "issueDate", sortOrder: "desc" } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [invoices, setInvoices] = useState(initialInvoices || []);
  const [filteredInvoices, setFilteredInvoices] = useState(initialInvoices || []);
  const [stats, setStats] = useState(
    initialStats || { totalRevenue: 0, outstanding: 0, paidInvoices: 0, overdue: 0 }
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [clientFilter, setClientFilter] = useState(initialClient);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, clientFilter, dateFilter, invoices]);

  // Sync from SSR props on navigation
  useEffect(() => {
    setInvoices(initialInvoices || []);
    setFilteredInvoices(initialInvoices || []);
    setStats(initialStats || { totalRevenue: 0, outstanding: 0, paidInvoices: 0, overdue: 0 });
    setSearchTerm(initialSearch);
    setStatusFilter(initialStatus);
    setClientFilter(initialClient);
    setDateFilter(initialDate);
    setPagination(initialPagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1, hasNext: false, hasPrev: false });
    setSort(initialSort || { sortBy: "issueDate", sortOrder: "desc" });
  }, [initialInvoices, initialStats, initialSearch, initialStatus, initialClient, initialDate, initialPagination, initialSort]);

  function pushFilters(next) {
    const p = new URLSearchParams();
    if (next.search) p.set("search", next.search);
    if (next.status && next.status !== "all") p.set("status", next.status);
    if (next.client && next.client !== "all") p.set("client", next.client);
    if (next.date && next.date !== "all") p.set("date", next.date);
    if (next.sortBy) p.set("sortBy", next.sortBy);
    if (next.sortOrder) p.set("sortOrder", next.sortOrder);
    if (typeof next.page === "number") p.set("page", String(next.page));
    if (typeof next.limit === "number") p.set("limit", String(next.limit));
    router.replace(`${pathname}?${p.toString()}`);
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchTerm(val);
    pushFilters({ search: val, status: statusFilter, client: clientFilter, date: dateFilter, sortBy: sort.sortBy, sortOrder: sort.sortOrder, page: 1, limit: pagination.limit });
  }

  function getDueDateStatus(dueDate, status) {
    if (status === "PAID" || status === "DRAFT") return "normal";
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

  function calculateStats(list) {
    const now = new Date();
    const totalRevenue = list.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
    const outstanding = list
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((s, i) => s + i.amount, 0);
    const paidInvoices = list.filter((i) => i.status === "PAID").length;
    const overdue = list.filter((i) => i.status === "SENT" && new Date(i.dueDate) < now).length;
    setStats({ totalRevenue, outstanding, paidInvoices, overdue });
  }

  function filterInvoices() {
    let filtered = invoices;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(q) ||
          invoice.project?.client?.companyName?.toLowerCase().includes(q) ||
          invoice.project?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter.toUpperCase());
    }
    if (clientFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.project?.client?.companyName === clientFilter);
    }
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((invoice) => {
        const issueDate = new Date(invoice.issueDate);
        switch (dateFilter) {
          case "this-month":
            return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
          case "last-month":
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return issueDate.getMonth() === lastMonth.getMonth() && issueDate.getFullYear() === lastMonth.getFullYear();
          case "this-quarter":
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3);
            return issueDate >= quarterStart;
          case "this-year":
            return issueDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    setFilteredInvoices(filtered);
  }

  const uniqueClients = useMemo(
    () => [...new Set(invoices.map((i) => i.project?.client?.companyName).filter(Boolean))],
    [invoices]
  );

  /**
   * Render a workflow-state badge when the invoice tracks workflow metadata.
   *
   * @param {Object} invoice - Invoice to render the badge for.
   * @param {Object} [styleOverrides={}] - Inline style overrides applied to the badge.
   * @returns {JSX.Element|null} Workflow badge element or null when not available.
   */
  function renderWorkflowBadge(invoice, styleOverrides = {}) {
    if (!invoice?.workflowState) return null;
    const label = workflowStateLabels[invoice.workflowState];
    if (!label) return null;
    return (
      <Badge
        variant="outline"
        style={{ marginLeft: 8, marginTop: 4, display: "inline-flex", ...styleOverrides }}
      >
        {label}
      </Badge>
    );
  }

  /**
   * Safely extract metadata stored on the invoice JSON column.
   *
   * @param {Object} invoice - Invoice record returned from the API.
   * @returns {Object} Normalized metadata object.
   */
  function extractInvoiceMetadata(invoice) {
    const meta = invoice?.metadata;
    if (!meta || typeof meta !== "object") {
      return {};
    }
    return meta;
  }

  if (loading) {
    return (
      <AdminDashboardLayout activeTab="invoices">
        <LoadingContainer>
          <LoadingSpinner size={24} />
          Loading invoices...
        </LoadingContainer>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout activeTab="invoices">
        <ErrorContainer>
          <h2>Error loading invoices</h2>
          <p>{error}</p>
          <Button onClick={() => {}}>Try Again</Button>
        </ErrorContainer>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout activeTab="invoices">
      <div>
        <PageHeader>
          <HeaderContent>
            <PageTitle>Invoices</PageTitle>
            <PageDescription>Manage invoices, track payments, and monitor your revenue</PageDescription>
          </HeaderContent>
          <HeaderActions>
            <Button variant="outline">
              <FiDownload />
              Export
            </Button>
            <Button>
              <FiPlus />
              New Invoice
            </Button>
          </HeaderActions>
        </PageHeader>

        <StatsGrid>
          {statsData.map((stat, index) => (
            <StatCard key={index}>
              <StatContent>
                <StatInfo>
                  <StatValue>{stat.value(stats)}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                  <StatChange $ispositive={stat.isPositive(stats)}>
                    <FiTrendingUp size={16} />
                    {stat.change(stats)}
                  </StatChange>
                </StatInfo>
                <StatIcon color={stat.color}>
                  <stat.icon />
                </StatIcon>
              </StatContent>
            </StatCard>
          ))}
        </StatsGrid>

        <FiltersBar>
          <SearchContainer>
            <SearchIcon />
            <SearchInput placeholder="Search invoices..." value={searchTerm} onChange={handleSearchChange} />
          </SearchContainer>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => {
              const v = e.target.value;
              setStatusFilter(v);
              pushFilters({ search: searchTerm, status: v, client: clientFilter, date: dateFilter });
            }}
          >
            {statusOption.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={clientFilter}
            onChange={(e) => {
              const v = e.target.value;
              setClientFilter(v);
              pushFilters({ search: searchTerm, status: statusFilter, client: v, date: dateFilter });
            }}
          >
            <option value="all">All Clients</option>
            {uniqueClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => {
              const v = e.target.value;
              setDateFilter(v);
              pushFilters({ search: searchTerm, status: statusFilter, client: clientFilter, date: v });
            }}
          >
            {timeOption.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <ViewToggle>
            <ViewButton $isactive={viewMode === "grid"} onClick={() => setViewMode("grid")} type="button">
              Grid
            </ViewButton>
            <ViewButton $isactive={viewMode === "table"} onClick={() => setViewMode("table")} type="button">
              Table
            </ViewButton>
          </ViewToggle>
        </FiltersBar>
        {/* Sorting & Pagination controls inserted here */}

        {viewMode === "grid" ? (
          <InvoicesGrid>
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id}>
                <CardContent>
                  <InvoiceCardHeader>
                    <InvoiceInfo>
                      <StatusIndicator status={invoice.status} />
                      <InvoiceNumber>#{invoice.invoiceNumber}</InvoiceNumber>
                      <InvoiceClient>{invoice.project?.client?.companyName || "Unknown Client"}</InvoiceClient>
                      <InvoiceAmount>{formatCurrency(invoice.amount)}</InvoiceAmount>
                    </InvoiceInfo>
                    <Badge variant={getStatusVariant[invoice.status] || getStatusVariant.default}>
                      {getStatusText[invoice.status] || invoice.status}
                    </Badge>
                    {renderWorkflowBadge(invoice)}
                  </InvoiceCardHeader>
                  <InvoiceMeta>
                    <InvoiceMetaItem>
                      <InvoiceMetaLabel>Issue Date</InvoiceMetaLabel>
                      <InvoiceMetaValue>{formatDate(invoice.issueDate)}</InvoiceMetaValue>
                    </InvoiceMetaItem>
                    <InvoiceMetaItem>
                      <InvoiceMetaLabel>Due Date</InvoiceMetaLabel>
                      <InvoiceMetaValue>
                        <DueDateIndicator status={getDueDateStatus(invoice.dueDate, invoice.status)}>
                          {formatDate(invoice.dueDate)}
                        </DueDateIndicator>
                      </InvoiceMetaValue>
                    </InvoiceMetaItem>
                    <InvoiceMetaItem>
                      <InvoiceMetaLabel>Project</InvoiceMetaLabel>
                      <InvoiceMetaValue>{invoice.project?.name || "Unknown Project"}</InvoiceMetaValue>
                    </InvoiceMetaItem>
                    {(() => {
                      const meta = extractInvoiceMetadata(invoice);
                      if (!meta || typeof meta !== "object") return null;
                      const hasHours = typeof meta.hours === "number" && meta.hours > 0;
                      const hasRate = typeof meta.rate === "number" && meta.rate > 0;
                      if (!hasHours && !hasRate) return null;
                      return (
                        <InvoiceMetaItem>
                          <InvoiceMetaLabel>Work Logged</InvoiceMetaLabel>
                          <InvoiceMetaValue>
                            {hasHours ? `${meta.hours} hrs` : ""}
                            {hasRate ? ` @ ${formatCurrency(meta.rate)}/hr` : ""}
                          </InvoiceMetaValue>
                        </InvoiceMetaItem>
                      );
                    })()}
                  </InvoiceMeta>
                </CardContent>
              </InvoiceCard>
            ))}
          </InvoicesGrid>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar size="20">{getClientInitials(invoice.project?.client?.companyName)}</Avatar>
                        {invoice.project?.client?.companyName || "Unknown Client"}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.project?.name || "Unknown Project"}</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant[invoice.status] || getStatusVariant.default}>
                        {getStatusText[invoice.status] || invoice.status}
                      </Badge>
                      {renderWorkflowBadge(invoice, { marginLeft: 0 })}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <DueDateIndicator status={getDueDateStatus(invoice.dueDate, invoice.status)}>
                        {formatDate(invoice.dueDate)}
                      </DueDateIndicator>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FiMoreVertical />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
