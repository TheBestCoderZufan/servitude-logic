// src/app/admin/settings/SettingsPageClient.jsx
/** @module admin/settings/SettingsPageClient */
"use client";
import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import {
  PageHeader,
  PageTitle,
  PageDescription,
  SettingsContainer,
  SettingsNav,
  SettingsNavCard,
  SettingsNavList,
  SettingsNavItem,
  SettingsContent,
  SettingsSection,
  ProfileImageContainer,
  ProfileImageWrapper,
  ProfileImage,
  ProfileImageUpload,
  NotificationItem,
  NotificationInfo,
  NotificationTitle,
  NotificationDescription,
  ToggleSwitch,
  ToggleInput,
  ToggleSlider,
  TeamMemberItem,
  TeamMemberInfo,
  TeamMemberName,
  TeamMemberEmail,
} from "./style";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Select,
  Avatar,
  FormGroup,
  Label,
  TextArea,
  Badge,
} from "@/components/ui";
import { FiCamera, FiSave } from "react-icons/fi";
import { getInitials } from "@/lib/utils";

import { useRouter, usePathname } from "next/navigation";

export default function SettingsPageClient({
  initialProfile,
  initialNotifications,
  initialTeam,
  initialTab = "profile",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    company: initialProfile?.company || "",
    jobTitle: initialProfile?.jobTitle || "",
    bio: initialProfile?.bio || "",
    timezone: initialProfile?.timezone || "America/New_York",
    language: initialProfile?.language || "en",
    dateFormat: initialProfile?.dateFormat || "MM/DD/YYYY",
    timeFormat: initialProfile?.timeFormat || "12h",
  });
  const [notifications, setNotifications] = useState(
    initialNotifications || []
  );
  const [teamMembers, setTeamMembers] = useState(initialTeam || []);

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }
  function handleNotificationToggle(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  }
  async function saveProfile() {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save profile");
    } catch (e) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }
  async function saveNotifications() {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      if (!res.ok) throw new Error("Failed to save notifications");
    } catch (e) {
      setError("Failed to save notifications.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDashboardLayout activeTab="settings">
      <div>
        <PageHeader>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Manage your profile, notifications, and team
          </PageDescription>
        </PageHeader>

        <SettingsContainer>
          <SettingsNav aria-label="Settings navigation">
            <SettingsNavCard>
              <SettingsNavList>
                {[
                  { id: "profile", label: "Profile" },
                  { id: "notifications", label: "Notifications" },
                  { id: "team", label: "Team" },
                ].map((t) => (
                  <SettingsNavItem
                    key={t.id}
                    $isactive={activeTab === t.id}
                    aria-current={activeTab === t.id ? "page" : undefined}
                    onClick={() => {
                      setActiveTab(t.id);
                      const p = new URLSearchParams();
                      if (t.id !== "profile") p.set("tab", t.id);
                      router.replace(`${pathname}?${p.toString()}`);
                    }}
                  >
                    {t.label}
                  </SettingsNavItem>
                ))}
              </SettingsNavList>
            </SettingsNavCard>
          </SettingsNav>
          <SettingsContent>
            {activeTab === "profile" && (
              <SettingsSection>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile photo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileImageContainer>
                      <ProfileImageWrapper>
                        <ProfileImage>
                          {getInitials(formData.name || formData.email)}
                        </ProfileImage>
                        <ProfileImageUpload>
                          <FiCamera size={14} />
                          <input type="file" accept="image/*" />
                        </ProfileImageUpload>
                      </ProfileImageWrapper>
                      <div>
                        <h3 style={{ margin: "0 0 4px 0" }}>
                          {formData.name || "User Name"}
                        </h3>
                        <p
                          style={{ margin: 0, color: "#64748b", fontSize: 14 }}
                        >
                          {formData.email}
                        </p>
                      </div>
                    </ProfileImageContainer>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <FormGroup>
                        <Label>Full Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Company</Label>
                        <Input
                          value={formData.company}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                          placeholder="Company"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Job Title</Label>
                        <Input
                          value={formData.jobTitle}
                          onChange={(e) =>
                            handleInputChange("jobTitle", e.target.value)
                          }
                          placeholder="Job title"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Phone"
                        />
                      </FormGroup>
                      <FormGroup style={{ gridColumn: "1 / -1" }}>
                        <Label>Bio</Label>
                        <TextArea
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          placeholder="Your bio"
                        />
                      </FormGroup>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 12,
                      }}
                    >
                      <Button onClick={saveProfile} disabled={saving}>
                        <FiSave /> Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SettingsSection>
            )}

            {activeTab === "notifications" && (
              <SettingsSection>
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Choose which notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {notifications.map((n) => (
                      <NotificationItem key={n.id}>
                        <NotificationInfo>
                          <NotificationTitle>{n.title}</NotificationTitle>
                          <NotificationDescription>
                            {n.description}
                          </NotificationDescription>
                        </NotificationInfo>
                        <ToggleSwitch>
                          <ToggleInput
                            type="checkbox"
                            checked={!!n.enabled}
                            onChange={() => handleNotificationToggle(n.id)}
                          />
                          <ToggleSlider />
                        </ToggleSwitch>
                      </NotificationItem>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 12,
                      }}
                    >
                      <Button onClick={saveNotifications} disabled={saving}>
                        <FiSave /> Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SettingsSection>
            )}

            {activeTab === "team" && (
              <SettingsSection>
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Collaborators on your projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teamMembers.map((m) => (
                      <TeamMemberItem key={m.id}>
                        <Avatar size="28">{m.avatar}</Avatar>
                        <TeamMemberInfo>
                          <TeamMemberName>{m.name}</TeamMemberName>
                          <TeamMemberEmail>{m.email}</TeamMemberEmail>
                        </TeamMemberInfo>
                        <Badge variant="secondary">{m.role}</Badge>
                      </TeamMemberItem>
                    ))}
                  </CardContent>
                </Card>
              </SettingsSection>
            )}
          </SettingsContent>
        </SettingsContainer>
      </div>
    </AdminDashboardLayout>
  );
}
