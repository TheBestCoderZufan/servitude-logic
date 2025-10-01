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
import {
  Layout,
  Header,
  Title,
  Subtitle,
  Grid,
  Card,
  CardTitle,
  Section,
  ModuleGrid,
  ModuleCard,
  LineItemTable,
  TotalsRow,
  Actions,
} from "./ProposalWorkspacePageClient.style.jsx";
import { formatCurrency } from "@/lib/utils";
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
    <Layout>
      <Header>
        <Title>Proposal workspace</Title>
        <Subtitle>
          Prepare the scoped proposal for {intakeSummary.projectName}. Modules and custom line items feed
          directly into the client approval flow.
        </Subtitle>
        <Badge variant="info">Intake status: {intake.status.replace(/_/g, " ")}</Badge>
      </Header>

      <Grid>
        <Card aria-labelledby="proposal-summary">
          <CardTitle id="proposal-summary">Proposal summary</CardTitle>
          <Section>
            <label htmlFor="proposal-summary-field" style={{ fontWeight: 600 }}>
              Executive summary
            </label>
            <HelperText>
              Summarise the proposed scope, objectives, and any key assumptions for the review package.
            </HelperText>
            <TextArea
              id="proposal-summary-field"
              rows={5}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Section>

          <Section>
            <CardTitle as="h3">Pricing modules</CardTitle>
            <HelperText>Select the relevant delivery modules. Adjust hours and rates in the pricing table.</HelperText>
            <ModuleGrid>
              {pricingModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  type="button"
                  $selected={selectedModuleIds.has(module.id)}
                  onClick={() => toggleModule(module)}
                  aria-pressed={selectedModuleIds.has(module.id)}
                >
                  <strong>{module.title}</strong>
                  <span style={{ color: "#475569", fontSize: "0.875rem" }}>{module.description}</span>
                  <HelperText>
                    {module.defaultHours}h @ {formatCurrency(module.blendedRate)} / hr
                  </HelperText>
                </ModuleCard>
              ))}
            </ModuleGrid>
          </Section>

          <Section>
            <CardTitle as="h3">Pricing details</CardTitle>
            {lineItems.length === 0 && (
              <HelperText>Add modules or custom line items to build your estimate.</HelperText>
            )}
            {lineItems.length > 0 && (
              <LineItemTable>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Hours</th>
                    <th scope="col">Rate</th>
                    <th scope="col">Total</th>
                    <th scope="col" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.key}>
                      <td>
                        <Input
                          value={item.title}
                          onChange={(event) => updateLineItem(item.key, "title", event.target.value)}
                          aria-label={`Title for ${item.key}`}
                        />
                        <HelperText>
                          <TextArea
                            value={item.description}
                            onChange={(event) => updateLineItem(item.key, "description", event.target.value)}
                            rows={2}
                            placeholder="Description"
                          />
                        </HelperText>
                      </td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.hours}
                          onChange={(event) => updateLineItem(item.key, "hours", event.target.value)}
                          aria-label={`Estimated hours for ${item.title}`}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.rate}
                          onChange={(event) => updateLineItem(item.key, "rate", event.target.value)}
                          aria-label={`Hourly rate for ${item.title}`}
                        />
                      </td>
                      <td>{formatCurrency(item.amount)}</td>
                      <td>
                        {!item.moduleId && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeLineItem(item.key)}
                            aria-label={`Remove ${item.title}`}
                          >
                            <FiTrash2 />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </LineItemTable>
            )}
            <Button type="button" variant="outline" onClick={() => setLineItems((prev) => [...prev, createEmptyCustomLineItem()])}>
              <FiPlus /> Add custom line item
            </Button>

            <TotalsRow>
              <span>Total estimated hours</span>
              <strong>{totals.hours.toFixed(1)} h</strong>
            </TotalsRow>
            <TotalsRow>
              <span>Investment estimate</span>
              <strong>{formatCurrency(totals.amount)}</strong>
            </TotalsRow>
          </Section>

          <Section>
            <label htmlFor="proposal-status" style={{ fontWeight: 600 }}>Workflow status</label>
            <Select
              id="proposal-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ maxWidth: 280 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <HelperText>
              Choose the appropriate state before saving. Selecting "Ready for client" will package and deliver the proposal to the client portal.
            </HelperText>
            <label htmlFor="proposal-message" style={{ fontWeight: 600 }}>Reviewer or client message</label>
            <TextArea
              id="proposal-message"
              rows={3}
              placeholder="Add optional context for reviewers or the client."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </Section>

          {error && <ErrorText>{error}</ErrorText>}

          <Actions>
            <Button
              type="button"
              variant="outline"
              onClick={() => persistProposal(status, { message })}
              disabled={saving}
            >
              <FiSave /> {saving ? "Saving..." : "Save proposal"}
            </Button>
            <Button
              type="button"
              onClick={() => persistProposal(CLIENT_STATUS_TARGET, { message })}
              disabled={saving || lineItems.length === 0}
            >
              <FiSend /> {saving ? "Working..." : "Send to client"}
            </Button>
          </Actions>
        </Card>

        <Card aria-labelledby="intake-context">
          <CardTitle id="intake-context">Client context</CardTitle>
          <Section>
            <strong>Client</strong>
            <HelperText>
              {intake.client.companyName} · {intake.client.contactName} ({intake.client.contactEmail})
            </HelperText>
          </Section>
          <Section>
            <strong>Project goals</strong>
            <HelperText>{intakeSummary.goalStatement || "No goal statement provided."}</HelperText>
          </Section>
          <Section>
            <strong>Target launch</strong>
            <HelperText>{intakeSummary.targetLaunch || "Not specified"}</HelperText>
          </Section>
          <Section>
            <strong>Budget range</strong>
            <HelperText>{intakeSummary.budgetRange || "Not provided"}</HelperText>
          </Section>
          <Section>
            <strong>Stakeholders</strong>
            <HelperText>{intakeSummary.stakeholders || "Not provided"}</HelperText>
          </Section>
        </Card>
      </Grid>
    </Layout>
  );
}
/** @module admin/intake/[id]/proposal/ProposalWorkspacePageClient */
