// src/app/admin/users/UsersPageClient.jsx
/** @module admin/users/UsersPageClient */
"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/shadcn/Button";
import { FiLoader, FiRefreshCw, FiSearch } from "react-icons/fi";
import { roleFilterOptions } from "@/data/auth/roles.data";
import {
  userTableColumns,
  userSortOptions,
  userPageSizeOptions,
} from "@/data/page/admin/users/usersData";
import { useToastNotifications } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";
import appInfo from "@/data/appInfo";

/**
 * Splits a combined `sortBy:sortOrder` string into parts.
 *
 * @param {string} value - Combined sort value.
 * @returns {{ sortBy: string, sortOrder: "asc"|"desc" }} Parsed values.
 */
function parseSortValue(value) {
  const [sortBy = "createdAt", sortOrder = "desc"] = (value || "").split(":");
  return { sortBy, sortOrder: sortOrder === "asc" ? "asc" : "desc" };
}

/**
 * Builds a query string accepted by the admin users API.
 *
 * @param {Object} options - Query configuration.
 * @param {number} options.page - Page number.
 * @param {number} options.limit - Page size.
 * @param {string} [options.search] - Search term.
 * @param {string} [options.role] - Role filter.
 * @param {string} [options.sort] - Combined sort value.
 * @returns {string} Query string.
 */
function buildQueryString({ page, limit, search, role, sort }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) {
    params.set("search", search);
  }
  if (role && role !== "ALL") {
    params.set("role", role);
  }
  const { sortBy, sortOrder } = parseSortValue(sort);
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  return params.toString();
}

/**
 * Role dropdown wired to the admin users API.
 *
 * @param {Object} props - Component props.
 * @param {string} props.userId - Target Clerk user ID.
 * @param {string} props.currentRole - Currently assigned role.
 * @param {Function} props.onChangeRole - Persist handler.
 * @returns {JSX.Element}
 */
function RoleSelect({ userId, currentRole, onChangeRole }) {
  const [isSaving, setIsSaving] = useState(false);
  const options = useMemo(
    () => roleFilterOptions.filter((option) => option.value !== "ALL"),
    [],
  );

  async function handleChange(event) {
    const nextRole = event.target.value;
    if (!nextRole || nextRole === currentRole) return;
    setIsSaving(true);
    try {
      await onChangeRole(nextRole);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isSaving}
      aria-label={`Select role for user ${userId}`}
      className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Interactive admin user directory.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialUsers - Prefetched user rows.
 * @param {Object} props.initialPagination - Pagination metadata.
 * @param {Object} props.initialSort - Sorting metadata.
 * @param {string} props.initialSearch - Seed search term.
 * @param {string} props.initialRole - Seed role filter.
 * @param {number} props.initialLimit - Seed page size.
 * @returns {JSX.Element}
 */
export default function UsersPageClient({
  initialUsers,
  initialPagination,
  initialSort,
  initialSearch,
  initialRole,
  initialLimit,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { notifyError, notifySuccess } = useToastNotifications();

  const [users, setUsers] = useState(initialUsers || []);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: 1,
      limit: initialLimit || 10,
      totalCount: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [roleFilter, setRoleFilter] = useState(initialRole || "ALL");
  const [sortValue, setSortValue] = useState(
    `${initialSort?.sortBy || "createdAt"}:${initialSort?.sortOrder || "desc"}`,
  );
  const [pageSize, setPageSize] = useState(initialLimit || pagination.limit || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const syncUrl = useCallback(
    ({ page, limit, search, role, sort }) => {
      startTransition(() => {
        const query = buildQueryString({ page, limit, search, role, sort });
        router.replace(`${pathname}?${query}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  const fetchUsers = useCallback(
    async ({ page, limit, search, role, sort }) => {
      setLoading(true);
      setError(null);
      try {
        const query = buildQueryString({ page, limit, search, role, sort });
        const response = await fetch(`/api/admin/users?${query}`, { cache: "no-store" });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load users");
        }
        const payload = await response.json();
        setUsers(payload.users || []);
        setPagination(payload.pagination);
        setSortValue(`${payload.sort.sortBy}:${payload.sort.sortOrder}`);
        setSearchTerm(search || "");
        setSearchInput(search || "");
        setRoleFilter(role || "ALL");
        setPageSize(limit);
        syncUrl({
          page,
          limit,
          search,
          role,
          sort: `${payload.sort.sortBy}:${payload.sort.sortOrder}`,
        });
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [syncUrl],
  );

  const handleRefresh = useCallback(async () => {
    await fetchUsers({
      page: pagination.page,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter,
      sort: sortValue,
    });
  }, [fetchUsers, pagination.page, pageSize, roleFilter, searchTerm, sortValue]);

  async function handleSearch(event) {
    event.preventDefault();
    await fetchUsers({
      page: 1,
      limit: pageSize,
      search: searchInput,
      role: roleFilter,
      sort: sortValue,
    });
  }

  async function handleRoleFilterChange(event) {
    const nextRole = event.target.value;
    setRoleFilter(nextRole);
    await fetchUsers({
      page: 1,
      limit: pageSize,
      search: searchInput,
      role: nextRole,
      sort: sortValue,
    });
  }

  async function handleSortChange(event) {
    const nextSort = event.target.value;
    setSortValue(nextSort);
    await fetchUsers({
      page: 1,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter,
      sort: nextSort,
    });
  }

  async function handlePageSizeChange(event) {
    const nextSize = Number.parseInt(event.target.value, 10) || pageSize;
    setPageSize(nextSize);
    await fetchUsers({
      page: 1,
      limit: nextSize,
      search: searchTerm,
      role: roleFilter,
      sort: sortValue,
    });
  }

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    await fetchUsers({
      page: nextPage,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter,
      sort: sortValue,
    });
  }

  const handleRoleUpdate = useCallback(
    async (userId, nextRole) => {
      const previousUsers = [...users];
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)),
      );
      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to update role");
        }
        notifySuccess("Role updated successfully");
        await handleRefresh();
      } catch (err) {
        setUsers(previousUsers);
        notifyError(err.message || "Unable to update role");
      }
    },
    [handleRefresh, notifyError, notifySuccess, users],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">User access</h1>
          <p className="text-sm text-muted">
            Review every account on {appInfo.name}, filter by role, and assign permissions in one place.
          </p>
        </div>
        <Button
          variant="secondary"
          className={cn("gap-2", (loading || isPending) && "opacity-70")}
          onClick={handleRefresh}
          disabled={loading || isPending}
          aria-label="Refresh users"
        >
          <FiRefreshCw className={cn("h-4 w-4", (loading || isPending) && "animate-spin")} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4" aria-label="Search users">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-lg">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              name="search"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" className="gap-2" disabled={loading} aria-label="Apply search">
            <FiSearch className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="role-filter" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {roleFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="sort-select" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Sort
            </label>
            <select
              id="sort-select"
              value={sortValue}
              onChange={handleSortChange}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {userSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="page-size" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Page size
            </label>
            <select
              id="page-size"
              value={String(pageSize)}
              onChange={handlePageSizeChange}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {userPageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-background text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                {userTableColumns.map((column) => (
                  <th key={column.id} scope="col" className="px-4 py-3">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-hover/60">
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">{user.name || "Unnamed user"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{user.email || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <RoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      onChangeRole={(nextRole) => handleRoleUpdate(user.id, nextRole)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{user.client?.companyName || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {user.createdAt ? formatDateTime(user.createdAt) : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {user.updatedAt ? formatDateTime(user.updatedAt) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-4 py-3 text-sm text-muted">
            <FiLoader className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading users...
          </div>
        ) : null}

        {error && !loading ? (
          <div className="px-4 py-3 text-center text-sm text-red-500" role="alert">
            {error}
          </div>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted">
            No users found. Adjust filters to broaden the search.
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-background px-4 py-3 text-sm text-muted sm:flex-row">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total users
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
