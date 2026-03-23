"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/app/page";
import { formatFrenchDate } from "@/lib/utils";

type Props = {
  sessions: Session[];
};

function getSessionColor(diff: number) {
  if (diff >= 1 && diff <= 5) return "border-green-400 bg-emerald-50";
  if (diff >= 6 && diff <= 7) return "border-amber-400 bg-amber-50";
  if (diff >= 8 && diff <= 10) return "border-red-400 bg-red-50";
  return "border-slate-200 bg-white";
}

export default function SessionAccordion({ sessions }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-800">Toutes les sessions du projet</div>
        <Badge variant="secondary" className="text-[11px]">
          {sessions.length} {sessions.length > 1 ? "sessions" : "session"}
        </Badge>
      </div>

      {sessions.length === 0 ? (
        <div className="text-xs italic text-slate-400">
          Aucune session enregistrée pour ce projet.
        </div>
      ) : (
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {sessions.map((s, index) => {
            const isOpen = openIndex === index;
            const color = getSessionColor(s.difficulte || 0);

            return (
              <div key={s.id} className={`rounded-xl border text-xs ${color}`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-semibold">Session {index + 1}</span>
                    <span className="text-[11px] text-slate-600">
                      {formatFrenchDate(s.date)} • {s.duree} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-700">Diff {s.difficulte}/10</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px]">
                      {isOpen ? "-" : "+"}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
                    {s.langage && (
                      <div className="mb-0.5">
                        <span className="font-semibold">Langage(s) :</span> {s.langage}
                      </div>
                    )}
                    {s.framework && (
                      <div className="mb-0.5">
                        <span className="font-semibold">Framework(s) :</span> {s.framework}
                      </div>
                    )}
                    {s.amelioration && (
                      <div className="mb-0.5">
                        <span className="font-semibold">Améliorations :</span> {s.amelioration}
                      </div>
                    )}
                    {s.remarque && (
                      <div className="mb-0.5">
                        <span className="font-semibold">Remarques :</span> {s.remarque}
                      </div>
                    )}
                    {!s.langage && !s.framework && !s.amelioration && !s.remarque && (
                      <div>Aucun détail supplémentaire.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
