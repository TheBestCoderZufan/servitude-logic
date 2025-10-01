// src/app/dashboard/proposals/[id]/ProposalDetailPageClient.jsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  Badge,
  Button,
  Card,
  CardContent,
  HelperText,
  TextArea,
  ErrorText,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastNotifications } from "@/components/ui/Toast";

const Layout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const SectionCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LineItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
    text-align: left;
  }

  thead {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const statusVariantMap = {
  DRAFT: "default",
  IN_REVIEW: "warning",
  CLIENT_APPROVAL_PENDING: "info",
  APPROVED: "success",
  DECLINED: "error",
};

/**
 * Proposal detail component for clients.
 *
 * @param {{proposal: Object, modules: Array}} props - Component props.
 * @returns {JSX.Element}
 */
export default function ProposalDetailPageClient({ proposal, modules }) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useToastNotifications();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const moduleLookup = useMemo(() => {
    return modules.reduce((acc, module) => ({ ...acc, [module.id]: module }), {});
  }, [modules]);

  const isFinalised = proposal.status === "APPROVED" || proposal.status === "DECLINED";

  async function respond(action) {
    if (isFinalised) return;
    if (action === "decline" && !comment.trim()) {
      setError("Please share feedback so the team knows what to update.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error || "Unable to update proposal");
      }
      notifySuccess(action === "approve" ? "Thanks! Proposal approved." : "Feedback sent to Servitude Logic.");
      setComment("");
      router.refresh();
    } catch (submitError) {
      notifyError(submitError.message || "Unable to process request");
    } finally {
      setSubmitting(false);
    }
  }

  const totalHours = proposal.estimatedHours?.toFixed(1) || "0.0";
  const selectedModules = proposal.selectedModules || [];

  return (
    <Layout>
      <Header>
        <Title>Proposal overview</Title>
        <Subtitle>
          {proposal.intake?.projectName || "Project"} · Shared {proposal.sentAt ? formatDate(proposal.sentAt) : "recently"}
        </Subtitle>
        <Badge variant={statusVariantMap[proposal.status] || "default"}>{proposal.status.replace(/_/g, " ")}</Badge>
      </Header>

      <Grid>
        <SectionCard as="section" aria-labelledby="proposal-summary-heading">
          <CardTitle id="proposal-summary-heading">Scope summary</CardTitle>
          <CardContent style={{ padding: 0 }}>
            <p style={{ marginBottom: "1.5rem" }}>{proposal.summary || "No summary provided."}</p>

            <LineItemTable>
              <thead>
                <tr>
                  <th scope="col">Line item</th>
                  <th scope="col">Hours</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.lineItems.map((item, index) => (
                  <tr key={`${item.title}-${index}`}>
                    <td>
                      <strong>{item.title}</strong>
                      <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{item.description}</div>
                    </td>
                    <td>{Number(item.hours || 0).toFixed(1)}</td>
                    <td>{formatCurrency(item.rate || 0)}</td>
                    <td>{formatCurrency(item.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </LineItemTable>

            <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.25rem" }}>
              <strong>Total investment:</strong> {formatCurrency(proposal.estimateAmount || 0)}
              <strong>Total hours:</strong> {totalHours} hours
            </div>
          </CardContent>
        </SectionCard>

        <SectionCard as="aside" aria-labelledby="proposal-context-heading">
          <CardTitle id="proposal-context-heading">Project context</CardTitle>
          <CardContent style={{ padding: 0, display: "grid", gap: "1rem" }}>
            <div>
              <strong>Goals</strong>
              <HelperText>{proposal.intake?.goalStatement || "No goals provided."}</HelperText>
            </div>
            <div>
              <strong>Target launch</strong>
              <HelperText>{proposal.intake?.targetLaunch || "Not specified"}</HelperText>
            </div>
            <div>
              <strong>Stakeholders</strong>
              <HelperText>{proposal.intake?.stakeholders || "Not provided"}</HelperText>
            </div>
            <div>
              <strong>Selected modules</strong>
              <HelperText>
                {selectedModules.length === 0
                  ? "No preset modules were selected."
                  : selectedModules
                      .map((moduleId) => moduleLookup[moduleId]?.title || moduleId)
                      .join(", ")}
              </HelperText>
            </div>
          </CardContent>

          {!isFinalised && (
            <div style={{ marginTop: "1.5rem" }}>
              <label htmlFor="proposal-comment" style={{ fontWeight: 600 }}>
                Share feedback (required for revisions)
              </label>
              <TextArea
                id="proposal-comment"
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Let the team know if you agree or what needs revision."
              />
              <HelperText>
                Approvals are logged for compliance. Declining requires a short note so the team can address it.
              </HelperText>
              {error && <ErrorText>{error}</ErrorText>}
              <Actions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => respond("decline")}
                  disabled={submitting}
                >
                  Request revision
                </Button>
                <Button
                  type="button"
                  onClick={() => respond("approve")}
                  disabled={submitting}
                >
                  Approve proposal
                </Button>
              </Actions>
            </div>
          )}

          {isFinalised && (
            <HelperText>
              {proposal.status === "APPROVED"
                ? "This proposal has been approved. A new project plan is being prepared."
                : "This proposal was declined. The team will follow up with next steps."}
            </HelperText>
          )}
        </SectionCard>
      </Grid>
    </Layout>
  );
}
/** @module dashboard/proposals/[id]/ProposalDetailPageClient */
