// src/providers/ProjectProvider.js
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ProjectContext = createContext({
  selectedProjectId: "all",
  setSelectedProjectId: () => {},
  projects: [],
  selectedProject: null,
});

export function ProjectProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize from URL or localStorage
  useEffect(() => {
    const fromUrl = searchParams?.get("projectId");
    const stored = typeof window !== "undefined" ? localStorage.getItem("projectId") : null;
    if (fromUrl) {
      setSelectedProjectId(fromUrl);
    } else if (stored) {
      setSelectedProjectId(stored);
    } else {
      setSelectedProjectId("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && selectedProjectId) {
      localStorage.setItem("projectId", selectedProjectId);
    }
  }, [selectedProjectId]);

  // Load projects globally for reuse
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects?limit=100`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        const list = data.projects || [];
        setProjects(list);
        // Auto-select if client has exactly one project
        const stored = typeof window !== "undefined" ? localStorage.getItem("projectId") : null;
        if (list.length === 1 && (!stored || stored === "all")) {
          setSelectedProjectId(list[0].id);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const updateProject = (projectId) => {
    const id = projectId || "all";
    setSelectedProjectId(id);
    // Update URL query param without full reload
    try {
      const url = new URL(window.location.href);
      if (id === "all") {
        url.searchParams.delete("projectId");
      } else {
        url.searchParams.set("projectId", id);
      }
      router.push(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
    } catch (e) {
      // no-op
    }
  };

  const selectedProject = useMemo(
    () => (selectedProjectId && selectedProjectId !== "all" ? projects.find((p) => p.id === selectedProjectId) || null : null),
    [selectedProjectId, projects]
  );

  const value = useMemo(
    () => ({ selectedProjectId, setSelectedProjectId: updateProject, projects, selectedProject, loading }),
    [selectedProjectId, projects, selectedProject, loading]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  return useContext(ProjectContext);
}
