// src/app/admin/reports/ReportsPageClient.jsx
/** @module admin/reports/ReportsPageClient */
"use client";
import { useState } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  Avatar,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui";
import {
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiBarChart,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckSquare,
} from "react-icons/fi";
import {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  HeaderActions,
  LastUpdated,
  FiltersBar,
  FilterGroup,
  FilterLabel,
  MetricsGrid,
  MetricCard,
  MetricContent,
  MetricHeader,
  MetricIcon,
  MetricChange,
  MetricValue,
  MetricLabel,
  MetricSubtitle,
  ChartsGrid,
  ChartContainer,
  ProjectStatsItem,
  ProjectStatsInfo,
  ProjectStatsLabel,
  ProjectStatsValue,
  ReportsGrid,
  TeamPerformanceItem,
  TeamMemberInfo,
  TeamMemberName,
  TeamMemberRole,
  TeamMemberStats,
  TeamMemberMetric,
  TeamMemberProgress,
  ProgressBar,
  ProgressFill,
  RecentActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityText,
  ActivityTime,
  LoadingContainer,
  ErrorContainer,
} from "./style";
import {
  dateRangeOptions,
  projectFilterOptions,
  teamFilterOptions,
} from "@/data/page/admin/reports/reportsData";

function getIconComponent(name) {
  const map = { FiBarChart, FiCheckSquare };
  return map[name] || FiBarChart;
}

import { useRouter, usePathname } from "next/navigation";

export default function ReportsPageClient({ initialMetrics, initialProjectStats, initialTeamPerformance, initialRecentActivity, initialDateRange = "last-30-days" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [projectFilter, setProjectFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [metrics, setMetrics] = useState(initialMetrics || []);
  const [projectStats, setProjectStats] = useState(initialProjectStats || []);
  const [teamPerformance, setTeamPerformance] = useState(initialTeamPerformance || []);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity || []);
  const [error, setError] = useState(null);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/reports?dateRange=${dateRange}`);
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      setMetrics(data.metrics || []);
      setProjectStats(data.projectStats || []);
      setTeamPerformance(data.teamPerformance || []);
      setRecentActivity(data.recentActivity || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }

  function updateDateRange(val) {
    setDateRange(val);
    const p = new URLSearchParams();
    if (val && val !== "last-30-days") p.set("dateRange", val);
    router.replace(`${pathname}?${p.toString()}`);
  }

  return (
    <AdminDashboardLayout activeTab="reports">
      <div>
        <PageHeader>
          <HeaderContent>
            <PageTitle>Reports &amp; Analytics</PageTitle>
            <PageDescription>Comprehensive insights into your business performance and team productivity</PageDescription>
          </HeaderContent>
          <HeaderActions>
            <LastUpdated>
              <FiRefreshCw size={16} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </LastUpdated>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <FiRefreshCw className="animate-spin" /> : <FiRefreshCw />} {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline">
              <FiDownload />
              Export
            </Button>
          </HeaderActions>
        </PageHeader>

        {error && (
          <ErrorContainer>
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>Retry</Button>
          </ErrorContainer>
        )}

        <FiltersBar>
          <FilterGroup>
            <FilterLabel>Date Range:</FilterLabel>
            <Select value={dateRange} onChange={(e) => updateDateRange(e.target.value)}>
              {dateRangeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Projects:</FilterLabel>
            <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              {projectFilterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Team:</FilterLabel>
            <Select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              {teamFilterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup style={{ alignSelf: "end" }}>
            <Button variant="outline" size="sm">
              <FiFilter />
              Advanced Filters
            </Button>
          </FilterGroup>
        </FiltersBar>

        <MetricsGrid>
          {metrics.map((metric, i) => {
            const Icon = getIconComponent(metric.icon);
            return (
              <MetricCard key={i}>
                <MetricContent>
                  <MetricHeader>
                    <MetricIcon color={metric.color}>
                      <Icon />
                    </MetricIcon>
                    <MetricChange $ispositive={metric.isPositive}>
                      {metric.isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                      {metric.change}
                    </MetricChange>
                  </MetricHeader>
                  <MetricValue>{metric.value}</MetricValue>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricSubtitle>{metric.subtitle}</MetricSubtitle>
                </MetricContent>
              </MetricCard>
            );
          })}
        </MetricsGrid>

        <ChartsGrid>
          <Card>
            <CardHeader>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue over the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <FiBarChart />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer>📊 Revenue chart would be displayed here</ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
              <CardDescription>Breakdown of projects by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {projectStats.map((s, i) => (
                <ProjectStatsItem key={i}>
                  <ProjectStatsInfo>
                    <div style={{ width: 10, height: 10, borderRadius: 9999, background: s.color }} />
                    <ProjectStatsLabel>{s.label}</ProjectStatsLabel>
                  </ProjectStatsInfo>
                  <ProjectStatsValue>{s.value}</ProjectStatsValue>
                </ProjectStatsItem>
              ))}
            </CardContent>
          </Card>
        </ChartsGrid>

        <ReportsGrid>
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Task throughput and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              {teamPerformance.length > 0 ? (
                teamPerformance.map((member, idx) => (
                  <TeamPerformanceItem key={idx}>
                    <TeamMemberInfo>
                      <Avatar size="28">{member.avatar}</Avatar>
                      <div>
                        <TeamMemberName>{member.name}</TeamMemberName>
                        <TeamMemberRole>{member.role}</TeamMemberRole>
                      </div>
                    </TeamMemberInfo>
                    <TeamMemberStats>
                      <TeamMemberMetric>{member.tasksCompleted} tasks</TeamMemberMetric>
                      <TeamMemberProgress>
                        <ProgressBar style={{ width: 60 }}>
                          <ProgressFill progress={member.efficiency} variant="success" />
                        </ProgressBar>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{member.efficiency}%</span>
                      </TeamMemberProgress>
                    </TeamMemberStats>
                  </TeamPerformanceItem>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>No team performance data available</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.map((a, i) => (
                <RecentActivityItem key={i}>
                  <ActivityIcon color={a.color}><FiCheckSquare /></ActivityIcon>
                  <ActivityContent>
                    <ActivityText>{a.text || a.description}</ActivityText>
                    <ActivityTime>{a.time || a.timeAgo}</ActivityTime>
                  </ActivityContent>
                </RecentActivityItem>
              ))}
            </CardContent>
          </Card>
        </ReportsGrid>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <CardTitle>Top Performing Projects</CardTitle>
                <CardDescription>Projects ranked by profitability and completion rate</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <FiDownload />
                Export Table
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                <TableRow>
                  <TableCell>
                    <div style={{ fontWeight: 500 }}>Data will be populated from project analytics</div>
                  </TableCell>
                  <TableCell>Coming soon...</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                </TableRow>
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
