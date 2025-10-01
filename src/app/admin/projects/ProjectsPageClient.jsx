// src/app/admin/projects/ProjectsPageClient.jsx
/** @module admin/projects/ProjectsPageClient */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button, Badge, Avatar } from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import {
  DashboardStatsSkeleton,
  ProjectCardSkeleton,
  GridLoading,
} from "@/components/ui/Loading";
import { useBlockClientRole } from "@/lib/roleGuard";
import { formatDate, getInitials } from "@/lib/utils";
import {
  getStatusVariant,
  statsConfig,
  statusOption,
  priorityOption,
} from "@/data/page/admin/adminData";
import {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  StatsGrid,
  StatContent,
  StatInfo,
  StatValue,
  StatLabel,
  StatChange,
  StatIcon,
  FiltersBar,
  SearchContainer,
  SearchInput,
  FilterSelect,
  ViewToggle,
  ProjectsGrid,
  ProjectHeader,
  ProjectName,
  ProjectMeta,
  MetaRow,
  ProgressSection,
  ProgressHeader,
  ProgressLabel,
  ProgressValue,
  ProgressBar,
  ProgressFill,
  ProjectFooter,
  TeamAvatars,
  MoreTeamMembers,
  ActionButtons,
  ActionButton,
  EmptyState,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  StatCard,
  SearchIcon,
  ViewButton,
  ProjectCard,
} from "./style";
import {
  FiFolder,
  FiPlus,
  FiFilter,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiMoreVertical,
  FiEdit,
  FiEye,
} from "react-icons/fi";

/**
 * Projects dashboard client island.
 * Receives SSR data and preserves interactivity (filters, pagination, view).
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.initialProjects - Initial project list
 * @param {Object} props.initialPagination - Pagination metadata
 * @param {Object} props.initialStats - Header statistics object
 * @param {string} [props.initialSearch=""] - Initial search term
 * @param {string} [props.initialStatus="all"] - Initial status filter
 * @param {string} [props.initialPriority="all"] - Initial priority filter
 * @param {number} [props.initialPage=1] - Initial page index
 * @param {number} [props.initialLimit=12] - Initial page size
 * @returns {JSX.Element}
 */
export default function ProjectsPageClient({
  initialProjects,
  initialPagination,
  initialStats,
  initialSearch = "",
  initialStatus = "all",
  initialPriority = "all",
  initialPage = 1,
  initialLimit = 12,
}) {
  useBlockClientRole();
  const { user } = useUser();
  const { notifyError } = useToastNotifications();

  const [projects, setProjects] = useState(initialProjects || []);
  const [stats, setStats] = useState(initialStats || null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: initialPage,
      limit: initialLimit,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    }
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [viewMode, setViewMode] = useState("grid");
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  useEffect(() => {
    setSkipInitialFetch(false);
  }, []);

  async function fetchProjects(filters = {}) {
    const params = new URLSearchParams({
      page: String(filters.page || pagination.page),
      limit: String(filters.limit || pagination.limit),
      scope: "all",
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);

    const res = await fetch(`/api/projects?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  }

  async function fetchProjectStats() {
    const res = await fetch(`/api/projects/stats?scope=all`);
    if (!res.ok) throw new Error("Failed to fetch project stats");
    return res.json();
  }

  async function loadProjects() {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
        priority: priorityFilter !== "all" ? priorityFilter.toUpperCase() : undefined,
      };
      const data = await fetchProjects(filters);
      setProjects(data.projects || []);
      setPagination(data.pagination || pagination);
    } catch (e) {
      notifyError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      setStatsLoading(true);
      const s = await fetchProjectStats();
      setStats(s);
    } catch (e) {
      // toast shown by caller
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    if (skipInitialFetch) return;
    loadProjects();
  }, [pagination.page, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    if (skipInitialFetch) return;
    loadStats();
  }, []);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handlePriorityFilterChange(e) {
    setPriorityFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handlePageChange(newPage) {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }

  function renderTeamAvatars(teamMembers, maxShow = 3) {
    if (!teamMembers || teamMembers.length === 0) return null;
    const showCount = Math.min(teamMembers.length, maxShow);
    const remainingCount = teamMembers.length - maxShow;
    return (
      <TeamAvatars>
        {teamMembers.slice(0, showCount).map((member, index) => (
          <Avatar key={member.clerkId || index} size="32">
            {getInitials(member.name || member.email)}
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <MoreTeamMembers>+{remainingCount}</MoreTeamMembers>
        )}
      </TeamAvatars>
    );
  }

  function renderStatsCards() {
    if (statsLoading) return <DashboardStatsSkeleton />;
    if (!stats) return null;
    return (
      <StatsGrid>
        {statsConfig.map((stat, index) => (
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
    );
  }

  function renderProjectsGrid() {
    if (loading) {
      return (
        <GridLoading
          CardComponent={ProjectCardSkeleton}
          columns="repeat(auto-fill, minmax(350px, 1fr))"
          count={6}
        />
      );
    }
    if (projects.length === 0) {
      return (
        <EmptyState>
          <FiFolder size={48} />
          <h3>No projects found</h3>
          <p>
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first project."}
          </p>
          <Button style={{ marginTop: 16 }}>
            <FiPlus />
            Create Project
          </Button>
        </EmptyState>
      );
    }
    return (
      <ProjectsGrid>
        {projects.map((project) => (
          <ProjectCard key={project.id}>
            <ProjectHeader>
              <ProjectName>{project.name}</ProjectName>
              <ActionButton variant="ghost" size="sm">
                <FiMoreVertical />
              </ActionButton>
            </ProjectHeader>

            <ProjectMeta>
              <MetaRow>
                <FiUsers size={16} />
                <span>{project.client?.companyName || "No client"}</span>
              </MetaRow>
              <MetaRow>
                <FiCalendar size={16} />
                <span>
                  {project.startDate ? formatDate(project.startDate) : "No start date"} -
                  {project.endDate ? formatDate(project.endDate) : "No end date"}
                </span>
              </MetaRow>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge variant={getStatusVariant[project.status?.toUpperCase()] || "default"}>
                  {project.status?.replace("_", " ") || "Unknown"}
                </Badge>
              </div>
            </ProjectMeta>

            <ProgressSection>
              <ProgressHeader>
                <ProgressLabel>Progress</ProgressLabel>
                <ProgressValue>{project.progress || 0}%</ProgressValue>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill progress={project.progress || 0} />
              </ProgressBar>
            </ProgressSection>

            <ProjectFooter>
              {renderTeamAvatars(project.teamMembers)}
              <ActionButtons>
                <ActionButton variant="outline" size="sm">
                  <FiEye />
                </ActionButton>
                <ActionButton variant="outline" size="sm">
                  <FiEdit />
                </ActionButton>
              </ActionButtons>
            </ProjectFooter>
          </ProjectCard>
        ))}
      </ProjectsGrid>
    );
  }

  return (
    <div>
        <PageHeader>
          <HeaderContent>
            <PageTitle>Projects</PageTitle>
            <PageDescription>
              Track and manage all your projects from planning to completion
            </PageDescription>
          </HeaderContent>
        </PageHeader>

        {renderStatsCards()}

        <FiltersBar>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchContainer>
          <FilterSelect value={statusFilter} onChange={handleStatusFilterChange}>
            {statusOption.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={priorityFilter} onChange={handlePriorityFilterChange}>
            {priorityOption.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FilterSelect>
          <Button variant="outline">
            <FiFilter />
            More Filters
          </Button>
        </FiltersBar>

        <ViewToggle>
          <ViewButton
            variant={viewMode === "grid" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            $isactive={viewMode === "grid"}
          >
            <FiGrid />
            Grid View
          </ViewButton>
          <ViewButton
            variant={viewMode === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            $isactive={viewMode === "table"}
          >
            <FiList />
            Table View
          </ViewButton>
        </ViewToggle>

        {renderProjectsGrid()}

        {pagination.totalPages > 1 && (
          <PaginationContainer>
            <PaginationButtons>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <PaginationInfo>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </PaginationInfo>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </PaginationButtons>
          </PaginationContainer>
        )}
    </div>
  );
}
