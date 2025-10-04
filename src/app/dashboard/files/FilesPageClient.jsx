// src/app/dashboard/files/FilesPageClient.jsx
"use client";
import React, { useRef, useState } from "react";
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
  Avatar,
  Textarea,
} from "@/components/ui/dashboard";
import { FiSearch, FiDownload, FiCheck, FiEdit3 } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANTS = {
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  PENDING: "default",
};

/**
 * Files list client island with SSR filters, pagination and sorting.
 *
 * @param {{ files: Array<Object>, pagination: { page: number, totalPages: number, limit: number }, filters: Record<string, string> }} props - Component props.
 * @returns {JSX.Element}
 */
export default function FilesPageClient({ files = [], pagination, filters }) {
  const formRef = useRef(null);
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const submitOnChange = () => formRef.current?.requestSubmit();

  const withPage = (page) => {
    const params = new URLSearchParams({
      search: filters.search || "",
      status: filters.status || "all",
      sortBy: filters.sortBy || "uploadedAt",
      sortOrder: filters.sortOrder || "desc",
      limit: String(pagination.limit || 20),
      page: String(page),
      projectId: filters.projectId || "",
      scope: filters.scope || "",
    });
    if (!filters.projectId) params.delete("projectId");
    if (!filters.scope) params.delete("scope");
    return `?${params.toString()}`;
  };

  const filteredFiles = files.filter((file) =>
    filters.status === "all" ? true : file.approvalStatus === filters.status,
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Documents</h1>
        <p className="text-base text-muted">
          {filters.projectId ? "Project Documents" : "All Documents"}
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
            placeholder="Search files..."
            defaultValue={filters.search || ""}
            onChange={submitOnChange}
            aria-label="Search files"
            className="rounded-xl bg-surface pl-11"
          />
        </div>
        <Select
          name="scope"
          defaultValue={filters.scope || "project"}
          onChange={submitOnChange}
          aria-label="Scope filter"
          className="w-full rounded-xl bg-surface sm:w-48"
        >
          <option value="project">Current Project</option>
          <option value="all">All Documents</option>
        </Select>
        <Select
          name="status"
          defaultValue={filters.status || "all"}
          onChange={submitOnChange}
          aria-label="Status filter"
          className="w-full rounded-xl bg-surface sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
        </Select>
        <Select
          name="sortBy"
          defaultValue={filters.sortBy || "uploadedAt"}
          onChange={submitOnChange}
          aria-label="Sort by"
          className="w-full rounded-xl bg-surface sm:w-44"
        >
          <option value="uploadedAt">Uploaded</option>
          <option value="fileName">Name</option>
          <option value="approvalStatus">Status</option>
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
              <TableHead>File</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => {
                const variant = STATUS_VARIANTS[file.approvalStatus] || "default";
                const fileType = (file.fileType || "F").slice(0, 2).toUpperCase();

                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size={36} className="bg-accent-soft text-info">
                          {fileType}
                        </Avatar>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-foreground">
                            {file.fileName} {file.version > 1 ? `(v${file.version})` : ""}
                          </p>
                          <p className="text-muted">{file.project?.name || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted">{file.project?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted">
                      {file.uploadedAt ? formatDate(file.uploadedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>{file.approvalStatus?.toLowerCase().replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={file.url} target="_blank" rel="noreferrer" className="inline-flex">
                          <Button variant="secondary" size="sm" className="rounded-lg">
                            <FiDownload aria-hidden className="mr-2" /> Download
                          </Button>
                        </Link>
                        {file.approvalStatus !== "APPROVED" ? (
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg"
                            onClick={async () => {
                              await fetch(`/api/files/${file.id}/approve`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ note: "Approved by client" }),
                              });
                            }}
                          >
                            <FiCheck aria-hidden className="mr-2" /> Approve
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => {
                            setActive(file);
                            setNote("");
                          }}
                        >
                          <FiEdit3 aria-hidden className="mr-2" /> Request Revisions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <CardContent className="py-10 text-center text-sm text-muted">
                    No files found.
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

      {active ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border/80 bg-surface px-6 py-6 shadow-xl">
            <div className="space-y-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Request Revisions
              </h2>
              <p className="text-sm text-muted">
                Provide details on what changes are needed for {active.fileName}.
              </p>
            </div>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Please change the hero image and update the CTA copy..."
              className="mt-4"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg"
                onClick={() => setActive(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg"
                onClick={async () => {
                  if (!active) {
                    return;
                  }
                  await fetch(`/api/files/${active.id}/request-revision`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ note }),
                  });
                  setActive(null);
                  setNote("");
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
/** @module dashboard/files/FilesPageClient */
