"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SessionAccordion from "./session-accordion";
import StatsChart from "./stats-chart";
import type { ProjectWithSessions, Session } from "@/app/page";
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
};

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ProjectDetail({ project, onAddSession, onDeleteProject }: Props) {
  const [sessionDate, setSessionDate] = useState<string>(() => getTodayString());
  const [sessionDuree, setSessionDuree] = useState("");
  const [sessionLangage, setSessionLangage] = useState("");
  const [sessionFramework, setSessionFramework] = useState("");
  const [sessionAmelioration, setSessionAmelioration] = useState("");
  const [sessionRemarque, setSessionRemarque] = useState("");
  const [sessionDifficulte, setSessionDifficulte] = useState("");
  const [loading, setLoading] = useState(false);

  const sessions = project?.sessions ?? [];

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
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm sm:text-base font-semibold text-slate-900 truncate">
            {project.nom}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500">
            Créé le {formatFrenchDate(project.dateCreation)}
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full text-[11px] px-3 py-1 btn-primary-violet"
              type="button"
            >
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl">
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className="w-fit text-[10px] sm:text-[11px] border-indigo-200 text-indigo-700"
          >
            ID: #{project.id}
          </Badge>
          <span className="text-[10px] sm:text-[11px] text-slate-500">{statsLabel}</span>
        </div>
      </div>

      {/* Chart: repli sur mobile */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
        <StatsChart project={project} />
      </div>

      <hr className="border-dashed border-slate-200 my-2" />

      <div>
        <div className="text-[14px] sm:text-[15px] font-semibold text-slate-900 mb-1">
          Nouvelle session
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 mb-2">
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
              className="rounded-full btn-primary-violet px-4 py-1.5 text-xs font-semibold"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Valider la session"}
            </Button>
          </div>
        </form>
      </div>

      {last && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
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
    </div>
  );
}
