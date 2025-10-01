// src/app/dashboard/settings/ClientSettingsPageClient.jsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Avatar } from "@/components/ui";
import { PageHeader, PageTitle, PageDescription, SettingsContainer, SettingsNav, SettingsNavList, SettingsNavItem, SettingsContent, Section, FormGrid, AvatarRow, AvatarUpload, ToggleRow, RadioList, RadioItem } from "./style";

/**
 * ClientSettingsPageClient
 *
 * Renders the client settings with a horizontal navigation: Profile, Security, Notifications.
 * Profile allows editing first/last name, email (read-only), phone, timezone, and avatar upload UI.
 * Security presents a password change form (UI placeholder; backend handled separately).
 * Notifications exposes three toggles (Email Updates, Invoice Reminders, Task Mentions).
 *
 * @param {Object} props - Component props
 * @param {{firstName:string,lastName:string,email:string,phone:string,timezone:string}} props.initialProfile - Initial profile values
 * @param {Array.<{id:string,title:string,description:string,enabled:boolean}>} props.initialNotifications - Initial notification categories
 * @returns {JSX.Element}
 */
export default function ClientSettingsPageClient({ initialProfile, initialNotifications }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications || []);
  const [saving, setSaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [themePreference, setThemePreference] = useState("system");

  useEffect(function loadThemePref() {
    try {
      const stored = window.localStorage.getItem("themePreference");
      if (stored === "system" || stored === "light" || stored === "dark") {
        setThemePreference(stored);
      }
    } catch (_) {}
  }, []);

  function saveProfile() {
    setSaving(true);
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    fetch(`/api/settings/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: profile.phone, timezone: profile.timezone }),
    }).finally(() => setSaving(false));
  }

  function saveNotifications() {
    setSaving(true);
    fetch(`/api/settings/notifications`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications }),
    }).finally(() => setSaving(false));
  }

  function toggleNotification(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
  }

  function savePassword(e) {
    e?.preventDefault();
    // Placeholder: Hook into auth abstraction to change password server-side.
    // Intentionally not implemented here per security guidelines.
  }

  function savePreferences() {
    setSaving(true);
    try {
      window.localStorage.setItem("themePreference", themePreference);
      if (typeof window !== "undefined" && typeof window.__setThemePreference === "function") {
        window.__setThemePreference(themePreference);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageDescription>Manage your profile, security, and notifications</PageDescription>
      </PageHeader>

      <SettingsContainer>
        <SettingsNav aria-label="Settings navigation">
          <SettingsNavList>
            {[
              { id: "profile", label: "Profile" },
              { id: "security", label: "Security" },
              { id: "notifications", label: "Notifications" },
              { id: "preferences", label: "Preferences" },
            ].map((t) => (
              <li key={t.id}>
                <SettingsNavItem
                  type="button"
                  $active={activeTab === t.id}
                  aria-current={activeTab === t.id ? "page" : undefined}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </SettingsNavItem>
              </li>
            ))}
          </SettingsNavList>
        </SettingsNav>
        <SettingsContent>
      {activeTab === "profile" && (
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Edit your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarRow>
                <Avatar size="64">{(profile.firstName || profile.lastName || "U").slice(0, 1)}</Avatar>
                <AvatarUpload htmlFor="avatar-upload">Upload new avatar<input id="avatar-upload" type="file" accept="image/*" /></AvatarUpload>
              </AvatarRow>
              <FormGrid>
                <Input placeholder="First Name" value={profile.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                <Input placeholder="Last Name" value={profile.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                <Input placeholder="Email" value={profile.email || ""} disabled aria-disabled="true" />
                <Input placeholder="Phone" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <Select value={profile.timezone || "America/New_York"} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="America/Chicago">America/Chicago (CT)</option>
                  <option value="America/Denver">America/Denver (MT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                </Select>
              </FormGrid>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {activeTab === "security" && (
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePassword}>
                <FormGrid>
                  <Input type="password" placeholder="Current Password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} required />
                  <Input type="password" placeholder="New Password" value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} required />
                  <Input type="password" placeholder="Confirm New Password" value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} required />
                </FormGrid>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Section>
      )}

      {activeTab === "notifications" && (
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Select which updates you receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                {notifications.map((n) => (
                  <ToggleRow key={n.id}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      <div style={{ color: "#64748b", fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: n.description }} />
                    </div>
                    <input type="checkbox" checked={!!n.enabled} onChange={() => toggleNotification(n.id)} />
                  </ToggleRow>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <Button onClick={saveNotifications} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {activeTab === "preferences" && (
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Choose appearance and other options</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Theme</div>
              <RadioList role="radiogroup" aria-label="Theme preference">
                {(["system", "light", "dark"]) .map((opt) => (
                  <RadioItem key={opt}>
                    <input
                      type="radio"
                      name="themePreference"
                      value={opt}
                      checked={themePreference === opt}
                      onChange={(e) => setThemePreference(e.target.value)}
                      aria-checked={themePreference === opt}
                    />
                    <span style={{ textTransform: "capitalize" }}>{opt}</span>
                  </RadioItem>
                ))}
              </RadioList>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <Button onClick={savePreferences} disabled={saving}>{saving ? "Saving..." : "Save Preferences"}</Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}
        </SettingsContent>
      </SettingsContainer>
    </div>
  );
}
