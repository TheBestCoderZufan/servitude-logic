// src/components/ProjectSelector/ProjectSelector.jsx
"use client";
import { useMemo } from "react";
import { useProject } from "@/providers/ProjectProvider";
import { cn } from "@/lib/utils/cn";

export default function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, loading } =
    useProject();

  const options = useMemo(() => {
    const base = [{ id: "all", name: "All Projects" }];
    return base.concat(projects.map((p) => ({ id: p.id, name: p.name })));
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-surface/80 px-3 py-2 text-sm text-muted">
        <span className="font-medium text-muted">Project:</span>
        <select
          disabled
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted"
        >
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  if (projects.length <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-border/60 bg-surface/80 px-3 py-2 text-sm text-muted">
      <span className="font-medium text-muted">Project:</span>
      <select
        aria-label="Select project"
        value={selectedProjectId || "all"}
        onChange={(event) => setSelectedProjectId(event.target.value)}
        className={cn(
          "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        )}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
