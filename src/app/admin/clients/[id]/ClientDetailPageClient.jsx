// src/app/admin/clients/[id]/ClientDetailPageClient.jsx
/** @module admin/clients/[id]/ClientDetailPageClient */
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  TextArea,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import { clientDetailTabs } from "@/data/page/admin/clientDetailTabs";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  PageWrap,
  Header,
  Title,
  SubTitle,
  Tabs,
  TabButton,
  TwoCol,
  Section,
  SectionTitle,
} from "./style";

/**
 * Client island for Admin Client Detail.
 * @param {Object} props
 * @param {Object|null} props.initialClient
 * @param {Array<Object>} props.initialInvoices
 */
import { useRouter, usePathname } from "next/navigation";

export default function ClientDetailPageClient({
  initialClient,
  initialInvoices,
  initialTab = "overview",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id;

  const [client, setClient] = useState(initialClient || null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { notifySuccess, notifyError } = useToastNotifications();

  const [statusMenuFor, setStatusMenuFor] = useState(null);
  const [statusMenuPos, setStatusMenuPos] = useState({ left: 0, top: 0 });

  const [projects, setProjects] = useState(initialClient?.projects || []);
  const [projectId, setProjectId] = useState(
    initialClient?.projects?.[0]?.id || ""
  );
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("DOC");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSubmitting, setFileSubmitting] = useState(false);

  const [msgProjectId, setMsgProjectId] = useState(
    initialClient?.projects?.[0]?.id || ""
  );
  const [message, setMessage] = useState("");
  const [msgSubmitting, setMsgSubmitting] = useState(false);

  const [duration, setDuration] = useState("30");
  const [tz, setTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [t3, setT3] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const [invoices, setInvoices] = useState(initialInvoices || []);

  // Load from API if initial SSR is missing
  useEffect(() => {
    if (!id) return;
    if (initialClient) return; // seeded
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setClient(data);
        setProjects(data.projects || []);
        if (data.projects?.length) {
          setProjectId(data.projects[0].id);
          setMsgProjectId(data.projects[0].id);
        }
        const invRes = await fetch(`/api/invoices?clientId=${id}&limit=50`);
        if (invRes.ok) {
          const invData = await invRes.json();
          setInvoices(invData.invoices || []);
        }
      } catch (err) {}
    };
    load();
    return () => {
      active = false;
    };
  }, [id, initialClient]);

  const overviewStats = useMemo(() => {
    if (!client) return null;
    const totalProjects =
      client.projects?.length || client._count?.projects || 0;
    return {
      totalProjects,
      activeProjects: client.activeProjects || 0,
      totalRevenue: client.totalRevenue || 0,
      tasks: client.totalTasks || 0,
      completedTasks: client.completedTasks || 0,
      lastContact: client.lastContact,
    };
  }, [client]);

  const statusOptions = [
    { label: "Planning", value: "PLANNING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const toggleStatusMenu = useCallback((e, projectId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - menuWidth - 8
    );
    const top = Math.min(rect.bottom + 6, window.innerHeight - 8);
    setStatusMenuPos({ left, top });
    setStatusMenuFor((prev) => (prev === projectId ? null : projectId));
  }, []);

  useEffect(() => {
    const onDocClick = () => setStatusMenuFor(null);
    const onWin = () => setStatusMenuFor(null);
    if (statusMenuFor) {
      document.addEventListener("click", onDocClick);
      window.addEventListener("scroll", onWin, true);
      window.addEventListener("resize", onWin);
    }
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
  }, [statusMenuFor]);

  async function submitFile() {
    if (!projectId || !fileName || !fileType || !fileUrl) return;
    setFileSubmitting(true);
    try {
      const res = await fetch(`/api/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, fileName, fileType, url: fileUrl }),
      });
      if (res.ok) {
        setFileName("");
        setFileType("DOC");
        setFileUrl("");
      }
    } finally {
      setFileSubmitting(false);
    }
  }

  async function sendMessage() {
    if (!msgProjectId || !message.trim()) return;
    setMsgSubmitting(true);
    try {
      await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          projectId: msgProjectId,
          type: "client_message",
        }),
      });
      setMessage("");
    } finally {
      setMsgSubmitting(false);
    }
  }

  async function submitSchedule() {
    if (!msgProjectId || !t1) return;
    setScheduleSubmitting(true);
    try {
      const text = `Meeting request (${duration} mins, ${tz})\nOptions:\n- ${t1}${
        t2 ? `\n- ${t2}` : ""
      }${t3 ? `\n- ${t3}` : ""}\nNotes: ${notes || "—"}`;
      await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          projectId: msgProjectId,
          type: "meeting_request",
        }),
      });
      setT1("");
      setT2("");
      setT3("");
      setNotes("");
    } finally {
      setScheduleSubmitting(false);
    }
  }

  async function sendInvoice(id) {
    await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    const invRes = await fetch(`/api/invoices?clientId=${params?.id}&limit=50`);
    if (invRes.ok) {
      const invData = await invRes.json();
      setInvoices(invData.invoices || []);
    }
  }

  const overview = overviewStats;

  return (
    <PageWrap>
      <Header>
        <div>
          <Title>{client?.companyName || "Client"}</Title>
          <SubTitle>
            {client?.contactName} • {client?.contactEmail}
          </SubTitle>
        </div>
      </Header>

      <Tabs>
        {clientDetailTabs.map((t) => (
          <TabButton
            key={t.id}
            $active={activeTab === t.id}
            onClick={() => {
              setActiveTab(t.id);
              const p = new URLSearchParams();
              if (t.id && t.id !== "overview") p.set("tab", t.id);
              router.replace(`${pathname}?${p.toString()}`);
            }}
          >
            {t.icon}
            {t.label}
          </TabButton>
        ))}
      </Tabs>

      {activeTab === "overview" && (
        <TwoCol>
          <Section>
            <SectionTitle>At a Glance</SectionTitle>
            <Card>
              <CardContent>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Projects
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {overview?.totalProjects || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Active</div>
                    <div style={{ fontWeight: 700 }}>
                      {overview?.activeProjects || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Revenue
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {formatCurrency(overview?.totalRevenue || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Section>
            <SectionTitle>Invoices</SectionTitle>
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.invoiceNumber}</TableCell>
                        <TableCell>{formatCurrency(inv.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(inv.issueDate)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell>
                          {inv.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendInvoice(inv.id)}
                            >
                              Send
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </Section>
        </TwoCol>
      )}

      {activeTab === "files" && (
        <Section>
          <SectionTitle>Files & Approvals</SectionTitle>
          <Card>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="File name (e.g., Homepage v1.pdf)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Input
                  placeholder="File type (e.g., PDF, DOC)"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                />
                <Input
                  placeholder="File URL"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={submitFile}
                  disabled={
                    fileSubmitting || !projectId || !fileName || !fileUrl
                  }
                >
                  {fileSubmitting ? "Uploading..." : "Send for Approval"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {activeTab === "messages" && (
        <Section>
          <SectionTitle>Messages & Support</SectionTitle>
          <Card>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Select
                  value={msgProjectId}
                  onChange={(e) => setMsgProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <TextArea
                placeholder="Write a message to the client team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <Button
                  onClick={sendMessage}
                  disabled={msgSubmitting || !message.trim() || !msgProjectId}
                >
                  {msgSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {activeTab === "schedule" && (
        <Section>
          <SectionTitle>Schedule a Meeting</SectionTitle>
          <Card>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Select
                  value={msgProjectId}
                  onChange={(e) => setMsgProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
                <Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </Select>
              </div>
              <Input
                placeholder="Option 1 (ISO date/time)"
                value={t1}
                onChange={(e) => setT1(e.target.value)}
              />
              <Input
                placeholder="Option 2 (optional)"
                value={t2}
                onChange={(e) => setT2(e.target.value)}
                style={{ marginTop: 8 }}
              />
              <Input
                placeholder="Option 3 (optional)"
                value={t3}
                onChange={(e) => setT3(e.target.value)}
                style={{ marginTop: 8 }}
              />
              <TextArea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ marginTop: 8 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <Button
                  onClick={submitSchedule}
                  disabled={scheduleSubmitting || !msgProjectId || !t1}
                >
                  {scheduleSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}
    </PageWrap>
  );
}
