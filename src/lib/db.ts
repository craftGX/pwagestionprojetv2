"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { ProjectWithSessions, Session } from "@/app/page";

const DB_NAME = "projetsSessionsDB";
const DB_VERSION = 1;
const STORE_PROJECTS = "projects";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          const store = db.createObjectStore(STORE_PROJECTS, {
            keyPath: "id",
          });
          store.createIndex("by-name", "nom", { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

// Enregistrer un projet complet
export async function saveProjectToIndexedDB(project: ProjectWithSessions) {
  if (typeof window === "undefined") return;
  const db = await getDB();
  await db.put(STORE_PROJECTS, project);
}

// Supprimer un projet
export async function deleteProjectFromIndexedDB(id: number) {
  if (typeof window === "undefined") return;
  const db = await getDB();
  await db.delete(STORE_PROJECTS, id);
}

// Ajouter une session à un projet existant
export async function saveSessionToIndexedDB(projectId: number, session: Session) {
  if (typeof window === "undefined") return;
  const db = await getDB();
  const project = (await db.get(STORE_PROJECTS, projectId)) as ProjectWithSessions | undefined;
  if (!project) return;
  project.sessions = project.sessions || [];
  project.sessions.push(session);
  await db.put(STORE_PROJECTS, project);
}

// (Optionnel) charger tous les projets depuis IndexedDB
export async function loadProjectsFromIndexedDB(): Promise<ProjectWithSessions[]> {
  if (typeof window === "undefined") return [];
  const db = await getDB();
  return (await db.getAll(STORE_PROJECTS)) as ProjectWithSessions[];
}
