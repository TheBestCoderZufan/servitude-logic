// src/components/ProjectSelector/ProjectSelector.jsx
"use client";
import { useMemo } from "react";
import { useProject } from "@/providers/ProjectProvider";
import { SelectorWrap, Label, SelectEl } from "./ProjectSelector.style.jsx";

export default function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, loading } =
    useProject();

  const options = useMemo(() => {
    const base = [{ id: "all", name: "All Projects" }];
    return base.concat(projects.map((p) => ({ id: p.id, name: p.name })));
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
      <SelectorWrap>
        <Label>Project:</Label>
        <SelectEl disabled>
          <option>Loading...</option>
        </SelectEl>
      </SelectorWrap>
    );
  }

  // Optionally hide selector if only a single project
  const shouldHide = projects.length <= 0;
  if (shouldHide) return null;

  return (
    <SelectorWrap>
      <Label>Project:</Label>
      <SelectEl
        aria-label="Select project"
        value={selectedProjectId || "all"}
        onChange={(e) => setSelectedProjectId(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </SelectEl>
    </SelectorWrap>
  );
}
