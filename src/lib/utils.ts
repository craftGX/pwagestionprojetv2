import type { ProjectWithSessions } from "@/app/page";

// --- utilitaire shadcn : fusion de classes Tailwind ---
export function cn(...inputs: Array<string | undefined | null | false>) {
  return inputs.filter(Boolean).join(" ");
}

// localStorage clé unique pour v2
const STORAGE_KEY = "projets_v2";

export function formatFrenchDate(dateStr: string): string {
  if (!dateStr) return "";
  // dateStr est attendu au format "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map((v) => Number(v));
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function computeProjectStats(project: ProjectWithSessions): string {
  const sessions = project.sessions || [];
  if (!sessions.length) return "";
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duree || 0), 0);
  const avgDifficulty = sessions.reduce((acc, s) => acc + (s.difficulte || 0), 0) / sessions.length;
  return `Total: ${totalMinutes} min • Difficulté moyenne: ${avgDifficulty.toFixed(1)}/10`;
}

export function loadProjectsFromLocalStorage(): {
  projects: ProjectWithSessions[];
  compact: boolean;
} {
  if (typeof window === "undefined") {
    return { projects: [], compact: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { projects: [], compact: false };
    }
    const parsed = JSON.parse(raw) as {
      projects?: ProjectWithSessions[];
      compact?: boolean;
    };
    return {
      projects: parsed.projects ?? [],
      compact: parsed.compact ?? false,
    };
  } catch {
    return { projects: [], compact: false };
  }
}

export function saveProjectsToLocalStorage(projects: ProjectWithSessions[], compact: boolean) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ projects, compact });
  window.localStorage.setItem(STORAGE_KEY, payload);
}
