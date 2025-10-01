// src/app/dashboard/invoices/InvoicesPageClient.jsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import { Card, Table, TableHeader, TableRow, TableHead, TableCell, Badge, Input, Select, Button } from "@/components/ui";
import { FiSearch } from "react-icons/fi";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRef } from "react";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
const FiltersBar = styled.form`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;
const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.text.muted}; }
`;
const SearchInput = styled(Input)`
  padding-left: ${({ theme }) => theme.spacing.xl};
`;

/**
 * Invoices list client island with SSR filters/pagination/sorting.
 * @param {Object} props - Props
 * @param {Array} props.invoices - Invoice list
 * @param {Object} props.pagination - Pagination data
 * @param {Object} props.filters - Current filters
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
    if (!filters.projectId) params.delete("projectId");
    return `?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader>
        <Title>Invoices</Title>
      </PageHeader>

      <FiltersBar ref={formRef} method="get">
        <SearchContainer>
          <FiSearch />
          <SearchInput name="search" placeholder="Search invoices..." defaultValue={filters.search || ""} onChange={submitOnChange} />
        </SearchContainer>
        <Select name="status" defaultValue={filters.status || "all"} onChange={submitOnChange} style={{ maxWidth: 220 }}>
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
        </Select>
        <Select name="sortBy" defaultValue={filters.sortBy || "issueDate"} onChange={submitOnChange} style={{ maxWidth: 220 }}>
          <option value="issueDate">Issue Date</option>
          <option value="dueDate">Due Date</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
        </Select>
        <Select name="sortOrder" defaultValue={filters.sortOrder || "desc"} onChange={submitOnChange} style={{ maxWidth: 160 }}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>
        <Select name="limit" defaultValue={String(pagination.limit || 20)} onChange={submitOnChange} style={{ maxWidth: 120 }}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </FiltersBar>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Due</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.project?.name || "—"}</TableCell>
                <TableCell style={{ fontWeight: 600 }}>{formatCurrency(inv.amount)}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "error" : inv.status === "SENT" ? "warning" : "default"}>
                    {inv.status.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{inv.issueDate ? formatDate(inv.issueDate) : "—"}</TableCell>
                <TableCell>{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/invoices/${inv.id}`}>
                    <Button $variant="outline" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={withPage(Math.max(1, (pagination.page || 1) - 1))} aria-disabled={!(pagination.page > 1)}>
            <Button variant="outline" size="sm" disabled={!(pagination.page > 1)}>Prev</Button>
          </Link>
          <Link href={withPage((pagination.page || 1) + 1)} aria-disabled={!(pagination.page < (pagination.totalPages || 1))}>
            <Button variant="outline" size="sm" disabled={!(pagination.page < (pagination.totalPages || 1))}>Next</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/invoices/InvoicesPageClient */
