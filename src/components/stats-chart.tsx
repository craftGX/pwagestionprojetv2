"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ProjectWithSessions } from "@/app/page";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  project: ProjectWithSessions;
};

export default function StatsChart({ project }: Props) {
  if (!project.sessions.length) {
    return (
      <p className="text-[11px] text-slate-400">
        Aucune session pour le moment. Le graphique s’affichera après l’ajout de données.
      </p>
    );
  }

  const labels = useMemo(
    () => project.sessions.map((s, index) => `S${index + 1}`),
    [project.sessions],
  );

  const data = useMemo<ChartData<"bar">>(
    () => ({
      labels,
      datasets: [
        {
          label: "Durée (min)",
          data: project.sessions.map((s) => s.duree),
          backgroundColor: "rgba(79, 70, 229, 0.7)", // violet
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
        {
          label: "Difficulté",
          data: project.sessions.map((s) => s.difficulte),
          backgroundColor: "rgba(248, 113, 113, 0.7)", // rouge
          borderColor: "rgba(248, 113, 113, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [labels, project.sessions],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            boxWidth: 10,
            font: { size: 10 },
          },
        },
        title: {
          display: false,
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(148,163,184,0.25)" },
          ticks: {
            font: { size: 10 },
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold text-slate-700">
        Vue des sessions (durée & difficulté)
      </p>
      <div className="h-40 sm:h-48">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
