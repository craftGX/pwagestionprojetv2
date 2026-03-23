"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProjectList, { Project } from "@/components/project-list";
import ProjectDetail from "@/components/project-detail";
import PreferencesToggle from "@/components/preferences-toggle";
import { Separator } from "@/components/ui/separator";
import { loadProjectsFromLocalStorage, saveProjectsToLocalStorage } from "@/lib/utils";
import {
  saveProjectToIndexedDB,
  deleteProjectFromIndexedDB,
  saveSessionToIndexedDB,
} from "@/lib/db";

export type Session = {
  id: number;
  date: string;
  duree: number;
  langage: string | null;
  framework: string | null;
  amelioration: string | null;
  remarque: string | null;
  difficulte: number;
};

export type ProjectWithSessions = Project & { sessions: Session[] };

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectWithSessions[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [preferenceCompact, setPreferenceCompact] = useState<boolean>(false);

  // Charger depuis localStorage
  useEffect(() => {
    const { projects: storedProjects, compact } = loadProjectsFromLocalStorage();
    setProjects(storedProjects);
    setPreferenceCompact(compact);
  }, []);

  // Sauvegarde sur chaque changement
  useEffect(() => {
    saveProjectsToLocalStorage(projects, preferenceCompact);
  }, [projects, preferenceCompact]);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId) || null,
    [projects, currentProjectId],
  );

  const handleCreateProject = async (nom: string, dateCreation: string) => {
    const exists = projects.some((p) => p.nom.toLowerCase() === nom.toLowerCase());
    if (exists) {
      throw new Error("EXISTS");
    }
    const newProject: ProjectWithSessions = {
      id: Date.now(),
      nom,
      dateCreation,
      sessions: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    await saveProjectToIndexedDB(newProject);
  };

  const handleDeleteProject = async (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
    }
    await deleteProjectFromIndexedDB(id);
  };

  const handleClearAll = () => {
    if (typeof window === "undefined") return;
    if (!confirm("Supprimer tous les projets et sessions ?")) return;
    setProjects([]);
    setCurrentProjectId(null);
    localStorage.removeItem("projets_v2");
  };

  const handleAddSession = async (projectId: number, session: Omit<Session, "id">) => {
    const created: Session = { ...session, id: Date.now() };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, sessions: [...(p.sessions || []), created] } : p,
      ),
    );
    await saveSessionToIndexedDB(projectId, created);
  };

  const handleSelectProject = (id: number) => {
    setCurrentProjectId(id);
  };

  const handleToggleCompact = (value: boolean) => {
    setPreferenceCompact(value);
  };

  return (
    <main className="app-layout">
      <motion.div
        className="app-grid"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Colonne gauche */}
        <motion.section
          className="app-card"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="app-card-title">Projets</h1>
              <p className="app-card-subtitle">
                Crée un projet, sélectionne-le, puis enregistre tes sessions.
              </p>
            </div>
            <PreferencesToggle value={preferenceCompact} onChange={handleToggleCompact} />
          </div>

          <ProjectList
            projects={projects}
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
            onClearAll={handleClearAll}
            currentProjectId={currentProjectId}
          />
        </motion.section>

        {/* Colonne droite */}
        <motion.section
          className="app-card"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <ProjectDetail
            project={currentProject}
            onAddSession={handleAddSession}
            onDeleteProject={handleDeleteProject}
            calendarDays={[]} // plus utilisé, mais gardé dans le type pour compat
          />
          <Separator className="my-3" />
          {/* Tu peux ajouter ici d'autres éléments utiles plus tard */}
        </motion.section>
      </motion.div>
    </main>
  );
}
