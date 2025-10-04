// src/app/dashboard/settings/ClientSettingsPageClient.jsx
"use client";
import { useEffect, useState } from "react";
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
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const SETTINGS_TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "preferences", label: "Preferences" },
];

/**
 * ClientSettingsPageClient
 *
 * Renders the client settings experience with sections for profile, security,
 * notifications, and preferences. Server-provided values hydrate the initial
 * forms while the local UI handles optimistic updates.
 *
 * @param {Object} props - Component props.
 * @param {{firstName:string,lastName:string,email:string,phone:string,timezone:string}} props.initialProfile - Initial profile values.
 * @param {Array.<{id:string,title:string,description:string,enabled:boolean}>} props.initialNotifications - Notification categories and states.
 * @returns {JSX.Element}
 */
export default function ClientSettingsPageClient({ initialProfile, initialNotifications }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications || []);
  const [saving, setSaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [themePreference, setThemePreference] = useState("system");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("themePreference");
      if (["system", "light", "dark"].includes(stored)) {
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

  function savePassword(event) {
    event?.preventDefault();
    // Placeholder: integrate with auth abstraction for password updates.
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
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-base text-muted">Manage your profile, security, and notifications</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="sticky top-24 self-start" aria-label="Settings navigation">
          <ul className="flex flex-col gap-2">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "w-full rounded-xl border px-4 py-2 text-left text-sm font-medium transition",
                      isActive
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-10">
          {activeTab === "profile" && (
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Edit your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar size="64">{(profile.firstName || profile.lastName || "U").slice(0, 1)}</Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted transition hover:bg-surface-hover"
                    >
                      Upload new avatar
                      <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="First Name" value={profile.firstName || ""} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} />
                    <Input placeholder="Last Name" value={profile.lastName || ""} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} />
                    <Input placeholder="Email" value={profile.email || ""} disabled aria-disabled="true" />
                    <Input placeholder="Phone" value={profile.phone || ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                    <Select value={profile.timezone || "America/New_York"} onChange={(event) => setProfile({ ...profile, timezone: event.target.value })}>
                      <option value="America/New_York">America/New_York (ET)</option>
                      <option value="America/Chicago">America/Chicago (CT)</option>
                      <option value="America/Denver">America/Denver (MT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {activeTab === "security" && (
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={savePassword} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input type="password" placeholder="Current Password" value={securityForm.currentPassword} onChange={(event) => setSecurityForm({ ...securityForm, currentPassword: event.target.value })} required />
                      <Input type="password" placeholder="New Password" value={securityForm.newPassword} onChange={(event) => setSecurityForm({ ...securityForm, newPassword: event.target.value })} required />
                      <Input type="password" placeholder="Confirm New Password" value={securityForm.confirmPassword} onChange={(event) => setSecurityForm({ ...securityForm, confirmPassword: event.target.value })} required />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Update Password</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>
          )}

          {activeTab === "notifications" && (
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Select which updates you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <label key={notification.id} className="flex items-center justify-between gap-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-foreground">{notification.title}</div>
                          <div className="text-xs text-muted" dangerouslySetInnerHTML={{ __html: notification.description }} />
                        </div>
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-border text-primary"
                          checked={!!notification.enabled}
                          onChange={() => toggleNotification(notification.id)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveNotifications} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {activeTab === "preferences" && (
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Choose appearance and other options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-foreground">Theme</div>
                    <div role="radiogroup" aria-label="Theme preference" className="space-y-2">
                      {["system", "light", "dark"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface"
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={option}
                            checked={themePreference === option}
                            onChange={(event) => setThemePreference(event.target.value)}
                            className="h-4 w-4 border-border text-primary"
                          />
                          <span className="capitalize text-foreground">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={savePreferences} disabled={saving}>
                      {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
