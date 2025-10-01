// src/app/dashboard/projects/new/NewProjectPageClient.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  TextArea,
  FormGroup,
  Label,
  HelperText,
  ErrorText,
} from "@/components/ui";
import { Title, Stepper, Step } from "./style.jsx";
import { useRouter } from "next/navigation";
import { intakeFormSteps } from "@/data/forms/clientIntakeForm.data";
import { FiArrowLeft, FiArrowRight, FiSend } from "react-icons/fi";

/**
 * Validates a set of fields for the current step.
 *
 * @param {Object} values - Current form values keyed by field id.
 * @param {Array} fields - Field definitions for the active step.
 * @returns {Object} Field level error messages keyed by field id.
 */
function validateStep(values, fields) {
  return fields.reduce((accumulator, field) => {
    if (field.required && !values[field.id]) {
      return { ...accumulator, [field.id]: "This field is required." };
    }
    return accumulator;
  }, {});
}

/**
 * Initializes form values using the intake step definition.
 *
 * @returns {Record<string, string|boolean>} Initial state object.
 */
function getInitialValues() {
  const base = {};
  intakeFormSteps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.type === "checkbox") {
        base[field.id] = false;
      } else {
        base[field.id] = "";
      }
    });
  });
  return base;
}

/**
 * NewProjectPageClient
 * Client island for submitting new project intake requests.
 * @returns {JSX.Element}
 */
export default function NewProjectPageClient() {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [values, setValues] = useState(() => getInitialValues());

  // Hydrate from localStorage when available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("newProjectDraft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setValues((prev) => ({ ...prev, ...parsed }));
      }
    } catch (storageError) {
      console.warn("Unable to read saved intake draft", storageError);
    }
  }, []);

  // Persist draft to localStorage for resilience
  useEffect(() => {
    try {
      localStorage.setItem("newProjectDraft", JSON.stringify(values));
    } catch (storageError) {
      console.warn("Unable to persist intake draft", storageError);
    }
  }, [values]);

  const activeStep = intakeFormSteps[activeStepIndex];
  const isLastStep = activeStepIndex === intakeFormSteps.length - 1;

  const canProceed = useMemo(() => {
    const { fields } = activeStep;
    return fields.every((field) => !field.required || Boolean(values[field.id]));
  }, [activeStep, values]);

  function handleInputChange(fieldId, newValue) {
    setValues((prev) => ({ ...prev, [fieldId]: newValue }));
    setFieldErrors((prev) => ({ ...prev, [fieldId]: undefined }));
  }

  function goToPreviousStep() {
    setError("");
    if (activeStepIndex === 0) return;
    setActiveStepIndex((prev) => prev - 1);
  }

  function goToNextStep() {
    setError("");
    const validationErrors = validateStep(values, activeStep.fields);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setActiveStepIndex((prev) => Math.min(prev + 1, intakeFormSteps.length - 1));
  }

  async function handleSubmit() {
    setError("");
    const validationErrors = validateStep(values, activeStep.fields);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/requests/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        throw new Error(message?.error || "Failed to submit intake request");
      }

      localStorage.removeItem("newProjectDraft");
      router.push("/dashboard/projects?submitted=1");
    } catch (submissionError) {
      setError(submissionError.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(field) {
    const sharedProps = {
      id: field.id,
      name: field.id,
      value: values[field.id],
      onChange: (event) => handleInputChange(field.id, event.target.value),
    };

    switch (field.type) {
      case "textarea":
        return <TextArea {...sharedProps} rows={4} placeholder={field.placeholder} />;
      case "select":
        return (
          <Select {...sharedProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      case "text":
      default:
        return <Input {...sharedProps} placeholder={field.placeholder} />;
    }
  }

  return (
    <ClientDashboardLayout>
      <div>
        <Title>Project Intake</Title>
        <Stepper aria-label="Intake steps">
          {intakeFormSteps.map((step, index) => (
            <Step key={step.id} $active={index === activeStepIndex}>
              {index + 1}. {step.title}
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent>
            <h2 style={{ marginBottom: "0.75rem" }}>{activeStep.title}</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>{activeStep.description}</p>

            {activeStep.fields.map((field) => (
              <FormGroup key={field.id}>
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                {renderField(field)}
                {field.helper && <HelperText>{field.helper}</HelperText>}
                {fieldErrors[field.id] && <ErrorText>{fieldErrors[field.id]}</ErrorText>}
              </FormGroup>
            ))}

            {error && <ErrorText>{error}</ErrorText>}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1.5rem",
              }}
            >
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={activeStepIndex === 0 || submitting}
              >
                <FiArrowLeft /> Back
              </Button>

              {isLastStep ? (
                <Button onClick={handleSubmit} disabled={submitting || !canProceed}>
                  <FiSend /> {submitting ? "Submitting..." : "Submit request"}
                </Button>
              ) : (
                <Button onClick={goToNextStep} disabled={!canProceed || submitting}>
                  Next <FiArrowRight />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}

/** @module dashboard/projects/new/NewProjectPageClient */
