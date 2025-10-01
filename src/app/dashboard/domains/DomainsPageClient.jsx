// src/app/dashboard/domains/DomainsPageClient.jsx
"use client";
import { useState } from "react";
import { Card, CardContent, Input, Button } from "@/components/ui";
import styled from "styled-components";
import { FiSearch } from "react-icons/fi";

/** @module dashboard/domains/DomainsPageClient */

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export default function DomainsPageClient() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const search = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/domain/search?q=${encodeURIComponent(domain.trim())}`);
      if (res.ok) setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!result?.data?.domain_name) return;
    await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Domain request for ${result.data.domain_name}: ${note || "No notes"}`, projectId: (result.projectId || ""), type: "domain_request" }),
    });
    setNote("");
  };

  return (
    <div>
      <Title>Domains &amp; Hosting</Title>
      <Card>
        <CardContent>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <FiSearch />
            <Input placeholder="Search domain (e.g., mybusiness.com)" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Button onClick={search} disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
          </div>
          {result && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{result.data.domain_name}</div>
              <div style={{ color: result.data.available === "Yes" ? "#10b981" : "#ef4444" }}>
                {result.data.available === "Yes" ? "Available" : "Not Available"}
              </div>
              <div style={{ marginTop: 12 }}>
                <Input placeholder="Add notes (e.g., hosting preferences, DNS)" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Button onClick={submitRequest}>Submit Request</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

