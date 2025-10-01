// src/app/dashboard/proposals/ProposalsPageClient.jsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import { Badge, Card, CardContent } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TitleGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PageSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProposalsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`;

const ProposalCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ProposalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Meta = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const statusVariantMap = {
  DRAFT: "default",
  IN_REVIEW: "warning",
  CLIENT_APPROVAL_PENDING: "info",
  APPROVED: "success",
  DECLINED: "error",
};

/**
 * Client proposals overview page.
 *
 * @param {{proposals: Array<Object>}} props - Component props.
 * @returns {JSX.Element}
 */
export default function ProposalsPageClient({ proposals }) {
  return (
    <div>
      <PageHeader>
        <TitleGroup>
          <PageTitle>Proposals</PageTitle>
          <PageSubtitle>Review scopes awaiting approval and revisit past agreements.</PageSubtitle>
        </TitleGroup>
      </PageHeader>

      {proposals.length === 0 ? (
        <EmptyState>No proposals yet. New proposals will appear here once Servitude Logic prepares them.</EmptyState>
      ) : (
        <ProposalsGrid>
          {proposals.map((proposal) => (
            <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
              <ProposalCard as="article">
                <CardHeader>
                  <ProposalTitle>{proposal.intake?.projectName || proposal.project?.name || "Project proposal"}</ProposalTitle>
                  <Badge variant={statusVariantMap[proposal.status] || "default"}>
                    {proposal.status.replace(/_/g, " ")}
                  </Badge>
                </CardHeader>
                <CardContent style={{ padding: 0, marginTop: "1rem" }}>
                  <Meta>
                    <span>
                      <strong>Estimate:</strong> {formatCurrency(proposal.estimateAmount)} · {proposal.estimatedHours.toFixed(1)} hrs
                    </span>
                    {proposal.sentAt && (
                      <span>
                        <strong>Shared:</strong> {formatDate(proposal.sentAt)}
                      </span>
                    )}
                    {proposal.clientApprovedAt && (
                      <span>
                        <strong>Approved:</strong> {formatDate(proposal.clientApprovedAt)}
                      </span>
                    )}
                    {proposal.clientDeclinedAt && (
                      <span>
                        <strong>Declined:</strong> {formatDate(proposal.clientDeclinedAt)}
                      </span>
                    )}
                    <span>{proposal.summary || "No summary provided."}</span>
                  </Meta>
                </CardContent>
              </ProposalCard>
            </Link>
          ))}
        </ProposalsGrid>
      )}
    </div>
  );
}
/** @module dashboard/proposals/ProposalsPageClient */
