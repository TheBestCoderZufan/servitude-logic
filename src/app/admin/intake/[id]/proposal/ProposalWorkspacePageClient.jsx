// src/app/admin/intake/[id]/proposal/ProposalWorkspacePageClient.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Input,
  Select,
  TextArea,
  Button,
  HelperText,
  ErrorText,
  Badge,
} from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";
import { FiSave, FiSend, FiPlus, FiTrash2 } from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "Internal review" },
  { value: "CLIENT_APPROVAL_PENDING", label: "Ready for client" },
];

const CLIENT_STATUS_TARGET = "CLIENT_APPROVAL_PENDING";

function createLineItemFromModule(module) {
  const amount = module.defaultHours * module.blendedRate;
  return {
    key: module.id,
    moduleId: module.id,
    title: module.title,
    description: module.description,
    hours: module.defaultHours,
    rate: module.blendedRate,
    amount,
  };
}

function createEmptyCustomLineItem() {
  return {
    key: `custom-${Date.now()}`,
    moduleId: null,
    title: "Custom line item",
    description: "",
    hours: 0,
    rate: 0,
    amount: 0,
  };
}

function normaliseLineItems(initialLineItems = []) {
  return initialLineItems.map((item) => ({
    key: item.key || item.moduleId || `item-${Math.random()}`,
    moduleId: item.moduleId || null,
    title: item.title || "",
    description: item.description || "",
    hours: Number(item.hours) || 0,
    rate: Number(item.rate) || 0,
    amount: Number(item.amount) || 0,
  }));
}

/**
 * Proposal workspace client component that lets admins assemble pricing modules,
 * capture proposal summaries, and control workflow status.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.intake - Intake metadata for context.
 * @param {Object|null} props.initialProposal - Existing proposal payload when editing.
 * @param {Array} props.pricingModules - Reusable pricing modules.
 * @param {Object} props.viewer - Signed-in admin metadata.
 * @returns {JSX.Element}
 */
export default function ProposalWorkspacePageClient({ intake, initialProposal, pricingModules, viewer }) {
  const { notifyError, notifySuccess } = useToastNotifications();
  const [summary, setSummary] = useState(initialProposal?.summary || "");
  const [lineItems, setLineItems] = useState(() => normaliseLineItems(initialProposal?.lineItems));
  const [status, setStatus] = useState(initialProposal?.status || "DRAFT");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedModuleIds = useMemo(
    () => new Set(lineItems.filter((item) => item.moduleId).map((item) => item.moduleId)),
    [lineItems],
  );

  useEffect(() => {
    if (initialProposal) {
      setSummary(initialProposal.summary || "");
      setLineItems(normaliseLineItems(initialProposal.lineItems));
      setStatus(initialProposal.status || "DRAFT");
    }
  }, [initialProposal]);

  const totals = useMemo(() => {
    const hours = lineItems.reduce((acc, item) => acc + (Number(item.hours) || 0), 0);
    const amount = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return { hours, amount };
  }, [lineItems]);

  function toggleModule(module) {
    const isSelected = selectedModuleIds.has(module.id);
    if (isSelected) {
      setLineItems((prev) => prev.filter((item) => item.moduleId !== module.id));
    } else {
      setLineItems((prev) => [...prev, createLineItemFromModule(module)]);
    }
  }

  function updateLineItem(key, field, value) {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (field === "hours" || field === "rate") {
          const next = { ...item, [field]: Number(value) || 0 };
          next.amount = Number((next.hours || 0) * (next.rate || 0));
          return next;
        }
        return { ...item, [field]: value };
      }),
    );
  }

  function removeLineItem(key) {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  }

  async function persistProposal(nextStatus, options = {}) {
    setSaving(true);
    setError("");
    try {
      const payload = {
        summary,
        status: nextStatus,
        message: options.message || "",
        lineItems: lineItems.map(({ key, ...rest }) => rest),
        selectedModules: Array.from(selectedModuleIds),
        estimatedHours: totals.hours,
        estimateAmount: totals.amount,
      };

      const response = await fetch(`/api/admin/intake/${intake.id}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error || "Unable to save proposal");
      }

      notifySuccess(
        nextStatus === CLIENT_STATUS_TARGET
          ? "Proposal shared with client"
          : "Proposal saved",
      );
      setMessage("");
      setStatus(nextStatus);
    } catch (saveError) {
      const messageText = saveError.message || "Something went wrong";
      setError(messageText);
      notifyError(messageText);
    } finally {
      setSaving(false);
    }
  }

  const intakeSummary = useMemo(() => {
    const data = intake.formData || {};
    return {
      projectName: data.projectName || intake.summary || "New project",
      goalStatement: data.goalStatement || "",
      targetLaunch: data.targetLaunch || "",
      budgetRange: data.budgetRange || "",
      stakeholders: data.stakeholders || "",
    };
  }, [intake]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Proposal workspace</h1>
        <p className="text-sm text-muted">
          Prepare the scoped proposal for {intakeSummary.projectName}. Modules and custom line items feed
          the client-facing document and billing readiness checks.
        </p>
      </header>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Scope summary</h2>
            <TextArea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Summarise the deliverables and goals for this proposal"
              rows={4}
            />
            <HelperText>Clients will see this summary in the portal once the proposal is shared.</HelperText>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Line items</h2>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                type="button"
                onClick={() => setLineItems((prev) => [...prev, createEmptyCustomLineItem()])}
              >
                <FiPlus className="h-4 w-4" aria-hidden="true" />
                Add custom line
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-background">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.key} className="border-t border-border">
                      <td className="px-4 py-3">
                        <Input
                          value={item.title}
                          onChange={(event) => updateLineItem(item.key, "title", event.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <TextArea
                          value={item.description}
                          onChange={(event) => updateLineItem(item.key, "description", event.target.value)}
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          value={item.hours}
                          onChange={(event) => updateLineItem(item.key, "hours", event.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(event) => updateLineItem(item.key, "rate", event.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(item.key)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Total hours</span>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                {totals.hours.toFixed(1)} hours
              </Badge>
              <span>Total estimate</span>
              <Badge variant="primary" className="rounded-full px-3 py-1 text-sm">
                {formatCurrency(totals.amount)}
              </Badge>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Pricing modules</h2>
            <p className="text-xs text-muted">
              Select modules to auto-populate line items. You can tweak hours and rates afterwards.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {pricingModules.map((module) => {
                const isSelected = selectedModuleIds.has(module.id);
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>{module.title}</span>
                      {isSelected ? (
                        <Badge variant="primary" className="rounded-full px-2 py-0.5 text-xs">
                          Selected
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-muted">{module.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      <span>{module.defaultHours} hrs</span>
                      <span>{formatCurrency(module.blendedRate)} / hr</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Intake summary</h2>
            <div className="space-y-3 text-sm text-muted">
              <div>
                <span className="font-semibold text-foreground">Project</span>
                <p>{intakeSummary.projectName}</p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Goal</span>
                <p>{intakeSummary.goalStatement || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-foreground">Target launch</span>
                  <p>{intakeSummary.targetLaunch || "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Budget range</span>
                  <p>{intakeSummary.budgetRange || "—"}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold text-foreground">Stakeholders</span>
                <p>{intakeSummary.stakeholders || "—"}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Workflow</h2>
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="proposal-status">
                Proposal status
              </label>
              <Select
                id="proposal-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <HelperText>Send to client when ready for approval. Current viewer: {viewer.fullName}.</HelperText>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="proposal-message">
                Internal note / client message
              </label>
              <TextArea
                id="proposal-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="Optional message when sharing with the client"
              />
            </div>
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => persistProposal("DRAFT")}
                disabled={saving}
              >
                <FiSave className="h-4 w-4" aria-hidden="true" />
                {saving ? "Saving..." : "Save draft"}
              </Button>
              <Button
                className="gap-2"
                onClick={() => persistProposal(CLIENT_STATUS_TARGET, { message })}
                disabled={saving}
              >
                <FiSend className="h-4 w-4" aria-hidden="true" />
                {saving ? "Sending..." : "Share with client"}
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
