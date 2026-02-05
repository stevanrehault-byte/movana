"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Vehicle {
  id: string; name: string; slug: string; vehicle_type: string; status: string;
  stock: number; price_full_day: number; currency: string; cover_url: string;
  brand: string; model: string; vehicle_condition: string; is_featured: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  available: { bg: "rgba(104,181,155,0.15)", text: "#2d8a6e" },
  rented: { bg: "rgba(59,118,137,0.15)", text: "#3B7689" },
  maintenance: { bg: "rgba(232,184,109,0.2)", text: "#b8860b" },
  retired: { bg: "rgba(94,114,110,0.15)", text: "#5E726E" },
};

export default function FleetPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/vehicles", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setVehicles(d.vehicles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>Fleet</h1>
          <p className="mt-1" style={{ color: "var(--secondary-text)" }}>Manage your vehicles and inventory</p>
        </div>
        <a href="/dashboard/fleet/new" className="bg-gradient-movana flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white">
          + Add vehicle
        </a>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {["available", "rented", "maintenance", "retired"].map(s => {
          const count = vehicles.filter(v => v.status === s).length;
          const c = STATUS_COLORS[s];
          return (
            <div key={s} className="rounded-xl p-4" style={{ backgroundColor: c.bg }}>
              <p className="text-2xl font-bold" style={{ color: c.text }}>{count}</p>
              <p className="text-xs font-medium capitalize" style={{ color: c.text }}>{s}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p style={{ color: "var(--secondary-text)" }}>Loading...</p>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
          <p className="mb-6 text-lg" style={{ color: "var(--dark)" }}>No vehicles yet</p>
          <a href="/dashboard/fleet/new" className="bg-gradient-movana inline-block rounded-xl px-6 py-3 font-semibold text-white">
            Add your first vehicle
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map(v => {
            const sc = STATUS_COLORS[v.status] || STATUS_COLORS.available;
            return (
              <div key={v.id} className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
                <div className="h-40 bg-gray-100" style={{ backgroundImage: v.cover_url ? `url(${v.cover_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                  {v.is_featured && (
                    <span className="m-3 inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: "var(--teal-deep)" }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-outfit font-semibold" style={{ color: "var(--dark)" }}>{v.name}</h3>
                      <p className="text-xs" style={{ color: "var(--secondary-text)" }}>{v.brand} {v.model}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold capitalize" style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {v.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-outfit text-lg font-bold" style={{ color: "var(--teal-deep)" }}>
                      {v.price_full_day ? `${v.price_full_day} ${v.currency}/day` : "—"}
                    </p>
                    <span className="text-xs" style={{ color: "var(--secondary-text)" }}>Stock: {v.stock}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
