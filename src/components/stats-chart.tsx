"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ProjectWithSessions } from "@/app/page";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Durée (min)",
          data: project.sessions.map((s) => s.duree),
          borderColor: "rgba(79, 70, 229, 1)", // violet
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 4,
        },
        {
          label: "Difficulté",
          data: project.sessions.map((s) => s.difficulte),
          borderColor: "rgba(248, 113, 113, 1)", // rouge léger
          backgroundColor: "rgba(248, 113, 113, 0.1)",
          tension: 0.3,
          fill: false,
          yAxisID: "y1",
          pointRadius: 3,
          pointHoverRadius: 4,
        },
      ],
    }),
    [labels, project.sessions],
  );

  const options = useMemo(
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
        mode: "index" as const,
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
        y: {
          type: "linear" as const,
          position: "left" as const,
          grid: { color: "rgba(148,163,184,0.25)" },
          ticks: {
            font: { size: 10 },
          },
        },
        y1: {
          type: "linear" as const,
          position: "right" as const,
          grid: { drawOnChartArea: false },
          ticks: {
            font: { size: 10 },
            stepSize: 1,
          },
          min: 0,
          max: 10,
        },
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          hitRadius: 10,
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
