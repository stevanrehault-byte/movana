"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Route {
  id: string;
  title: string;
  slug: string;
  status: string;
  difficulty: string;
  distance_km: number;
  duration_minutes: number;
  avg_rating: number;
  total_views: number;
  cover_url: string;
  created_at: string;
}

function PlusIcon() {
  return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: "rgba(94,114,110,0.1)", text: "var(--secondary-text)" },
    published: { bg: "rgba(104,181,155,0.15)", text: "var(--teal-deep)" },
    archived: { bg: "rgba(224,122,95,0.1)", text: "var(--coral)" },
  };
  const c = colors[status] || colors.draft;
  return (
    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function RoutesPage() {
  const { token } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/routes/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setRoutes(data.routes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>Routes</h1>
          <p className="mt-1" style={{ color: "var(--secondary-text)" }}>Manage your cycling experiences</p>
        </div>
        <a
          href="/dashboard/routes/new"
          className="bg-gradient-movana flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          <PlusIcon /> New route
        </a>
      </div>

      {loading ? (
        <p style={{ color: "var(--secondary-text)" }}>Loading...</p>
      ) : routes.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-12 text-center"
          style={{ boxShadow: "0 2px 12px rgba(59,118,137,0.06)", border: "1px solid rgba(59,118,137,0.08)" }}
        >
          <p className="mb-2 text-lg font-medium" style={{ color: "var(--dark)" }}>No routes yet</p>
          <p className="mb-6" style={{ color: "var(--secondary-text)" }}>Create your first route to get started</p>
          <a
            href="/dashboard/routes/new"
            className="bg-gradient-movana inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white"
          >
            <PlusIcon /> Create route
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center gap-6 rounded-2xl bg-white p-4 transition-all hover:shadow-md"
              style={{ border: "1px solid rgba(59,118,137,0.08)" }}
            >
              <div
                className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                style={{ backgroundImage: route.cover_url ? `url(${route.cover_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-outfit text-lg font-semibold" style={{ color: "var(--dark)" }}>
                    {route.title}
                  </h3>
                  <StatusBadge status={route.status} />
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm" style={{ color: "var(--secondary-text)" }}>
                  <span>{route.difficulty}</span>
                  {route.distance_km && <span>{route.distance_km} km</span>}
                  {route.duration_minutes && <span>{route.duration_minutes} min</span>}
                  <span>{route.total_views} views</span>
                </div>
              </div>
              <a
                href={`/dashboard/routes/${route.id}`}
                className="rounded-xl border-2 px-5 py-2 text-sm font-semibold transition-all hover:bg-[var(--teal-deep)] hover:text-white"
                style={{ color: "var(--teal-deep)", borderColor: "var(--teal-deep)" }}
              >
                Edit
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
