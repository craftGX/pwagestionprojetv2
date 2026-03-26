"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SessionAccordion from "./session-accordion";
import StatsChart from "./stats-chart";
import type { ProjectWithSessions, Session, Idea } from "@/app/page";
import { formatFrenchDate, computeProjectStats } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  project: ProjectWithSessions | null;
  onAddSession: (projectId: number, session: Omit<Session, "id">) => Promise<void>;
  onDeleteProject: (projectId: number) => Promise<void>;
  calendarDays: { date: string; label: string }[];
  onUpdateIdeas: (projectId: number, ideas: Idea[]) => void;
};

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ProjectDetail({
  project,
  onAddSession,
  onDeleteProject,
  onUpdateIdeas,
}: Props) {
  const [sessionDate, setSessionDate] = useState<string>(() => getTodayString());
  const [sessionDuree, setSessionDuree] = useState("");
  const [sessionLangage, setSessionLangage] = useState("");
  const [sessionFramework, setSessionFramework] = useState("");
  const [sessionAmelioration, setSessionAmelioration] = useState("");
  const [sessionRemarque, setSessionRemarque] = useState("");
  const [sessionDifficulte, setSessionDifficulte] = useState("");
  const [loading, setLoading] = useState(false);

  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState("");

  const sessions = project?.sessions ?? [];
  const ideas: Idea[] = project?.ideas ?? [];

  const lastSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions[sessions.length - 1];
  }, [sessions]);

  const statsLabel = project ? computeProjectStats(project) : "";

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) {
      toast.error("Sélectionne d'abord un projet.");
      return;
    }

    if (!sessionDate || !sessionDuree || !sessionDifficulte) {
      toast.error("Merci de remplir au minimum la date, la durée et la difficulté.");
      return;
    }

    setLoading(true);
    try {
      await onAddSession(project.id, {
        date: sessionDate,
        duree: Number(sessionDuree),
        langage: sessionLangage.trim() || null,
        framework: sessionFramework.trim() || null,
        amelioration: sessionAmelioration.trim() || null,
        remarque: sessionRemarque.trim() || null,
        difficulte: Number(sessionDifficulte),
      });

      setSessionDate(getTodayString());
      setSessionDuree("");
      setSessionLangage("");
      setSessionFramework("");
      setSessionAmelioration("");
      setSessionRemarque("");
      setSessionDifficulte("");

      toast.success("Session enregistrée pour ce projet.");
    } catch {
      toast.error("Erreur lors de l'enregistrement de la session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;
    await onDeleteProject(project.id);
    toast("Projet supprimé.");
  };

  // Idées (todo)
  const handleAddIdea = () => {
    if (!project) return;
    if (!newIdeaText.trim()) return;

    const newIdea: Idea = {
      id: Date.now(),
      text: newIdeaText.trim(),
      done: false,
    };
    onUpdateIdeas(project.id, [...ideas, newIdea]);
    setNewIdeaText("");
  };

  const handleToggleIdea = (id: number) => {
    if (!project) return;
    const updated = ideas.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    onUpdateIdeas(project.id, updated);
  };

  const handleDeleteIdea = (id: number) => {
    if (!project) return;
    const updated = ideas.filter((i) => i.id !== id);
    onUpdateIdeas(project.id, updated);
  };

  if (!project) {
    return (
      <div className="text-xs italic text-slate-400">
        Aucun projet sélectionné. Clique sur un projet dans la liste de gauche.
      </div>
    );
  }

  const last = lastSession;

  return (
    <div className="space-y-3">
      {/* En-tête projet + boutons */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {project.nom}
          </div>
          <div className="text-[11px] text-slate-500 sm:text-xs">
            Créé le {formatFrenchDate(project.dateCreation)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button
            size="sm"
            type="button"
            className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
            onClick={() => setIsIdeasOpen(true)}
          >
            Nouvelles idées
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="btn-primary-violet rounded-full px-3 py-1 text-[11px]"
                type="button"
              >
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border border-slate-200 shadow-xl sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cela supprimera le projet <span className="font-semibold">{project.nom}</span> et
                  toutes ses sessions. Action définitive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="btn-primary-violet text-white"
                  onClick={handleDeleteConfirm}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Infos + stats */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className="w-fit border-indigo-200 text-[10px] text-indigo-700 sm:text-[11px]"
          >
            ID: #{project.id}
          </Badge>
          <span className="text-[10px] text-slate-500 sm:text-[11px]">{statsLabel}</span>
        </div>
        <div className="text-[10px] text-slate-500 sm:text-[11px]">
          {ideas.length} {ideas.length > 1 ? "idées" : "idée"} en attente
        </div>
      </div>

      {/* Graphique */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
        <StatsChart project={project} />
      </div>

      <hr className="my-2 border-dashed border-slate-200" />

      {/* Formulaire nouvelle session (ton code d'origine, juste recollé) */}
      <div>
        <div className="mb-1 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
          Nouvelle session
        </div>
        <div className="mb-2 text-[10px] text-slate-500 sm:text-[11px]">
          Renseigne la session de travail pour <span className="font-medium">{project.nom}</span>.
        </div>

        <form onSubmit={handleSubmitSession} className="space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Date de la session</label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Durée (en minutes)</label>
              <Input
                type="number"
                min={1}
                max={1440}
                value={sessionDuree}
                onChange={(e) => setSessionDuree(e.target.value)}
                required
                placeholder="Ex: 60"
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Langage(s) utilisé(s)</label>
              <Input
                value={sessionLangage}
                onChange={(e) => setSessionLangage(e.target.value)}
                placeholder="Ex: JavaScript, TypeScript"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Framework(s)</label>
              <Input
                value={sessionFramework}
                onChange={(e) => setSessionFramework(e.target.value)}
                placeholder="Ex: React, Next.js"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Améliorations à apporter</label>
            <Textarea
              value={sessionAmelioration}
              onChange={(e) => setSessionAmelioration(e.target.value)}
              placeholder="Ce que tu veux améliorer sur le projet après cette session"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Remarques utiles</label>
            <Textarea
              value={sessionRemarque}
              onChange={(e) => setSessionRemarque(e.target.value)}
              placeholder="Bug rencontré, idée à tester, ressource intéressante..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Difficulté ressentie (sur 10)
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={sessionDifficulte}
              onChange={(e) => setSessionDifficulte(e.target.value)}
              required
              placeholder="Ex: 7"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              className="btn-primary-violet rounded-full px-4 py-1.5 text-xs font-semibold"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Valider la session"}
            </Button>
          </div>
        </form>
      </div>

      {/* Dernière session */}
      {last && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Dernière session enregistrée</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700">
              {project.nom}
            </span>
          </div>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Date :</span> {formatFrenchDate(last.date)}
            </div>
            <div>
              <span className="font-medium">Durée :</span> {last.duree} min
            </div>
            {last.langage && (
              <div>
                <span className="font-medium">Langage(s) :</span> {last.langage}
              </div>
            )}
            {last.framework && (
              <div>
                <span className="font-medium">Framework(s) :</span> {last.framework}
              </div>
            )}
            {last.difficulte != null && (
              <div>
                <span className="font-medium">Difficulté :</span> {last.difficulte}/10
              </div>
            )}
            {last.amelioration && (
              <div>
                <span className="font-medium">Améliorations :</span> {last.amelioration}
              </div>
            )}
            {last.remarque && (
              <div>
                <span className="font-medium">Remarques :</span> {last.remarque}
              </div>
            )}
          </div>
        </div>
      )}

      <SessionAccordion sessions={sessions} />

      {/* Modale idées */}
      {isIdeasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                Idées pour la prochaine session
              </h2>
              <button
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setIsIdeasOpen(false)}
              >
                Fermer
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="text"
                className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                placeholder="Nouvelle idée (ex: tester une nouvelle lib...)"
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIdea();
                  }
                }}
              />
              <button
                type="button"
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                onClick={handleAddIdea}
              >
                Ajouter
              </button>
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {ideas.length === 0 && (
                <p className="text-[11px] text-slate-400">
                  Pas encore d’idées. Ajoute quelque chose à préparer pour la prochaine session.
                </p>
              )}

              {ideas.map((idea) => (
                <label
                  key={idea.id}
                  className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={idea.done}
                      onChange={() => handleToggleIdea(idea.id)}
                    />
                    <span
                      className={`text-[11px] ${
                        idea.done ? "line-through text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {idea.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] text-slate-400 hover:text-red-500"
                    onClick={() => handleDeleteIdea(idea.id)}
                  >
                    Suppr.
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
