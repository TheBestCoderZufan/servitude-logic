// src/app/admin/clients/new/NewClientPageClient.jsx
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { FormGroup, Label, Input, TextArea, Select, HelperText, ErrorText, Button, CardContent } from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import { useBlockClientRole } from "@/lib/roleGuard";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import {
  PageContainer,
  PageHeader,
  HeaderLeft,
  BackButton,
  HeaderTitle,
  HeaderActions,
  FormCard,
  FormSection,
  SectionTitle,
  FormGrid,
  FormActions,
  LoadingOverlay,
  LoadingSpinner,
} from "./style";

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
    <AdminDashboardLayout activeTab="clients">
      <PageContainer>
        <PageHeader>
          <HeaderLeft>
            <BackButton variant="outline" onClick={() => router.back()}>
              <FiArrowLeft /> Back
            </BackButton>
            <HeaderTitle>Add New Client</HeaderTitle>
          </HeaderLeft>
          <HeaderActions>
            <Button variant="outline" onClick={() => router.push("/admin/clients")}> <FiX /> Cancel </Button>
            <Button onClick={handleSubmit}> <FiSave /> Create Client </Button>
          </HeaderActions>
        </PageHeader>

        <FormCard>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FormSection>
                <SectionTitle>Company Information</SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>Company Name *</Label>
                    <Input value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} placeholder="Enter company name" />
                    {errors.companyName ? <ErrorText>{errors.companyName}</ErrorText> : <HelperText>Legal or trading name</HelperText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Industry</Label>
                    <Select value={formData.industry} onChange={(e) => handleInputChange("industry", e.target.value)}>
                      {industryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Website</Label>
                    <Input value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="https://company.com" />
                  </FormGroup>
                  <FormGroup style={{ gridColumn: "1 / -1" }}>
                    <Label>Address</Label>
                    <TextArea value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Company address" rows={3} />
                  </FormGroup>
                </FormGrid>
              </FormSection>

              <FormSection>
                <SectionTitle>Contact Information</SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>Contact Name *</Label>
                    <Input value={formData.contactName} onChange={(e) => handleInputChange("contactName", e.target.value)} placeholder="Enter contact name" />
                    {errors.contactName && <ErrorText>{errors.contactName}</ErrorText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Contact Email *</Label>
                    <Input type="email" value={formData.contactEmail} onChange={(e) => handleInputChange("contactEmail", e.target.value)} placeholder="contact@company.com" />
                    {errors.contactEmail && <ErrorText>{errors.contactEmail}</ErrorText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input type="tel" value={formData.contactPhone.replace(/\D/g, "")} onChange={handlePhoneChange} placeholder="(555) 123-4567" />
                    {errors.contactPhone ? <ErrorText>{errors.contactPhone}</ErrorText> : <HelperText>Numbers only</HelperText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Preferred Communication</Label>
                    <Select value={formData.preferredCommunication} onChange={(e) => handleInputChange("preferredCommunication", e.target.value)}>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="slack">Slack</option>
                    </Select>
                  </FormGroup>
                </FormGrid>
              </FormSection>

              <FormSection>
                <SectionTitle>Project Details</SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>Estimated Project Budget</Label>
                    <Input type="number" value={formData.projectBudget} onChange={(e) => handleInputChange("projectBudget", e.target.value)} placeholder="50000.00" min="0" step="0.01" />
                  </FormGroup>
                  <FormGroup style={{ gridColumn: "1 / -1" }}>
                    <Label>Notes</Label>
                    <TextArea value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Additional notes about the client..." rows={4} />
                  </FormGroup>
                </FormGrid>
              </FormSection>

              <FormActions>
                <Button variant="outline" type="button" onClick={() => router.push("/admin/clients")}>Cancel</Button>
                <Button type="submit">Create Client</Button>
              </FormActions>
            </form>
          </CardContent>
        </FormCard>

        {isLoading && (
          <LoadingOverlay>
            <LoadingSpinner aria-label="Loading" />
          </LoadingOverlay>
        )}
      </PageContainer>
    </AdminDashboardLayout>
  );
}

