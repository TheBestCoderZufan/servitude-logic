// src/app/dashboard/projects/new/NewProjectPageClient.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui/dashboard";
import { intakeFormSteps } from "@/data/forms/clientIntakeForm.data";
import { FiArrowLeft, FiArrowRight, FiSend } from "react-icons/fi";
import { useRouter } from "next/navigation";

/**
 * Validates a set of fields for the current step.
 *
 * @param {Record<string, string|boolean>} values - Current form values keyed by field id.
 * @param {Array} fields - Field definitions for the active step.
 * @returns {Record<string, string>} Field level error messages keyed by field id.
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
      base[field.id] = field.type === "checkbox" ? false : "";
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
        return <Textarea {...sharedProps} rows={4} placeholder={field.placeholder} />;
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
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              id={field.id}
              name={field.id}
              type="checkbox"
              checked={Boolean(values[field.id])}
              onChange={(event) => handleInputChange(field.id, event.target.checked)}
              className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-ring"
            />
            {field.placeholder ? (
              <span className="text-sm text-muted">{field.placeholder}</span>
            ) : null}
          </div>
        );
      case "text":
      default:
        return <Input {...sharedProps} placeholder={field.placeholder} />;
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Project Intake</h1>
        <p className="text-sm text-muted">
          Share project details so our team can scope, staff, and kickoff quickly.
        </p>
      </header>

      <nav
        className="flex flex-wrap gap-3"
        aria-label="Intake steps"
      >
        {intakeFormSteps.map((step, index) => (
          <span
            key={step.id}
            className={
              index === activeStepIndex
                ? "rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                : "rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted"
            }
          >
            {index + 1}. {step.title}
          </span>
        ))}
      </nav>

      <Card className="rounded-3xl">
        <CardContent className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">{activeStep.title}</h2>
            <p className="text-sm text-muted">{activeStep.description}</p>
          </div>

          <div className="space-y-6">
            {activeStep.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                {renderField(field)}
                {field.helper ? (
                  <p className="text-xs text-muted">{field.helper}</p>
                ) : null}
                {fieldErrors[field.id] ? (
                  <p className="text-xs font-semibold text-error">{fieldErrors[field.id]}</p>
                ) : null}
              </div>
            ))}
          </div>

          {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousStep}
              disabled={activeStepIndex === 0 || submitting}
              className="rounded-lg sm:w-auto"
            >
              <FiArrowLeft aria-hidden className="mr-2" /> Back
            </Button>

            {isLastStep ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || !canProceed}
                className="rounded-lg sm:w-auto"
              >
                <FiSend aria-hidden className="mr-2" />
                {submitting ? "Submitting..." : "Submit request"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={goToNextStep}
                disabled={!canProceed || submitting}
                className="rounded-lg sm:w-auto"
              >
                Next <FiArrowRight aria-hidden className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** @module dashboard/projects/new/NewProjectPageClient */
