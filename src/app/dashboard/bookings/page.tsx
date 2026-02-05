"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Booking {
  id: string; reference: string; status: string; customer_name: string; customer_email: string;
  vehicle_display_name: string; start_date: string; end_date: string; total: number; currency: string;
  payment_status: string; created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", ready: "#8b5cf6", delivered: "#06b6d4",
  active: "#22c55e", completed: "#6b7280", cancelled: "#ef4444", no_show: "#374151",
};

export default function BookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [counts, setCounts] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookings = (status?: string) => {
    if (!token) return;
    const url = status ? `/api/bookings?status=${status}` : "/api/bookings";
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setCounts(d.counts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(filter || undefined); }, [token, filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchBookings(filter || undefined);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>Bookings</h1>
        <p className="mt-1" style={{ color: "var(--secondary-text)" }}>Manage reservations and rentals</p>
      </div>

      {/* Status filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter("")}
          className="rounded-full px-4 py-2 text-xs font-semibold transition-all"
          style={{ backgroundColor: !filter ? "var(--teal-deep)" : "rgba(0,0,0,0.05)", color: !filter ? "white" : "var(--secondary-text)" }}>
          All ({counts.reduce((s: number, c: any) => s + parseInt(c.count), 0)})
        </button>
        {["pending","confirmed","active","completed","cancelled"].map(s => {
          const c = counts.find((x: any) => x.status === s);
          return (
            <button key={s} onClick={() => setFilter(s)}
              className="rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all"
              style={{ backgroundColor: filter === s ? STATUS_COLORS[s] : "rgba(0,0,0,0.05)", color: filter === s ? "white" : "var(--secondary-text)" }}>
              {s} ({c?.count || 0})
            </button>
          );
        })}
      </div>

      {loading ? <p>Loading...</p> : bookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
          <p style={{ color: "var(--secondary-text)" }}>No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-2xl bg-white p-4" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-outfit font-bold" style={{ color: "var(--teal-deep)" }}>{b.reference}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize text-white" style={{ backgroundColor: STATUS_COLORS[b.status] || "#666" }}>
                    {b.status}
                  </span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: b.payment_status === "paid" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: b.payment_status === "paid" ? "#16a34a" : "#d97706" }}>
                    {b.payment_status}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--dark)" }}>
                  <strong>{b.customer_name}</strong> — {b.vehicle_display_name}
                </p>
                <p className="text-xs" style={{ color: "var(--secondary-text)" }}>
                  {b.start_date} → {b.end_date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-outfit text-lg font-bold" style={{ color: "var(--dark)" }}>{b.total} {b.currency}</p>
              </div>
              <div className="flex gap-1">
                {b.status === "pending" && (
                  <button onClick={() => updateStatus(b.id, "confirmed")} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "#3b82f6" }}>Confirm</button>
                )}
                {["pending","confirmed"].includes(b.status) && (
                  <button onClick={() => updateStatus(b.id, "cancelled")} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ color: "#ef4444" }}>Cancel</button>
                )}
                {b.status === "confirmed" && (
                  <button onClick={() => updateStatus(b.id, "active")} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "#22c55e" }}>Start</button>
                )}
                {b.status === "active" && (
                  <button onClick={() => updateStatus(b.id, "completed")} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "#6b7280" }}>Complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
