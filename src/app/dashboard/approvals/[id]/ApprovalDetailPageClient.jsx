// src/app/dashboard/approvals/[id]/ApprovalDetailPageClient.jsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { FiChevronLeft } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

/** @module dashboard/approvals/ApprovalDetailPageClient */

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default function ApprovalDetailPageClient({ item }) {
  return (
    <div>
      <Header>
        <div>
          <Title>Approval: {item.title}</Title>
          <div style={{ color: "#64748b" }}>
            {item.project?.name} • {item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"}
          </div>
        </div>
        <Link href="/dashboard/approvals">
          <Button variant="outline" size="sm"><FiChevronLeft /> Back</Button>
        </Link>
      </Header>

      <Card>
        <CardContent>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "#64748b" }}>Status</div>
              <Badge variant={item.status === "COMPLETED" ? "success" : item.dueDateStatus === "overdue" ? "error" : item.dueDateStatus === "due-soon" ? "warning" : "default"}>
                {item.status === "COMPLETED" ? "Completed" : "Awaiting Your Signature"}
              </Badge>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {item.status !== "COMPLETED" && (
                <Button onClick={() => window.location.assign("/dashboard/approvals")}>Sign</Button>
              )}
            </div>
          </div>
          {item.description && (
            <div style={{ marginTop: 16, color: "#334155" }}>{item.description}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

