// src/app/admin/users/UsersPageClient.jsx
/** @module admin/users/UsersPageClient */
"use client";
import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Input,
  Select,
  Spinner,
} from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import { roleFilterOptions } from "@/data/auth/roles.data";
import {
  userTableColumns,
  userSortOptions,
  userPageSizeOptions,
} from "@/data/page/admin/users/usersData";
import { formatDateTime } from "@/lib/utils";
import {
  PageContainer,
  HeaderSection,
  HeaderText,
  PageTitle,
  PageSubtitle,
  Toolbar,
  ToolbarGroup,
  SearchRow,
  FiltersRow,
  FilterControl,
  TableContainer,
  TableCellContent,
  PaginationContainer,
  PaginationText,
  PaginationControls,
  TableFooter,
  LoadingContainer,
  ErrorMessage,
  EmptyResults,
} from "./users.style";
import appInfo from "@/data/appInfo";

/**
 * Splits a `sortBy:sortOrder` value into its components.
 *
 * @param {string} value - Combined sort representation.
 * @returns {{ sortBy: string, sortOrder: "asc"|"desc" }} Parsed sort params.
 */
function parseSortValue(value) {
  const [sortBy = "createdAt", sortOrder = "desc"] = (value || "").split(":");
  return {
    sortBy,
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
}

/**
 * Builds a query string matching the API contract.
 *
 * @param {Object} options - Query options.
 * @param {number} options.page - Page number.
 * @param {number} options.limit - Page size.
 * @param {string} [options.search] - Search term.
 * @param {string} [options.role] - Role filter.
 * @param {string} [options.sort] - Combined sort value.
 * @returns {string} Query string beginning after `?`.
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
 * Dropdown that updates a user's role via the admin API.
 *
 * @param {Object} props - Component props.
 * @param {string} props.userId - Target Clerk user id.
 * @param {string} props.currentRole - Currently assigned role.
 * @param {function(string): Promise<void>} props.onChangeRole - Handler invoked on role selection.
 * @returns {JSX.Element}
 */
function RoleSelect({ userId, currentRole, onChangeRole }) {
  const [isSaving, setIsSaving] = useState(false);
  const options = useMemo(
    () => roleFilterOptions.filter((option) => option.value !== "ALL"),
    []
  );

  async function handleChange(event) {
    const nextRole = event.target.value;
    if (!nextRole || nextRole === currentRole) {
      return;
    }
    setIsSaving(true);
    try {
      await onChangeRole(nextRole);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Select
      value={currentRole}
      onChange={handleChange}
      aria-label={`Select role for user ${userId}`}
      disabled={isSaving}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

/**
 * Interactive admin table for browsing and managing user roles.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialUsers - Prefetched user rows.
 * @param {Object} props.initialPagination - Pagination metadata.
 * @param {Object} props.initialSort - Initial sorting config.
 * @param {string} props.initialSearch - Initial search term.
 * @param {string} props.initialRole - Initial role filter.
 * @param {number} props.initialLimit - Initial page size.
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
    }
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [roleFilter, setRoleFilter] = useState(initialRole || "ALL");
  const [sortValue, setSortValue] = useState(
    `${initialSort?.sortBy || "createdAt"}:${initialSort?.sortOrder || "desc"}`
  );
  const [pageSize, setPageSize] = useState(
    initialLimit || pagination.limit || 10
  );
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
    [pathname, router]
  );

  const fetchUsers = useCallback(
    async ({ page, limit, search, role, sort }) => {
      setLoading(true);
      setError(null);
      try {
        const query = buildQueryString({ page, limit, search, role, sort });
        const response = await fetch(`/api/admin/users?${query}`, {
          cache: "no-store",
        });
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
    [syncUrl]
  );

  const handleRefresh = useCallback(async () => {
    await fetchUsers({
      page: pagination.page,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter,
      sort: sortValue,
    });
  }, [
    fetchUsers,
    pagination.page,
    pageSize,
    roleFilter,
    searchTerm,
    sortValue,
  ]);

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
    await fetchUsers({
      page: 1,
      limit: nextSize,
      search: searchTerm,
      role: roleFilter,
      sort: sortValue,
    });
  }

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }
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
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: nextRole,
              }
            : user
        )
      );
      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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
    [handleRefresh, notifyError, notifySuccess, users]
  );

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderText>
          <PageTitle>User access</PageTitle>
          <PageSubtitle>
            Review every account on {appInfo.name}, filter by role, and assign
            permissions within one place.
          </PageSubtitle>
        </HeaderText>
        <Button
          onClick={handleRefresh}
          aria-label="Refresh users"
          $variant="outline"
          disabled={loading || isPending}
        >
          <FiRefreshCw aria-hidden="true" /> Refresh
        </Button>
      </HeaderSection>

      <form onSubmit={handleSearch} aria-label="Search users">
        <Toolbar>
          <SearchRow>
            <Input
              type="search"
              name="search"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search users"
            />
            <Button type="submit" disabled={loading} aria-label="Apply search">
              <FiSearch aria-hidden="true" /> Search
            </Button>
          </SearchRow>
          <FiltersRow>
            <FilterControl>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                aria-label="Filter by role"
              >
                {roleFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FilterControl>
            <FilterControl>
              <Select
                value={sortValue}
                onChange={handleSortChange}
                aria-label="Sort users"
              >
                {userSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FilterControl>
            <FilterControl>
              <Select
                value={String(pageSize)}
                onChange={handlePageSizeChange}
                aria-label="Page size"
              >
                {userPageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </Select>
            </FilterControl>
          </FiltersRow>
        </Toolbar>
      </form>

      <Card>
        <CardContent>
          <TableContainer>
            <Table role="grid">
              <TableHeader>
                <TableRow>
                  {userTableColumns.map((column) => (
                    <TableHead key={column.id} scope="col">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <tbody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <TableCellContent>
                        <span>{user.name || "Unnamed user"}</span>
                      </TableCellContent>
                    </TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <RoleSelect
                        userId={user.id}
                        currentRole={user.role}
                        onChangeRole={(nextRole) =>
                          handleRoleUpdate(user.id, nextRole)
                        }
                      />
                    </TableCell>
                    <TableCell>{user.client?.companyName || "N/A"}</TableCell>
                    <TableCell>
                      {user.createdAt ? formatDateTime(user.createdAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {user.updatedAt ? formatDateTime(user.updatedAt) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
          {loading && (
            <LoadingContainer>
              <Spinner size="20" aria-hidden="true" />
            </LoadingContainer>
          )}
          {error && !loading && (
            <ErrorMessage role="alert">{error}</ErrorMessage>
          )}
          {!loading && !error && users.length === 0 && (
            <EmptyResults>
              No users found. Adjust filters to broaden the search.
            </EmptyResults>
          )}
        </CardContent>
        <TableFooter>
          <PaginationContainer aria-label="Pagination">
            <PaginationText>
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.totalCount} total users
            </PaginationText>
            <PaginationControls>
              <Button
                type="button"
                $variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
              >
                Previous
              </Button>
              <Button
                type="button"
                $variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
              >
                Next
              </Button>
            </PaginationControls>
          </PaginationContainer>
        </TableFooter>
      </Card>
    </PageContainer>
  );
}
