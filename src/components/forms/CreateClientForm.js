// src/components/forms/CreateClientForm.js
"use client";
import { useState } from "react";
import { FormModal } from "@/components/ui/Modal";
import {
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  HelperText,
  ErrorText,
} from "@/components/ui";
import { useToastNotifications } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

const FormSection = ({ children, className }) => (
  <section className={cn("mb-10", className)}>{children}</section>
);

const SectionTitle = ({ children, className }) => (
  <h3
    className={cn(
      "mb-6 border-b border-border pb-3 text-lg font-semibold text-foreground",
      className,
    )}
  >
    {children}
  </h3>
);

const FormGrid = ({ children, className }) => (
  <div className={cn("grid gap-6 md:grid-cols-2", className)}>{children}</div>
);

export const CreateClientForm = ({
  initialData,
  title,
  submitText,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { notifyFormError, notifyFormSuccess } = useToastNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || "",
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    address: initialData?.address || "",
    website: initialData?.website || "",
    industry: initialData?.industry || "",
    notes: initialData?.notes || "",
    projectBudget: initialData?.projectBudget || "",
    preferredCommunication: initialData?.preferredCommunication || "email",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (
      formData.contactPhone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(
        formData.contactPhone.replace(/[\s\-\(\)]/g, "")
      )
    ) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid website URL (including http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notifyFormError("Please correct the errors below");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
      notifyFormSuccess("created");
      onClose();
      setFormData({
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
    } catch (error) {
      notifyFormError(error.message || "Failed to create client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title || "Add New Client"}
      submitText={submitText || "Create Client"}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection>
        <SectionTitle>Company Information</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Company Name *</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder="Enter company name"
            />
            {errors.companyName && <ErrorText>{errors.companyName}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>Industry</Label>
            <Select
              value={formData.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
            >
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label>Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://example.com"
          />
          {errors.website && <ErrorText>{errors.website}</ErrorText>}
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>Contact Information</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Contact Name *</Label>
            <Input
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
              placeholder="Primary contact person"
            />
            {errors.contactName && <ErrorText>{errors.contactName}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              placeholder="contact@company.com"
            />
            {errors.contactEmail && (
              <ErrorText>{errors.contactEmail}</ErrorText>
            )}
          </FormGroup>
        </FormGrid>
        <FormGrid>
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
              placeholder="+1 (555) 123-4567"
            />
            {errors.contactPhone && (
              <ErrorText>{errors.contactPhone}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label>Preferred Communication</Label>
            <Select
              value={formData.preferredCommunication}
              onChange={(e) =>
                handleInputChange("preferredCommunication", e.target.value)
              }
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="slack">Slack</option>
              <option value="teams">Microsoft Teams</option>
            </Select>
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label>Address</Label>
          <TextArea
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Company address"
            rows={3}
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>Project Details</SectionTitle>
        <FormGroup>
          <Label>Estimated Project Budget</Label>
          <Input
            type="number"
            value={formData.projectBudget}
            onChange={(e) => handleInputChange("projectBudget", e.target.value)}
            placeholder="50000"
            min="0"
            step="1000"
          />
          <HelperText>
            Optional: Estimated budget for upcoming projects
          </HelperText>
        </FormGroup>
        <FormGroup>
          <Label>Notes</Label>
          <TextArea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional notes about the client..."
            rows={4}
          />
          <HelperText>
            Any additional information about the client or requirements
          </HelperText>
        </FormGroup>
      </FormSection>
    </FormModal>
  );
};

// src/components/forms/CreateProjectForm.js
export const CreateProjectForm = ({
  isOpen,
  onClose,
  onSubmit,
  clients = [],
}) => {
  const { notifyFormError, notifyFormSuccess } = useToastNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    endDate: "",
    budget: "",
    estimatedHours: "",
    projectType: "",
    tags: "",
    notes: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.clientId) {
      newErrors.clientId = "Please select a client";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.budget && (isNaN(formData.budget) || formData.budget < 0)) {
      newErrors.budget = "Please enter a valid budget amount";
    }

    if (
      formData.estimatedHours &&
      (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)
    ) {
      newErrors.estimatedHours = "Please enter valid estimated hours";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notifyFormError("Please correct the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };
      await onSubmit(submitData);
      notifyFormSuccess("created");
      onClose();
      setFormData({
        name: "",
        description: "",
        clientId: "",
        status: "planning",
        priority: "medium",
        startDate: "",
        endDate: "",
        budget: "",
        estimatedHours: "",
        projectType: "",
        tags: "",
        notes: "",
      });
    } catch (error) {
      notifyFormError(error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create New Project"
      submitText="Create Project"
      isLoading={isLoading}
      size="lg"
    >
      <FormSection>
        <SectionTitle>Project Information</SectionTitle>
        <FormGroup>
          <Label>Project Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter project name"
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the project goals and requirements"
            rows={4}
          />
        </FormGroup>
        <FormGrid>
          <FormGroup>
            <Label>Client *</Label>
            <Select
              value={formData.clientId}
              onChange={(e) => handleInputChange("clientId", e.target.value)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </Select>
            {errors.clientId && <ErrorText>{errors.clientId}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>Project Type</Label>
            <Select
              value={formData.projectType}
              onChange={(e) => handleInputChange("projectType", e.target.value)}
            >
              <option value="">Select type</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-app">Mobile App</option>
              <option value="design">Design</option>
              <option value="consulting">Consulting</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </FormSection>

      <FormSection>
        <SectionTitle>Project Settings</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="onHold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormGroup>
        </FormGrid>
        <FormGrid>
          <FormGroup>
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
            />
            {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>End Date</Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
            />
            {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
          </FormGroup>
        </FormGrid>
      </FormSection>

      <FormSection>
        <SectionTitle>Budget & Resources</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Budget</Label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              placeholder="25000"
              min="0"
              step="1000"
            />
            {errors.budget && <ErrorText>{errors.budget}</ErrorText>}
            <HelperText>Project budget in USD</HelperText>
          </FormGroup>
          <FormGroup>
            <Label>Estimated Hours</Label>
            <Input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) =>
                handleInputChange("estimatedHours", e.target.value)
              }
              placeholder="200"
              min="0"
              step="10"
            />
            {errors.estimatedHours && (
              <ErrorText>{errors.estimatedHours}</ErrorText>
            )}
            <HelperText>Total estimated work hours</HelperText>
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label>Tags</Label>
          <Input
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            placeholder="react, frontend, responsive"
          />
          <HelperText>
            Comma-separated tags for project categorization
          </HelperText>
        </FormGroup>
        <FormGroup>
          <Label>Notes</Label>
          <TextArea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional project notes..."
            rows={4}
          />
        </FormGroup>
      </FormSection>
    </FormModal>
  );
};

// src/components/forms/CreateTaskForm.js
export const CreateTaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  teamMembers = [],
}) => {
  const { notifyFormError, notifyFormSuccess } = useToastNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    estimatedHours: "",
    tags: "",
    dependencies: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (
      formData.estimatedHours &&
      (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)
    ) {
      newErrors.estimatedHours = "Please enter valid estimated hours";
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = "Due date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notifyFormError("Please correct the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };
      await onSubmit(submitData);
      notifyFormSuccess("created");
      onClose();
      setFormData({
        title: "",
        description: "",
        projectId: "",
        assigneeId: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        estimatedHours: "",
        tags: "",
        dependencies: "",
      });
    } catch (error) {
      notifyFormError(error.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create New Task"
      submitText="Create Task"
      isLoading={isLoading}
      size="md"
    >
      <FormSection>
        <SectionTitle>Task Information</SectionTitle>
        <FormGroup>
          <Label>Task Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter task title"
          />
          {errors.title && <ErrorText>{errors.title}</ErrorText>}
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what needs to be done"
            rows={4}
          />
        </FormGroup>
        <FormGroup>
          <Label>Project *</Label>
          <Select
            value={formData.projectId}
            onChange={(e) => handleInputChange("projectId", e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          {errors.projectId && <ErrorText>{errors.projectId}</ErrorText>}
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>Task Settings</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Assignee</Label>
            <Select
              value={formData.assigneeId}
              onChange={(e) => handleInputChange("assigneeId", e.target.value)}
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormGroup>
        </FormGrid>
        <FormGrid>
          <FormGroup>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
            {errors.dueDate && <ErrorText>{errors.dueDate}</ErrorText>}
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label>Estimated Hours</Label>
          <Input
            type="number"
            value={formData.estimatedHours}
            onChange={(e) =>
              handleInputChange("estimatedHours", e.target.value)
            }
            placeholder="8"
            min="0"
            step="0.5"
          />
          {errors.estimatedHours && (
            <ErrorText>{errors.estimatedHours}</ErrorText>
          )}
          <HelperText>Estimated time to complete this task</HelperText>
        </FormGroup>
        <FormGroup>
          <Label>Tags</Label>
          <Input
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            placeholder="frontend, bug-fix, urgent"
          />
          <HelperText>Comma-separated tags for task categorization</HelperText>
        </FormGroup>
      </FormSection>
    </FormModal>
  );
};
