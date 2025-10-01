// src/app/dashboard/invoices/[id]/InvoiceDetailPageClient.jsx
"use client";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui";
import styled from "styled-components";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

/**
 * Invoice detail client island.
 * @param {Object} props - Props
 * @param {Object} props.invoice - Invoice payload with breakdown
 */
export default function InvoiceDetailPageClient({ invoice }) {
  const [paying, setPaying] = useState(false);

  return (
    <div>
      <PageHeader>
        <div>
          <Title>Invoice {invoice.invoiceNumber}</Title>
          <div style={{ color: "#64748b" }}>{invoice.project?.client?.companyName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "error" : invoice.status === "SENT" ? "warning" : "default"}>
            {invoice.status.toLowerCase()}
          </Badge>
          {invoice.status !== "PAID" && (
            <Button onClick={() => { setPaying(true); setTimeout(() => setPaying(false), 800); }} disabled={paying}>
              {paying ? "Opening..." : "Pay Now"}
            </Button>
          )}
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm"><FiChevronLeft /> Back</Button>
          </Link>
        </div>
      </PageHeader>

      <Card style={{ marginBottom: 24 }}>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ color: "#64748b" }}>Amount</div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(invoice.amount)}</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>Issue Date</div>
              <div style={{ fontWeight: 700 }}>{formatDate(invoice.issueDate)}</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>Due Date</div>
              <div style={{ fontWeight: 700 }}>{formatDate(invoice.dueDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {invoice.timeLogsByUser?.flatMap((u) => u.logs).map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.description || log.taskTitle || "—"}</TableCell>
                <TableCell>{log.hours}</TableCell>
                <TableCell>{log.user?.name || "—"}</TableCell>
                <TableCell>{formatDate(log.date)}</TableCell>
              </TableRow>
            ))}
            {(!invoice.timeLogsByUser || invoice.timeLogsByUser.length === 0) && (
              <TableRow>
                <TableCell colSpan={4}>
                  <CardContent style={{ color: "#64748b", textAlign: "center" }}>No breakdown available</CardContent>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
/** @module dashboard/invoices/InvoiceDetailPageClient */
