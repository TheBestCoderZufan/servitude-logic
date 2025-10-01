// src/app/dashboard/projects/ProjectsPageClient.jsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Badge,
  ProgressBar,
  ProgressFill,
  Avatar,
  Input,
  Select,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui";
import { FiSearch, FiCalendar, FiUsers, FiFolder, FiCheckCircle, FiClock } from "react-icons/fi";
import { intakeStatusLabel } from "@/data/page/admin/intake/intakeData";
import { clientIntakeStatusBadgeVariants } from "@/data/page/dashboard/projectsClient.data";
import { formatDate } from "@/lib/utils";

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

const IntakeBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.success};
  svg {
    flex-shrink: 0;
    margin-top: 4px;
  }
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

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProjectCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProjectName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const PendingSummary = styled.p`
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PendingDetails = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PendingDetailsItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const PendingFooter = styled(CardFooter)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * @typedef {Object} PendingIntakeSummary
 * @property {string} id - Unique intake identifier.
 * @property {string} status - Workflow status code.
 * @property {string} submittedAt - ISO timestamp of submission.
 * @property {string} projectName - Client provided project name.
 * @property {string} [summary] - Short summary or goal statement.
 * @property {string|null} [budgetRange] - Budget range provided by the client.
 * @property {string|null} [targetLaunch] - Target launch text provided by the client.
 */

/**
 * Client island for the Projects list with SSR-driven filters.
 * Submits a GET form when filters change, letting the server component fetch
 * and render the updated list (SSR filters, pagination, sorting).
 *
 * @param {Object} props - Props from the server.
 * @param {Array} props.projects - List of projects with minimal fields.
 * @param {Object} props.pagination - Pagination info.
 * @param {number} props.pagination.page - Current page number.
 * @param {number} props.pagination.limit - Items per page.
 * @param {number} props.pagination.totalPages - Total pages.
 * @param {number} props.pagination.totalCount - Total items count.
 * @param {Object} props.filters - Current filters (search/status/sort values).
 * @param {boolean} props.intakeSubmitted - Whether the user recently submitted an intake.
 * @param {PendingIntakeSummary[]} [props.pendingIntakes] - Pending intakes tied to the client.
 * @returns {JSX.Element}
 */
export default function ProjectsPageClient({
  projects = [],
  pagination,
  filters,
  intakeSubmitted = false,
  pendingIntakes = [],
}) {
  const formRef = useRef(null);
  const submitOnChange = () => {
    if (formRef.current) formRef.current.requestSubmit();
  };

  const withPage = (page) => {
    const params = new URLSearchParams({
      search: filters.search || "",
      status: filters.status || "all",
      sortBy: filters.sortBy || "updatedAt",
      sortOrder: filters.sortOrder || "desc",
      limit: String(pagination.limit || 12),
      page: String(page),
    });
    return `?${params.toString()}`;
  };

  const hasProjects = projects.length > 0;
  const hasPendingIntakes = pendingIntakes.length > 0;

  return (
    <div>
      {intakeSubmitted && (
        <IntakeBanner role="status" aria-live="polite">
          <FiCheckCircle size={20} />
          <div>
            <strong>Thanks! Your project intake is under review.</strong>
            <p style={{ margin: 0 }}>
              Our team is reviewing the details now. We&apos;ll follow up if we need clarification and
              share an estimation timeline once the request is approved for scoping.
            </p>
          </div>
        </IntakeBanner>
      )}
      <PageHeader>
        <TitleGroup>
          <PageTitle>Your Projects</PageTitle>
          <PageSubtitle>Track progress, milestones, and files</PageSubtitle>
        </TitleGroup>
        <ViewToggle>
          <Link href="/dashboard/projects/new">
            <Button size="sm">New Project</Button>
          </Link>
        </ViewToggle>
      </PageHeader>

      <FiltersBar ref={formRef} method="get" role="search">
        <SearchContainer>
          <FiSearch />
          <SearchInput
            name="search"
            placeholder="Search projects..."
            defaultValue={filters.search || ""}
            onChange={submitOnChange}
            aria-label="Search projects"
          />
        </SearchContainer>
        <Select name="status" defaultValue={filters.status || "all"} onChange={submitOnChange} style={{ maxWidth: 220 }} aria-label="Status filter">
          <option value="all">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Select name="sortBy" defaultValue={filters.sortBy || "updatedAt"} onChange={submitOnChange} style={{ maxWidth: 220 }} aria-label="Sort by">
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Recently Created</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </Select>
        <Select name="sortOrder" defaultValue={filters.sortOrder || "desc"} onChange={submitOnChange} style={{ maxWidth: 160 }} aria-label="Sort order">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>
        <Select name="limit" defaultValue={String(pagination.limit || 12)} onChange={submitOnChange} style={{ maxWidth: 120 }} aria-label="Per page">
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
        </Select>
      </FiltersBar>

      {hasProjects || hasPendingIntakes ? (
        <ProjectsGrid>
          {pendingIntakes.map((intake) => {
            const submittedAt = intake.submittedAt ? new Date(intake.submittedAt) : null;
            const badgeVariant = clientIntakeStatusBadgeVariants[intake.status] || "warning";
            return (
              <ProjectCard key={`intake-${intake.id}`}>
                <ProjectHeader>
                  <ProjectName>{intake.projectName}</ProjectName>
                  <Badge variant={badgeVariant}>{intakeStatusLabel(intake.status)}</Badge>
                </ProjectHeader>
                <CardContent>
                  <MetaRow>
                    <FiClock />
                    <span>
                      Submitted {submittedAt ? formatDate(submittedAt) : "recently"}
                    </span>
                  </MetaRow>
                  {intake.summary && <PendingSummary>{intake.summary}</PendingSummary>}
                  {(intake.budgetRange || intake.targetLaunch) && (
                    <PendingDetails>
                      {intake.budgetRange && (
                        <PendingDetailsItem>
                          <strong>Budget:</strong> {intake.budgetRange}
                        </PendingDetailsItem>
                      )}
                      {intake.targetLaunch && (
                        <PendingDetailsItem>
                          <strong>Target launch:</strong> {intake.targetLaunch}
                        </PendingDetailsItem>
                      )}
                    </PendingDetails>
                  )}
                </CardContent>
                <PendingFooter>
                  <span>
                    We&apos;ll email you once the team finishes reviewing this request.
                  </span>
                </PendingFooter>
              </ProjectCard>
            );
          })}
          {projects.map((p) => {
            const total = p._count?.tasks || 0;
            const done = p.tasksDone || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <ProjectCard key={p.id}>
                <ProjectHeader>
                  <ProjectName>{p.name}</ProjectName>
                  <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "IN_PROGRESS" ? "inProgress" : p.status === "ON_HOLD" ? "warning" : p.status === "CANCELLED" ? "error" : "planning"}>
                    {p.status.toLowerCase().replace("_", " ")}
                  </Badge>
                </ProjectHeader>
                <CardContent>
                  <MetaRow>
                    <FiCalendar />
                    <span>
                      {p.startDate ? formatDate(p.startDate) : "—"}
                      {p.endDate ? ` → ${formatDate(p.endDate)}` : ""}
                    </span>
                  </MetaRow>

                  <div style={{ marginTop: 12 }}>
                    <MetaRow style={{ justifyContent: "space-between" }}>
                      <span>Progress</span>
                      <strong>{progress}%</strong>
                    </MetaRow>
                    <ProgressBar>
                      <ProgressFill progress={progress} />
                    </ProgressBar>
                  </div>

                  <FooterRow>
                    <MetaRow>
                      <Avatar size="28"><FiUsers /></Avatar>
                      <span>{p.teamSize || 0} team</span>
                    </MetaRow>
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <Button size="sm"><FiFolder /> View</Button>
                    </Link>
                  </FooterRow>
                </CardContent>
              </ProjectCard>
            );
          })}
        </ProjectsGrid>
      ) : (
        <EmptyState role="status" aria-live="polite">
          <EmptyStateIcon>
            <FiFolder />
          </EmptyStateIcon>
          <EmptyStateTitle>No projects yet</EmptyStateTitle>
          <EmptyStateDescription>
            Submit a project intake request to get your next engagement underway.
          </EmptyStateDescription>
          <Link href="/dashboard/projects/new">
            <Button size="sm">Start a project</Button>
          </Link>
        </EmptyState>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={withPage(Math.max(1, (pagination.page || 1) - 1))} aria-disabled={!(pagination.page > 1)}>
            <Button $variant="outline" size="sm" disabled={!(pagination.page > 1)}>Prev</Button>
          </Link>
          <Link href={withPage((pagination.page || 1) + 1)} aria-disabled={!(pagination.page < (pagination.totalPages || 1))}>
            <Button $variant="outline" size="sm" disabled={!(pagination.page < (pagination.totalPages || 1))}>Next</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/projects/ProjectsPageClient */
