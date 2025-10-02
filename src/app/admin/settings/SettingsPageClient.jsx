// src/app/admin/settings/SettingsPageClient.jsx
/** @module admin/settings/SettingsPageClient */
"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCamera, FiRefreshCw, FiSave } from "react-icons/fi";
import Button from "@/components/ui/shadcn/Button";
import { getInitials } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TAB_ITEMS = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "team", label: "Team" },
];

const INPUT_CLASSES =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";
const LABEL_CLASSES = "text-xs font-semibold uppercase tracking-wide text-muted";

/**
 * Admin settings client component.
 *
 * @param {Object} props - Component props.
 * @param {Object|null} props.initialProfile - Prefetched profile data.
 * @param {Array<Object>} props.initialNotifications - Notification preferences.
 * @param {Array<Object>} props.initialTeam - Team roster data.
 * @param {string} [props.initialTab="profile"] - Seed tab identifier.
 * @returns {JSX.Element}
 */
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
  const [formData, setFormData] = useState(() => ({
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
  }));
  const [notifications, setNotifications] = useState(initialNotifications || []);
  const [teamMembers] = useState(initialTeam || []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  function updateUrl(tabId) {
    const params = new URLSearchParams();
    if (tabId !== "profile") params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    updateUrl(tabId);
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleNotificationToggle(id) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification,
      ),
    );
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to save profile");
    } catch (err) {
      setError(err.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      if (!response.ok) throw new Error("Failed to save notifications");
    } catch (err) {
      setError(err.message || "Unable to save notifications");
    } finally {
      setSaving(false);
    }
  }

  const profileAvatar = useMemo(
    () => getInitials(formData.name || formData.email || "User"),
    [formData.name, formData.email],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted">Manage your profile, notifications, and team preferences.</p>
        </div>
        <Button
          variant="secondary"
          className={cn("gap-2", saving && "opacity-70")}
          onClick={activeTab === "notifications" ? saveNotifications : saveProfile}
          disabled={saving}
        >
          <FiSave className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving" : "Save changes"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <Button variant="secondary" className="gap-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="w-full shrink-0 lg:w-60">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <ul className="flex flex-col">
              {TAB_ITEMS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:bg-surface-hover",
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="flex-1 space-y-6">
          {activeTab === "profile" ? (
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {profileAvatar}
                    </span>
                    <label className="absolute -bottom-2 -right-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow">
                      <FiCamera className="h-3 w-3" aria-hidden="true" />
                      Upload
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{formData.name || "Your Name"}</p>
                    <p className="text-xs text-muted">{formData.email || "No email on file"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-name">
                    Full name
                  </label>
                  <input
                    id="settings-name"
                    className={INPUT_CLASSES}
                    value={formData.name}
                    onChange={(event) => handleInputChange("name", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-email">
                    Email address
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    className={INPUT_CLASSES}
                    value={formData.email}
                    onChange={(event) => handleInputChange("email", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-phone">
                    Phone
                  </label>
                  <input
                    id="settings-phone"
                    className={INPUT_CLASSES}
                    value={formData.phone}
                    onChange={(event) => handleInputChange("phone", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-company">
                    Company
                  </label>
                  <input
                    id="settings-company"
                    className={INPUT_CLASSES}
                    value={formData.company}
                    onChange={(event) => handleInputChange("company", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-job-title">
                    Job title
                  </label>
                  <input
                    id="settings-job-title"
                    className={INPUT_CLASSES}
                    value={formData.jobTitle}
                    onChange={(event) => handleInputChange("jobTitle", event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-timezone">
                    Timezone
                  </label>
                  <select
                    id="settings-timezone"
                    className={INPUT_CLASSES}
                    value={formData.timezone}
                    onChange={(event) => handleInputChange("timezone", event.target.value)}
                  >
                    <option value="America/New_York">Eastern (US)</option>
                    <option value="America/Chicago">Central (US)</option>
                    <option value="America/Denver">Mountain (US)</option>
                    <option value="America/Los_Angeles">Pacific (US)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-language">
                    Language
                  </label>
                  <select
                    id="settings-language"
                    className={INPUT_CLASSES}
                    value={formData.language}
                    onChange={(event) => handleInputChange("language", event.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-date-format">
                    Date format
                  </label>
                  <select
                    id="settings-date-format"
                    className={INPUT_CLASSES}
                    value={formData.dateFormat}
                    onChange={(event) => handleInputChange("dateFormat", event.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="settings-time-format">
                    Time format
                  </label>
                  <select
                    id="settings-time-format"
                    className={INPUT_CLASSES}
                    value={formData.timeFormat}
                    onChange={(event) => handleInputChange("timeFormat", event.target.value)}
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={LABEL_CLASSES} htmlFor="settings-bio">
                    Bio
                  </label>
                  <textarea
                    id="settings-bio"
                    rows={4}
                    className={INPUT_CLASSES}
                    value={formData.bio}
                    onChange={(event) => handleInputChange("bio", event.target.value)}
                    placeholder="Tell clients a little about yourself and your role."
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
                Profile changes are saved to your team workspace.
              </div>
            </section>
          ) : null}

          {activeTab === "notifications" ? (
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Email notifications</p>
                  <p className="text-xs text-muted">Choose when the platform should send you updates.</p>
                </div>
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted">{item.description}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={item.enabled}
                          onChange={() => handleNotificationToggle(item.id)}
                        />
                        <span className="h-5 w-10 rounded-full bg-muted transition peer-checked:bg-primary" />
                        <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-background transition peer-checked:translate-x-5" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "team" ? (
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Team members</p>
                  <p className="text-xs text-muted">Collaborators who have access to shared dashboards and projects.</p>
                </div>
                <Button variant="secondary" className="gap-2">
                  Invite teammate
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted">No teammates found. Invite someone to start collaborating.</p>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {member.avatar}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted">{member.email}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        {member.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
