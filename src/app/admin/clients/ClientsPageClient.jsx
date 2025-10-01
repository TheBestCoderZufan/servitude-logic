// src/app/admin/clients/ClientsPageClient.jsx
/** @module admin/clients/ClientsPageClient */
"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
// Lazy-load modal islands to reduce initial JS on list view
const CreateClientForm = dynamic(() =>
  import("@/components/forms/CreateClientForm").then((m) => m.CreateClientForm)
);
const ConfirmationDialog = dynamic(() =>
  import("@/components/ui/Modal").then((m) => m.ConfirmationDialog)
);
import { useToastNotifications } from "@/components/ui/Toast";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  StatusDot,
} from "@/components/ui";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit,
  FiMail,
  FiMoreVertical,
  FiEye,
  FiLoader,
  FiRefreshCw,
  FiTrash2,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  HeaderActions,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  FiltersBar,
  SearchContainer,
  SearchIcon,
  SearchInput,
  FilterSelect,
  ViewToggle,
  ViewButton,
  LoadingContainer,
  ErrorContainer,
  ClientGrid,
  ClientCard,
  ClientHeader,
  ClientAvatar,
  ClientInfo,
  ClientName,
  ClientContact,
  ClientEmail,
  ClientStats,
  ClientStatItem,
  ClientStatValue,
  ClientStatLabel,
  ClientActions,
  ActionButtons,
  ActionButton,
  DropdownContainer,
  DropdownMenu,
  DropdownItem,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
} from "./clients.style";
import { formatCurrency, getInitials } from "@/lib/utils";

/**
 * Interactive client list UI. Receives initial SSR data and
 * continues hydration with client-side interactivity (modals, toasts, actions).
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.initialClients - Pre-fetched client rows with stats
 * @param {Object} props.initialPagination - Pagination info for the list
 * @param {Object} props.initialStats - Summary stats for the header cards
 * @param {number} [props.initialPage=1] - Initial page
 * @param {number} [props.initialLimit=10] - Initial page size
 * @param {string} [props.initialSearch=""] - Initial search term
 * @param {string} [props.initialStatus="all"] - Initial status filter
 * @returns {JSX.Element}
 */
export default function ClientsPageClient({
  initialClients,
  initialPagination,
  initialStats,
  initialPage = 1,
  initialLimit = 10,
  initialSearch = "",
  initialStatus = "all",
}) {
  const { user } = useUser();
  const { notifySuccess, notifyError } = useToastNotifications();

  // Local state seeded from SSR
  const [clients, setClients] = useState(initialClients || []);
  const [stats, setStats] = useState(
    initialStats || {
      totalClients: 0,
      activeClients: 0,
      totalRevenue: 0,
      newClientsThisMonth: 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [viewMode, setViewMode] = useState("table");
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

  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  // Track which client's action dropdown is open (by id)
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Prevent double-fetch on first paint (SSR already provided data)
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  /**
   * Fetches clients from API.
   * @param {string} userId - Clerk user id
   * @param {number} page - page number
   * @param {number} limit - items per page
   * @param {string} search - search term
   * @param {string} status - status filter
   * @returns {Promise<Object>} Response JSON
   */
  async function fetchClients(userId, page = 1, limit = 10, search = "", status = "all") {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append("search", search);
    if (status !== "all") params.append("status", status);
    // userId is not required by the API (auth() is used), but harmless if passed
    if (userId) params.append("userId", userId);

    const response = await fetch(`/api/clients?${params.toString()}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch clients");
    }
    return response.json();
  }

  /**
   * Fetch header stats.
   * @param {string} userId - Clerk user id
   * @returns {Promise<Object>}
   */
  async function fetchClientStats(userId) {
    const response = await fetch(`/api/clients/stats${userId ? `?userId=${userId}` : ""}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch stats");
    }
    return response.json();
  }

  async function updateClient(clientId, clientData) {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update client");
    }
    return response.json();
  }

  async function deleteClient(clientId) {
    const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete client");
    }
    return response.json();
  }

  async function createClient(clientData) {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create client");
    }
    return response.json();
  }

  async function loadClients() {
    if (!user?.id) return;
    try {
      setError(null);
      setLoading(true);
      const data = await fetchClients(
        user.id,
        pagination.page,
        pagination.limit,
        searchTerm,
        statusFilter
      );
      setClients(data.clients);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || "Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    if (!user?.id) return;
    try {
      const s = await fetchClientStats(user.id);
      setStats(s);
    } catch {
      // ignore
    }
  }

  async function loadInitialData() {
    await Promise.all([loadClients(), loadStats()]);
  }

  // Hydration effect: skip first fetch because SSR already provided data
  useEffect(function onMount() {
    setSkipInitialFetch(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data fetching effects
  useEffect(
    function onParamsChange() {
      if (skipInitialFetch) return;
      if (user?.id) {
        loadInitialData();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, pagination.page, searchTerm, statusFilter]
  );

  useEffect(
    function onSearchDebounce() {
      const debounced = setTimeout(() => {
        if (pagination.page !== 1) {
          setPagination((prev) => ({ ...prev, page: 1 }));
        } else if (!skipInitialFetch) {
          loadClients();
        }
      }, 300);
      return () => clearTimeout(debounced);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm]
  );

  function handleRefresh() {
    setRefreshing(true);
    Promise.resolve(loadInitialData()).finally(() => setRefreshing(false));
  }

  function handleBackfillClients() {
    (async () => {
      try {
        const res = await fetch("/api/admin/backfill/clients", { method: "POST" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          notifyError(err.error || "Backfill failed");
          return;
        }
        const data = await res.json();
        notifySuccess(`Backfill complete: created ${data.created} of ${data.scanned}`);
        await loadClients();
        await loadStats();
      } catch {
        notifyError("Backfill failed");
      }
    })();
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(newPage) {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }

  function handleEditClient(client) {
    setEditingClient(client);
    setShowEditForm(true);
    setOpenDropdownId(null);
  }

  function handleDeleteClick(client) {
    setDeletingClient(client);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  }

  async function handleConfirmDelete() {
    if (!deletingClient) return;
    try {
      await deleteClient(deletingClient.id);
      notifySuccess("Client deleted");
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      setShowDeleteConfirm(false);
      setDeletingClient(null);
      await loadStats();
    } catch (err) {
      notifyError(err.message || "Failed to delete client");
    }
  }

  function handleAddClientClick() {
    setShowCreateForm(true);
  }

  async function handleCreateClient(clientData) {
    try {
      const created = await createClient(clientData);
      setShowCreateForm(false);
      notifySuccess("Client created");
      await loadClients();
      await loadStats();
    } catch (err) {
      notifyError(err.message || "Failed to create client");
      throw err;
    }
  }

  async function handleUpdateClient(clientId, clientData) {
    try {
      await updateClient(clientId, clientData);
      setShowEditForm(false);
      notifySuccess("Client updated");
      await loadClients();
      await loadStats();
    } catch (err) {
      notifyError(err.message || "Failed to update client");
      throw err;
    }
  }

  const statsData = [
    { label: "Total Clients", value: String(stats.totalClients || 0) },
    { label: "Active Clients", value: String(stats.activeClients || 0) },
    { label: "Revenue (Total)", value: formatCurrency(stats.totalRevenue || 0) },
    { label: "New This Month", value: String(stats.newClientsThisMonth || 0) },
  ];

  /**
   * Renders per-row action controls with an overflow dropdown.
   * Ensures only the clicked row opens and closes on outside click.
   * @param {{ client: any }} props
   */
  function ActionButtonsComponent({ client }) {
    const menuRef = useRef(null);

    useEffect(function bindOutsideClick() {
      function onDocClick(e) {
        if (openDropdownId !== client.id) return;
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setOpenDropdownId(null);
        }
      }
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("touchstart", onDocClick, { passive: true });
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("touchstart", onDocClick);
      };
    }, [openDropdownId, client.id]);

    return (
      <ActionButtons>
        <ActionButton
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEditClient(client);
          }}
        >
          <FiEdit />
        </ActionButton>

        <DropdownContainer ref={menuRef} $isopen={openDropdownId === client.id}>
          <ActionButton
            $isopen={openDropdownId === client.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenDropdownId((prev) => (prev === client.id ? null : client.id));
            }}
          >
            <FiMoreVertical />
          </ActionButton>
          <DropdownMenu $isopen={openDropdownId === client.id}>
            <DropdownItem
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(client);
              }}
            >
              <FiTrash2 />
              Delete Client
            </DropdownItem>
          </DropdownMenu>
        </DropdownContainer>
      </ActionButtons>
    );
  }

  if (loading && clients.length === 0) {
    return (
      <LoadingContainer>
        <FiLoader className="animate-spin" size={24} />
        Loading clients...
      </LoadingContainer>
    );
  }

  return (
    <div>
      <PageHeader>
        <HeaderContent>
          <PageTitle>Clients</PageTitle>
          <PageDescription>
            Manage your client relationships and track project collaboration
          </PageDescription>
        </HeaderContent>
        <HeaderActions>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={handleBackfillClients}>
            Sync Clients
          </Button>
          <Button variant="outline">
            <FiDownload />
            Export
          </Button>
          <Button onClick={handleAddClientClick}>
            <FiPlus />
            Add Client
          </Button>
        </HeaderActions>
      </PageHeader>

      {error && (
        <ErrorContainer>
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Retry
          </Button>
        </ErrorContainer>
      )}

      <StatsGrid>
        {statsData.map((stat, index) => (
          <StatCard key={index}>
            <CardContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </CardContent>
          </StatCard>
        ))}
      </StatsGrid>

      <FiltersBar>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            placeholder="Search clients..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchContainer>
        <FilterSelect value={statusFilter} onChange={handleStatusFilterChange}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>
      </FiltersBar>

      <ViewToggle>
        <ViewButton $isactive={viewMode === "table"} onClick={() => setViewMode("table")} type="button">
          <FiList />
          Table View
        </ViewButton>
        <ViewButton $isactive={viewMode === "grid"} onClick={() => setViewMode("grid")} type="button">
          <FiGrid />
          Grid View
        </ViewButton>
      </ViewToggle>

      {clients.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState>
              <EmptyStateIcon>
                <FiEye />
              </EmptyStateIcon>
              <EmptyStateTitle>No clients found</EmptyStateTitle>
              <EmptyStateDescription>
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first client"}
              </EmptyStateDescription>
              <Button style={{ marginTop: "16px" }} onClick={() => setShowCreateForm(true)}>
                <FiPlus />
                Add Your First Client
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <>
          <ClientGrid>
            {clients.map((client) => (
              <ClientCard key={client.id}>
                <CardContent>
                  <ClientHeader>
                    <a href={`/admin/clients/${client.id}`} aria-label={`View ${client.companyName}`}>
                      <ClientAvatar>{getInitials(client.companyName)}</ClientAvatar>
                    </a>
                    <ClientInfo>
                      <ClientName>{client.companyName}</ClientName>
                      <ClientContact>
                        <FaBuilding />
                        {client.contactName}
                      </ClientContact>
                      <ClientEmail>
                        <FiMail />
                        {client.contactEmail}
                      </ClientEmail>
                    </ClientInfo>
                    <StatusDot status={client.status} />
                  </ClientHeader>

                  <ClientStats>
                    <ClientStatItem>
                      <ClientStatValue>{client.projects?.length || 0}</ClientStatValue>
                      <ClientStatLabel>Total Projects</ClientStatLabel>
                    </ClientStatItem>
                    <ClientStatItem>
                      <ClientStatValue>{client.activeProjects || 0}</ClientStatValue>
                      <ClientStatLabel>Active</ClientStatLabel>
                    </ClientStatItem>
                    <ClientStatItem>
                      <ClientStatValue>{formatCurrency(client.totalRevenue || 0)}</ClientStatValue>
                      <ClientStatLabel>Revenue</ClientStatLabel>
                    </ClientStatItem>
                  </ClientStats>

                  <ClientActions>
                    <div>
                      <Badge variant={client.status === "active" ? "success" : "secondary"}>
                        {client.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <ActionButtonsComponent client={client} />
                  </ClientActions>
                </CardContent>
              </ClientCard>
            ))}
          </ClientGrid>

          <PaginationContainer>
            <PaginationInfo>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
            </PaginationInfo>
            <PaginationButtons>
              <Button variant="outline" disabled={!pagination.hasPrev} onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!pagination.hasNext} onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
            </PaginationButtons>
          </PaginationContainer>
        </>
      ) : (
        <>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <a href={`/admin/clients/${client.id}`} aria-label={`View ${client.companyName}`}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <ClientAvatar>{getInitials(client.companyName)}</ClientAvatar>
                            <div>
                              <div style={{ fontWeight: 600 }}>{client.companyName}</div>
                              <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{client.website || "—"}</div>
                            </div>
                          </div>
                        </a>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div>{client.contactName}</div>
                          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{client.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{client.projects?.length || 0}</TableCell>
                      <TableCell>{formatCurrency(client.totalRevenue || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === "active" ? "success" : "secondary"}>
                          {client.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ActionButtonsComponent client={client} />
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </CardContent>
          </Card>

          <PaginationContainer>
            <PaginationInfo>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
            </PaginationInfo>
            <PaginationButtons>
              <Button variant="outline" disabled={!pagination.hasPrev} onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!pagination.hasNext} onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
            </PaginationButtons>
          </PaginationContainer>
        </>
      )}

      <CreateClientForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateClient}
        title="Add New Client"
        submitText="Create Client"
      />

      {showEditForm && (
        <CreateClientForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSubmit={(data) => handleUpdateClient(editingClient.id, data)}
          initialData={editingClient}
          title="Edit Client"
          submitText="Update Client"
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message={
          deletingClient
            ? `Are you sure you want to delete "${deletingClient.companyName}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Client"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
