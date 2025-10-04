// src/app/dashboard/approvals/ApprovalsPageClient.jsx
"use client";
import React, { useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Select,
} from "@/components/ui/dashboard";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  COMPLETED: "success",
  OVERDUE: "error",
  "DUE-SOON": "warning",
};

/**
 * Client island for approvals list. Submits GET form to drive SSR filters.
 *
 * @param {{ items: Array<Object>, filters: { search: (string|undefined), status: (string|undefined), projectId: (string|undefined) } }} props - Component props.
 * @returns {JSX.Element}
 */
export default function ApprovalsPageClient({ items = [], filters = {} }) {
  const formRef = useRef(null);
  const submitOnChange = () => formRef.current?.requestSubmit();
  const hasItems = items.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Approvals</h1>
        <p className="text-base text-muted">
          {filters.projectId ? "Project Approvals" : "All Projects"}
        </p>
      </header>

      <form
        ref={formRef}
        method="get"
        className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-surface/80 p-4"
      >
        <div className="relative flex-1 min-w-[240px]">
          <FiSearch aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            name="search"
            placeholder="Search approvals..."
            defaultValue={filters.search || ""}
            onChange={submitOnChange}
            aria-label="Search approvals"
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
          <option value="AWAITING">Awaiting Your Signature</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        {filters.projectId ? (
          <input type="hidden" name="projectId" value={filters.projectId} />
        ) : null}
      </form>

      <Card className="rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasItems ? (
              items.map((item) => {
                const dueStatus = item.status === "COMPLETED"
                  ? "COMPLETED"
                  : item.dueDateStatus === "overdue"
                  ? "OVERDUE"
                  : item.dueDateStatus === "due-soon"
                  ? "DUE-SOON"
                  : null;
                const badgeVariant = dueStatus ? STATUS_VARIANTS[dueStatus] || "default" : "default";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm font-medium text-foreground">{item.title}</TableCell>
                    <TableCell className="text-sm text-muted">{item.project?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted">
                      {item.requestedDate ? formatDate(item.requestedDate) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted">
                      {item.dueDate ? formatDate(item.dueDate) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {item.status === "COMPLETED" ? "Completed" : "Awaiting Your Signature"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/approvals/${item.id}`} className="inline-flex">
                        <Button variant="secondary" size="sm" className="rounded-lg">
                          View <FiChevronRight aria-hidden className="ml-2" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <CardContent className="py-10 text-center text-sm text-muted">
                    No approvals found.
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
/** @module dashboard/approvals/ApprovalsPageClient */
