// src/app/admin/tasks/TasksPageClient.jsx
/** @module admin/tasks/TasksPageClient */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useBlockClientRole } from "@/lib/roleGuard";
import { useToastNotifications } from "@/components/ui/Toast";
import { Card, CardContent, Badge, Button, Select, Avatar, EmptyState } from "@/components/ui";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiColumns,
  FiPlus,
  FiEye,
  FiEdit,
  FiMoreVertical,
  FiClock,
  FiMessageSquare,
} from "react-icons/fi";
import {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  HeaderActions,
  StatsGrid,
  StatCard,
  StatContent,
  StatInfo,
  StatValue,
  StatLabel,
  StatChange,
  StatIcon,
  FilterControls,
  SearchContainer,
  SearchInput,
  FilterGroup,
  ViewToggle,
  ViewButton,
  TasksContainer,
  TaskCard,
  TaskCardHeader,
  TaskTitle,
  TaskDescription,
  TaskMeta,
  ProjectBadge,
  DueDateBadge,
  TaskActions,
  TaskStats,
  TaskStat,
  ActionButtons,
  ActionButton,
  KanbanColumn,
  KanbanHeader,
  KanbanTitle,
  KanbanCount,
  KanbanTasks,
  LoadingContainer,
} from "./style";
import {
  statusColumns,
  getStatusVariant,
  getPriorityVariant,
  statsData,
  statusOption,
  priorityOption,
} from "@/data/page/tasks/tasksData";

/**
 * Client island for Tasks page interactivity. Receives SSR data and
 * preserves filtering, view switching, and follow-up API fetching.
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.initialTasks - Initial tasks list
 * @param {Object} props.initialStats - Initial stats object { total, inProgress, completed, overdue }
 * @param {string} [props.initialSearch=""] - Initial search term
 * @param {string} [props.initialStatus="all"] - Initial status filter
 * @param {string} [props.initialPriority="all"] - Initial priority filter
 * @param {string} [props.initialProject="all"] - Initial project filter (id or name)
 * @param {string} [props.initialAssignee="all"] - Initial assignee filter (clerkId)
 * @returns {JSX.Element}
 */
export default function TasksPageClient({
  initialTasks,
  initialStats,
  initialSearch = "",
  initialStatus = "all",
  initialPriority = "all",
  initialProject = "all",
  initialAssignee = "all",
}) {
  useBlockClientRole();
  const { user } = useUser();
  const { notifyError } = useToastNotifications();

  const [tasks, setTasks] = useState(initialTasks || []);
  const [filteredTasks, setFilteredTasks] = useState(initialTasks || []);
  const [stats, setStats] = useState(initialStats || { total: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [projectFilter, setProjectFilter] = useState(initialProject);
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssignee);
  const [viewMode, setViewMode] = useState("grid");
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  useEffect(() => {
    setSkipInitialFetch(false);
  }, []);

  // Unique filter option values
  const uniqueProjects = useMemo(
    () => [...new Set(tasks.map((t) => t.project?.name).filter(Boolean))],
    [tasks]
  );
  const uniqueAssignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))],
    [tasks]
  );

  // Re-filter locally when inputs change
  useEffect(() => {
    let filtered = tasks;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.project?.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") filtered = filtered.filter((t) => t.priority === priorityFilter);
    if (projectFilter !== "all") filtered = filtered.filter((t) => t.project?.name === projectFilter);
    if (assigneeFilter !== "all") filtered = filtered.filter((t) => t.assignee?.name === assigneeFilter);
    setFilteredTasks(filtered);
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, tasks]);

  // API helpers
  async function apiFetchTasks(filters = {}) {
    const params = new URLSearchParams({
      page: "1",
      limit: "50",
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.projectId && filters.projectId !== "all") params.set("projectId", filters.projectId);
    if (filters.assigneeId && filters.assigneeId !== "all") params.set("assigneeId", filters.assigneeId);
    const res = await fetch(`/api/tasks?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  async function apiFetchStats() {
    const res = await fetch(`/api/tasks/stats`);
    if (!res.ok) throw new Error("Failed to fetch task stats");
    return res.json();
  }

  // Re-fetch on filter changes (server authoritative)
  useEffect(() => {
    if (skipInitialFetch) return;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetchTasks({
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          projectId: projectFilter,
          assigneeId: assigneeFilter,
        });
        setTasks(data.tasks || []);
      } catch (e) {
        notifyError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  // Stats refresh on mount when not provided
  useEffect(() => {
    if (skipInitialFetch) return;
    if (initialStats) return; // SSR provided
    (async () => {
      try {
        const s = await apiFetchStats();
        setStats({
          total: s.totalTasks ?? 0,
          inProgress: s.tasksByStatus?.IN_PROGRESS ?? 0,
          completed: s.tasksByStatus?.DONE ?? 0,
          overdue: s.overdueTasks ?? 0,
        });
      } catch {}
    })();
  }, [skipInitialFetch]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function formatDueDate(dueDateString) {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `${diffDays} days`;
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function isTaskOverdue(dueDateString) {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date() && dueDateString !== new Date().toDateString();
  }
  function isTaskDueToday(dueDateString) {
    if (!dueDateString) return false;
    const today = new Date().toDateString();
    return new Date(dueDateString).toDateString() === today;
  }

  function renderTaskCard(task, isKanban = false) {
    const CardComponent = isKanban ? Card : TaskCard;
    return (
      <CardComponent key={task.id}>
        <TaskCardHeader>
          <TaskTitle>{task.title}</TaskTitle>
          {task.description && <TaskDescription>{task.description}</TaskDescription>}
          <TaskMeta>
            <Badge variant={getStatusVariant[task.status] || "secondary"}>{task.status.replace("_", " ")}</Badge>
            <Badge variant={getPriorityVariant[task.priority] || "secondary"}>{task.priority}</Badge>
            {task.project && <ProjectBadge variant="outline">{task.project.name}</ProjectBadge>}
            {task.dueDate && (
              <DueDateBadge variant="outline" $isoverdue={isTaskOverdue(task.dueDate)} $istoday={isTaskDueToday(task.dueDate)}>
                <FiClock size={12} />
                {formatDueDate(task.dueDate)}
              </DueDateBadge>
            )}
          </TaskMeta>
          {task.assignee && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Avatar size="sm">
                {task.assignee.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
              </Avatar>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{task.assignee.name}</span>
            </div>
          )}
        </TaskCardHeader>
        <CardContent>
          <TaskActions>
            <TaskStats>
              {task._count?.comments > 0 && (
                <TaskStat>
                  <FiMessageSquare size={16} />
                  {task._count.comments}
                </TaskStat>
              )}
              {task._count?.timeLogs > 0 && (
                <TaskStat>
                  <FiClock size={16} />
                  {task._count.timeLogs}h
                </TaskStat>
              )}
            </TaskStats>
            <ActionButtons>
              <ActionButton variant="ghost" size="sm">
                <FiEye />
              </ActionButton>
              <ActionButton variant="ghost" size="sm">
                <FiEdit />
              </ActionButton>
              {!isKanban && (
                <ActionButton variant="ghost" size="sm">
                  <FiMoreVertical />
                </ActionButton>
              )}
            </ActionButtons>
          </TaskActions>
        </CardContent>
      </CardComponent>
    );
  }

  function getTasksByStatus(status) {
    return filteredTasks.filter((task) => task.status === status);
  }

  return (
    <div>
      <PageHeader>
        <HeaderContent>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>Plan, track, and collaborate across your work</PageDescription>
        </HeaderContent>
      </PageHeader>

      <StatsGrid>
        {statsData.map((card, i) => (
          <StatCard key={i}>
            <StatContent>
              <StatInfo>
                <StatValue>{card.value(stats)}</StatValue>
                <StatLabel>{card.label}</StatLabel>
                <StatChange $ispositive={card.isPositive}>
                  {typeof card.change === "function"
                    ? card.change(stats)
                    : card.change}
                </StatChange>
              </StatInfo>
              <StatIcon color={card.color}>
                <card.icon />
              </StatIcon>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <FilterControls>
        <SearchContainer>
          <FiSearch />
          <SearchInput placeholder="Search tasks..." value={searchTerm} onChange={handleSearchChange} />
        </SearchContainer>

        <FilterGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="Status">
            {statusOption.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} placeholder="Priority">
            {priorityOption.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} placeholder="Project">
            <option value="all">All Projects</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </Select>

          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} placeholder="Assignee">
            <option value="all">All Assignees</option>
            {uniqueAssignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <ViewToggle>
          <ViewButton variant="ghost" size="sm" $isactive={viewMode === "grid"} onClick={() => setViewMode("grid")}>
            <FiGrid />
          </ViewButton>
          <ViewButton variant="ghost" size="sm" $isactive={viewMode === "table"} onClick={() => setViewMode("table")}>
            <FiList />
          </ViewButton>
          <ViewButton variant="ghost" size="sm" $isactive={viewMode === "kanban"} onClick={() => setViewMode("kanban")}>
            <FiColumns />
          </ViewButton>
        </ViewToggle>
      </FilterControls>

      {filteredTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <TasksContainer $viewmode={viewMode}>
          {viewMode === "kanban"
            ? statusColumns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <KanbanColumn key={column.id}>
                    <KanbanHeader>
                      <KanbanTitle>
                        <column.icon size={20} />
                        {column.title}
                      </KanbanTitle>
                      <KanbanCount>{columnTasks.length}</KanbanCount>
                    </KanbanHeader>
                    <KanbanTasks>
                      {columnTasks.map((task) => renderTaskCard(task, true))}
                    </KanbanTasks>
                  </KanbanColumn>
                );
              })
            : filteredTasks.map((task) => renderTaskCard(task))}
        </TasksContainer>
      )}
    </div>
  );
}
