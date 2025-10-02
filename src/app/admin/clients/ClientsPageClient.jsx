// src/app/admin/clients/ClientsPageClient.jsx
/** @module admin/clients/ClientsPageClient */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import Button from "@/components/ui/shadcn/Button";
const CreateClientForm = dynamic(() =>
  import("@/components/forms/CreateClientForm").then((m) => m.CreateClientForm)
);
const ConfirmationDialog = dynamic(() =>
  import("@/components/ui/Modal").then((m) => m.ConfirmationDialog)
);
import { useToastNotifications } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  FiDownload,
  FiEdit,
  FiEye,
  FiGrid,
  FiList,
  FiLoader,
  FiMail,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";

const STATUS_BADGES = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  inactive: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

/**
 * Pill-styled status indicator used in table and card views.
 * @param {{ status: string }} props
 * @returns {JSX.Element}
 */
function StatusPill({ status }) {
  const tone = status === "active" ? STATUS_BADGES.active : STATUS_BADGES.inactive;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        tone,
      )}
    >
      {status}
    </span>
  );
}

/**
 * Icon-only button used for compact actions.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Icon node.
 * @param {boolean} [props.active] - Whether the button is in an active state.
 * @param {string} [props.className] - Additional class names.
 * @returns {JSX.Element}
 */
function IconButton({ children, active = false, className, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition hover:bg-surface-hover hover:text-foreground",
        active && "bg-surface-hover text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Clients page interactive UI. Accepts server-rendered data and continues
 * hydration with client-side fetching, modals, and inline actions.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialClients - Prefetched client records.
 * @param {Object} props.initialPagination - Pagination metadata.
 * @param {Object} props.initialStats - Header stat payload.
 * @param {number} [props.initialPage=1] - Seed page.
 * @param {number} [props.initialLimit=10] - Seed limit.
 * @param {string} [props.initialSearch=""] - Seed search term.
 * @param {string} [props.initialStatus="all"] - Seed status filter.
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

  const [clients, setClients] = useState(initialClients || []);
  const [stats, setStats] = useState(
    initialStats || {
      totalClients: 0,
      activeClients: 0,
      totalRevenue: 0,
      newClientsThisMonth: 0,
    },
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
    },
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  /**
   * Fetches clients from the API with current filters.
   * @param {string} userId - Clerk user identifier.
   * @param {number} page - Page number.
   * @param {number} limit - Page size.
   * @param {string} search - Search query.
   * @param {string} status - Status filter.
   * @returns {Promise<any>}
   */
  async function fetchClients(userId, page = 1, limit = 10, search = "", status = "all") {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append("search", search);
    if (status !== "all") params.append("status", status);
    if (userId) params.append("userId", userId);

    const response = await fetch(`/api/clients?${params.toString()}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch clients");
    }
    return response.json();
  }

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
        statusFilter,
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
      const newStats = await fetchClientStats(user.id);
      setStats(newStats);
    } catch {
      // ignore stats fetch failure
    }
  }

  async function loadInitialData() {
    await Promise.all([loadClients(), loadStats()]);
  }

  useEffect(() => {
    setSkipInitialFetch(false);
  }, []);

  useEffect(() => {
    if (skipInitialFetch) return;
    if (user?.id) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, pagination.page, statusFilter]);

  useEffect(() => {
    const debounced = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else if (!skipInitialFetch) {
        loadClients();
      }
    }, 300);
    return () => clearTimeout(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  function handleStatusFilterChange(event) {
    setStatusFilter(event.target.value);
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
      await createClient(clientData);
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

  const statsCards = useMemo(
    () => [
      { label: "Total Clients", value: String(stats.totalClients || 0) },
      { label: "Active Clients", value: String(stats.activeClients || 0) },
      { label: "Revenue (Total)", value: formatCurrency(stats.totalRevenue || 0) },
      { label: "New This Month", value: String(stats.newClientsThisMonth || 0) },
    ],
    [stats],
  );

  /**
   * Overflow actions per client row/card.
   * @param {{ client: any }} props
   * @returns {JSX.Element}
   */
  function ActionButtonsComponent({ client }) {
    const menuRef = useRef(null);

    useEffect(() => {
      function onDocClick(event) {
        if (openDropdownId !== client.id) return;
        if (menuRef.current && !menuRef.current.contains(event.target)) {
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

    const isMenuOpen = openDropdownId === client.id;

    return (
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <IconButton
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleEditClient(client);
          }}
          aria-label="Edit client"
        >
          <FiEdit className="h-4 w-4" aria-hidden="true" />
        </IconButton>

        <div className="relative">
          <IconButton
            active={isMenuOpen}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpenDropdownId((prev) => (prev === client.id ? null : client.id));
            }}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="More actions"
          >
            <FiMoreVertical className="h-4 w-4" aria-hidden="true" />
          </IconButton>

          {isMenuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteClick(client);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
              >
                <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                Delete Client
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-10 text-sm text-muted">
        <FiLoader className="h-6 w-6 animate-spin" aria-hidden="true" />
        Loading clients...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted">
            Manage your client relationships and track project collaboration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className={cn("gap-2", refreshing && "opacity-70")}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden="true" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleBackfillClients}>
            Sync Clients
          </Button>
          <Button variant="secondary" className="gap-2">
            <FiDownload className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button className="gap-2" onClick={handleAddClientClick}>
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            Add Client
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="secondary" className="gap-2" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <FiSearch
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search clients..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
            viewMode === "table"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary text-primary hover:bg-primary/10",
          )}
        >
          <FiList className="h-4 w-4" aria-hidden="true" />
          Table View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
            viewMode === "grid"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary text-primary hover:bg-primary/10",
          )}
        >
          <FiGrid className="h-4 w-4" aria-hidden="true" />
          Grid View
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiEye className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No clients found</h2>
          <p className="mt-2 text-sm text-muted">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first client."}
          </p>
          <Button className="mt-4 gap-2" onClick={() => setShowCreateForm(true)}>
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            Add Your First Client
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                    aria-label={`View ${client.companyName}`}
                  >
                    {getInitials(client.companyName)}
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{client.companyName}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <FaBuilding className="h-3 w-3" aria-hidden="true" />
                      {client.contactName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <FiMail className="h-3 w-3" aria-hidden="true" />
                      {client.contactEmail}
                    </p>
                  </div>
                  <StatusPill status={client.status} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-background px-3 py-3 text-center text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{client.projects?.length || 0}</p>
                    <p className="text-xs text-muted">Total Projects</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{client.activeProjects || 0}</p>
                    <p className="text-xs text-muted">Active</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{formatCurrency(client.totalRevenue || 0)}</p>
                    <p className="text-xs text-muted">Revenue</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <StatusPill status={client.status} />
                  <ActionButtonsComponent client={client} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted sm:flex-row">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="gap-2"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Projects</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-surface-hover/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="flex items-center gap-3"
                          aria-label={`View ${client.companyName}`}
                        >
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                            {getInitials(client.companyName)}
                          </span>
                          <span>
                            <span className="block font-semibold text-foreground">{client.companyName}</span>
                            <span className="block text-xs text-muted">{client.website || "—"}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-sm text-muted">
                          <span className="block text-foreground">{client.contactName}</span>
                          <span className="block">{client.contactEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{client.projects?.length || 0}</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatCurrency(client.totalRevenue || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <StatusPill status={client.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ActionButtonsComponent client={client} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted sm:flex-row">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="gap-2"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <CreateClientForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateClient}
        title="Add New Client"
        submitText="Create Client"
      />

      {showEditForm ? (
        <CreateClientForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSubmit={(data) => handleUpdateClient(editingClient.id, data)}
          initialData={editingClient}
          title="Edit Client"
          submitText="Update Client"
        />
      ) : null}

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
