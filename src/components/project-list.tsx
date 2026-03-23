"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatFrenchDate } from "@/lib/utils";
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

export type Project = {
  id: number;
  nom: string;
  dateCreation: string;
};

type Props = {
  projects: (Project & { sessions?: any[] })[];
  currentProjectId: number | null;
  onCreateProject: (nom: string, dateCreation: string) => Promise<void>;
  onSelectProject: (id: number) => void;
  onClearAll: () => void;
};

export default function ProjectList({
  projects,
  currentProjectId,
  onCreateProject,
  onSelectProject,
  onClearAll,
}: Props) {
  const [nom, setNom] = useState("");
  const [dateCreation, setDateCreation] = useState<string>(() => getTodayString());
  const [loading, setLoading] = useState(false);

  function getTodayString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !dateCreation) return;
    setLoading(true);
    try {
      await onCreateProject(nom.trim(), dateCreation);
      setNom("");
      setDateCreation(getTodayString());
      toast.success("Projet enregistré.");
    } catch (err: any) {
      if (err?.message === "EXISTS") {
        toast.error("Un projet avec ce nom existe déjà.");
      } else {
        toast.error("Erreur lors de la création du projet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearConfirm = () => {
    onClearAll();
    toast("Tous les projets ont été réinitialisés.");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Nom du projet</label>
          <Input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Suivi sessions React"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Date de création</label>
          <Input
            type="date"
            value={dateCreation}
            onChange={(e) => setDateCreation(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="rounded-full btn-primary-violet px-4 py-1.5 text-xs font-semibold"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer le projet"}
        </Button>
      </form>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Projets enregistrés</span>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-red-600"
              type="button"
            >
              Réinitialiser
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Réinitialiser tous les projets ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera tous les projets et toutes les sessions. Elle est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleClearConfirm}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ScrollArea className="scroll-area-slim">
        <div className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <div className="px-3 py-3 text-xs italic text-slate-400">
              Aucun projet pour le moment.
            </div>
          ) : (
            projects.map((p, index) => {
              const colorIndex = index % 10;
              const colorClasses = [
                "text-blue-600",
                "text-green-600",
                "text-red-700",
                "text-violet-600",
                "text-amber-600",
                "text-teal-700",
                "text-rose-700",
                "text-sky-500",
                "text-slate-700",
                "text-violet-700",
              ];
              const sessionsCount = p.sessions?.length ?? 0;
              const selected = currentProjectId === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50 ${
                    selected ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`truncate font-medium ${colorClasses[colorIndex]}`}>
                      {p.nom}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Créé le {formatFrenchDate(p.dateCreation)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-700"
                    >
                      {sessionsCount} {sessionsCount > 1 ? "sessions" : "session"}
                    </Badge>
                    <span className="text-slate-400">#{p.id}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
