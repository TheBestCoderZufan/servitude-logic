// src/app/admin/clients/new/NewClientPageClient.jsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Button from "@/components/ui/shadcn/Button";
import { useToastNotifications } from "@/components/ui/Toast";
import { useBlockClientRole } from "@/lib/roleGuard";
import { cn } from "@/lib/utils/cn";
import { FiArrowLeft, FiSave, FiX, FiRefreshCw } from "react-icons/fi";

const clientSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), "Enter 10 digits (numbers only)"),
  address: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  notes: z.string().optional(),
  projectBudget: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Please enter a valid budget amount"),
  preferredCommunication: z.string().default("email"),
});

const industryOptions = [
  { value: "", label: "Select Industry" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "real-estate", label: "Real Estate" },
  { value: "non-profit", label: "Non-Profit" },
  { value: "other", label: "Other" },
];

async function createClient(userId, clientData) {
  const response = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...clientData, userId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create client");
  }
  return response.json();
}

const INPUT_CLASSES =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

const LABEL_CLASSES = "text-xs font-semibold uppercase tracking-wide text-muted";

export default function NewClientPageClient() {
  useBlockClientRole();
  const { user } = useUser();
  const router = useRouter();
  const { notifyFormError, notifyFormSuccess } = useToastNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    industry: "",
    notes: "",
    projectBudget: "",
    preferredCommunication: "email",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, contactPhone: digits }));
    if (errors.contactPhone) setErrors((prev) => ({ ...prev, contactPhone: null }));
  };

  const validateForm = () => {
    try {
      clientSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      const fieldErrors = {};
      err?.issues?.forEach((i) => {
        fieldErrors[i.path[0]] = i.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      notifyFormError("Please fix the errors and try again");
      return;
    }
    setIsLoading(true);
    try {
      await createClient(user?.id, formData);
      notifyFormSuccess("saved");
      router.push("/admin/clients");
    } catch (error) {
      notifyFormError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Add New Client</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => router.push("/admin/clients")}> 
            <FiX className="h-4 w-4" aria-hidden="true" />
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleSubmit} disabled={isLoading}>
            <FiSave className={cn("h-4 w-4", isLoading && "hidden")} aria-hidden="true" />
            {isLoading ? "Saving..." : "Create Client"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-lg font-semibold text-foreground">Company Information</h2>
                <p className="text-xs text-muted">Tell us about the organisation you&apos;re working with.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-companyName">
                    Company name
                  </label>
                  <input
                    id="client-companyName"
                    className={INPUT_CLASSES}
                    value={formData.companyName}
                    onChange={(event) => handleInputChange("companyName", event.target.value)}
                    placeholder="Enter company name"
                  />
                  {errors.companyName ? (
                    <p className="text-xs text-red-500">{errors.companyName}</p>
                  ) : (
                    <p className="text-xs text-muted">Legal or trading name</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-industry">
                    Industry
                  </label>
                  <select
                    id="client-industry"
                    className={INPUT_CLASSES}
                    value={formData.industry}
                    onChange={(event) => handleInputChange("industry", event.target.value)}
                  >
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-website">
                    Website
                  </label>
                  <input
                    id="client-website"
                    className={INPUT_CLASSES}
                    value={formData.website}
                    onChange={(event) => handleInputChange("website", event.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={LABEL_CLASSES} htmlFor="client-address">
                    Address
                  </label>
                  <textarea
                    id="client-address"
                    rows={3}
                    className={INPUT_CLASSES}
                    value={formData.address}
                    onChange={(event) => handleInputChange("address", event.target.value)}
                    placeholder="Company address"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
                <p className="text-xs text-muted">Who should we communicate with on the client side?</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-contactName">
                    Contact name
                  </label>
                  <input
                    id="client-contactName"
                    className={INPUT_CLASSES}
                    value={formData.contactName}
                    onChange={(event) => handleInputChange("contactName", event.target.value)}
                    placeholder="Enter contact name"
                  />
                  {errors.contactName ? <p className="text-xs text-red-500">{errors.contactName}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-contactEmail">
                    Contact email
                  </label>
                  <input
                    id="client-contactEmail"
                    type="email"
                    className={INPUT_CLASSES}
                    value={formData.contactEmail}
                    onChange={(event) => handleInputChange("contactEmail", event.target.value)}
                    placeholder="contact@company.com"
                  />
                  {errors.contactEmail ? <p className="text-xs text-red-500">{errors.contactEmail}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-contactPhone">
                    Phone number
                  </label>
                  <input
                    id="client-contactPhone"
                    type="tel"
                    className={INPUT_CLASSES}
                    value={formData.contactPhone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                  />
                  {errors.contactPhone ? (
                    <p className="text-xs text-red-500">{errors.contactPhone}</p>
                  ) : (
                    <p className="text-xs text-muted">Numbers only, 10 digits.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-preferredCommunication">
                    Preferred communication
                  </label>
                  <select
                    id="client-preferredCommunication"
                    className={INPUT_CLASSES}
                    value={formData.preferredCommunication}
                    onChange={(event) => handleInputChange("preferredCommunication", event.target.value)}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="slack">Slack</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-lg font-semibold text-foreground">Project details</h2>
                <p className="text-xs text-muted">Optional information that helps scope the engagement.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-1 md:max-w-sm">
                  <label className={LABEL_CLASSES} htmlFor="client-projectBudget">
                    Estimated project budget
                  </label>
                  <input
                    id="client-projectBudget"
                    type="number"
                    className={INPUT_CLASSES}
                    value={formData.projectBudget}
                    onChange={(event) => handleInputChange("projectBudget", event.target.value)}
                    placeholder="50000.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className={LABEL_CLASSES} htmlFor="client-notes">
                    Notes
                  </label>
                  <textarea
                    id="client-notes"
                    rows={4}
                    className={INPUT_CLASSES}
                    value={formData.notes}
                    onChange={(event) => handleInputChange("notes", event.target.value)}
                    placeholder="Additional context, goals, or expectations..."
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                type="button"
                className="gap-2"
                onClick={() => router.push("/admin/clients")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isLoading}>
                {isLoading ? (
                  <FiRefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FiSave className="h-4 w-4" aria-hidden="true" />
                )}
                {isLoading ? "Saving" : "Create client"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <FiRefreshCw className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <span className="ml-2 text-sm text-primary">Creating client...</span>
        </div>
      ) : null}
    </div>
  );
}
