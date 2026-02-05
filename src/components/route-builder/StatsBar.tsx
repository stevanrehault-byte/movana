"use client";

import { RouteStats } from "./RouteBuilder";

export function StatsBar({ stats }: { stats: RouteStats }) {
  return (
    <div
      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-6 rounded-2xl bg-white/95 px-6 py-3 backdrop-blur"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      <Stat icon="📏" label="Distance" value={stats.distance > 0 ? `${stats.distance} km` : "—"} />
      <div className="h-8 w-px" style={{ backgroundColor: "rgba(59,118,137,0.15)" }} />
      <Stat icon="⏱" label="Duration" value={stats.duration > 0 ? formatDuration(stats.duration) : "—"} />
      <div className="h-8 w-px" style={{ backgroundColor: "rgba(59,118,137,0.15)" }} />
      <Stat icon="⛰" label="Elevation" value={stats.elevationGain > 0 ? `${stats.elevationGain}m` : "—"} />
      <div className="h-8 w-px" style={{ backgroundColor: "rgba(59,118,137,0.15)" }} />
      <Stat icon="📍" label="Points" value={String(stats.pointCount)} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs" style={{ color: "var(--secondary-text)" }}>
        {icon} {label}
      </p>
      <p className="font-outfit text-base font-bold" style={{ color: "var(--dark)" }}>{value}</p>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}
