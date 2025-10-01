// src/app/dashboard/approvals/ApprovalsPageClient.jsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableCell, Input, Select } from "@/components/ui";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

/** @module dashboard/approvals/ApprovalsPageClient */

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
  min-width: 280px;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.text.muted}; }
`;
const SearchInput = styled(Input)`
  padding-left: ${({ theme }) => theme.spacing.xl};
`;

/**
 * Client island for approvals list. Submits GET form to drive SSR filters.
 * @param {Object} props
 * @param {Array} props.items - Approvals mapped from tasks
 * @param {Object} props.filters - { search, status, projectId }
 */
export default function ApprovalsPageClient({ items = [], filters = {} }) {
  const formRef = useRef(null);
  const submitOnChange = () => formRef.current?.requestSubmit();

  return (
    <div>
      <PageHeader>
        <TitleGroup>
          <PageTitle>Approvals</PageTitle>
          <PageSubtitle>{filters.projectId ? "Project Approvals" : "All Projects"}</PageSubtitle>
        </TitleGroup>
      </PageHeader>

      <FiltersBar ref={formRef} method="get">
        <SearchContainer>
          <FiSearch />
          <SearchInput name="search" placeholder="Search approvals..." defaultValue={filters.search || ""} onChange={submitOnChange} />
        </SearchContainer>
        <Select name="status" defaultValue={filters.status || "all"} onChange={submitOnChange} style={{ maxWidth: 220 }}>
          <option value="all">All Status</option>
          <option value="AWAITING">Awaiting Your Signature</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        {filters.projectId && <input type="hidden" name="projectId" value={filters.projectId} />}
      </FiltersBar>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.title}</TableCell>
                <TableCell>{i.project?.name || "—"}</TableCell>
                <TableCell>{i.requestedDate ? formatDate(i.requestedDate) : "—"}</TableCell>
                <TableCell>{i.dueDate ? formatDate(i.dueDate) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={i.status === "COMPLETED" ? "success" : i.dueDateStatus === "overdue" ? "error" : i.dueDateStatus === "due-soon" ? "warning" : "default"}>
                    {i.status === "COMPLETED" ? "Completed" : "Awaiting Your Signature"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/approvals/${i.id}`}>
                    <Button variant="outline" size="sm">
                      View <FiChevronRight />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <CardContent style={{ color: "#64748b", textAlign: "center" }}>No approvals found</CardContent>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

