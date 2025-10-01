// src/app/dashboard/files/FilesPageClient.jsx
"use client";
import styled from "styled-components";
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableCell, Input, Select, Avatar, TextArea } from "@/components/ui";
import { FiSearch, FiDownload, FiCheck, FiEdit3 } from "react-icons/fi";
import { formatDate } from "@/lib/utils";
import { useRef, useState } from "react";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const TitleGroup = styled.div``;
const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;
const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
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
  min-width: 300px;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.text.muted}; }
`;
const SearchInput = styled(Input)`
  padding-left: ${({ theme }) => theme.spacing.xl};
`;

/**
 * Files list client island with SSR filters, pagination and sorting.
 * @param {Object} props - Props
 * @param {Array} props.files - Files list
 * @param {Object} props.pagination - Pagination info
 * @param {Object} props.filters - Filters (search/status/sort/scope)
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

  const filtered = files.filter((f) => (filters.status === "all" ? true : f.approvalStatus === filters.status));

  return (
    <div>
      <PageHeader>
        <TitleGroup>
          <PageTitle>Documents</PageTitle>
          <PageSubtitle>
            {filters.projectId ? "Project Documents" : "All Documents"}
          </PageSubtitle>
        </TitleGroup>
      </PageHeader>

      <FiltersBar ref={formRef} method="get">
        <SearchContainer>
          <FiSearch />
          <SearchInput name="search" placeholder="Search files..." defaultValue={filters.search || ""} onChange={submitOnChange} />
        </SearchContainer>
        <Select name="scope" defaultValue={filters.scope || "project"} onChange={submitOnChange} style={{ maxWidth: 200 }}>
          <option value="project">Current Project</option>
          <option value="all">All Documents</option>
        </Select>
        <Select name="status" defaultValue={filters.status || "all"} onChange={submitOnChange} style={{ maxWidth: 220 }}>
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
        </Select>
        <Select name="sortBy" defaultValue={filters.sortBy || "uploadedAt"} onChange={submitOnChange} style={{ maxWidth: 220 }}>
          <option value="uploadedAt">Uploaded</option>
          <option value="fileName">Name</option>
          <option value="approvalStatus">Status</option>
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
              <TableHead>File</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar size="28">{(f.fileType || "F").slice(0,2).toUpperCase()}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.fileName} {f.version > 1 ? `(v${f.version})` : ""}</div>
                      <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{f.project?.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{f.project?.name || "—"}</TableCell>
                <TableCell>{f.uploadedAt ? formatDate(f.uploadedAt) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={f.approvalStatus === "APPROVED" ? "success" : f.approvalStatus === "CHANGES_REQUESTED" ? "warning" : "default"}>
                    {f.approvalStatus?.toLowerCase().replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={f.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><FiDownload /> Download</Button>
                    </a>
                    {f.approvalStatus !== "APPROVED" && (
                      <Button size="sm" onClick={async () => { await fetch(`/api/files/${f.id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: "Approved by client" }) }); }}>
                        <FiCheck /> Approve
                      </Button>
                    )}
                    <Button $variant="outline" size="sm" onClick={() => { setActive(f); setNote(""); }}>
                      <FiEdit3 /> Request Revisions
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <CardContent style={{ color: "#64748b", textAlign: "center" }}>No files found</CardContent>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </Card>

      {active && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, width: 520, maxWidth: "95%" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Request Revisions</div>
            <div style={{ color: "#64748b", marginBottom: 12 }}>Provide details on what changes are needed.</div>
            <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Please change the hero image and update the CTA copy..." />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <Button $variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={async () => { if (!active) return; await fetch(`/api/files/${active.id}/request-revision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) }); setActive(null); setNote(""); }}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={withPage(Math.max(1, (pagination.page || 1) - 1))} aria-disabled={!(pagination.page > 1)}>
            <Button variant="outline" size="sm" disabled={!(pagination.page > 1)}>Prev</Button>
          </a>
          <a href={withPage((pagination.page || 1) + 1)} aria-disabled={!(pagination.page < (pagination.totalPages || 1))}>
            <Button variant="outline" size="sm" disabled={!(pagination.page < (pagination.totalPages || 1))}>Next</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/files/FilesPageClient */
