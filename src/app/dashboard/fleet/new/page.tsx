"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function NewVehiclePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("ebike");
  const [stock, setStock] = useState("1");
  const [priceFullDay, setPriceFullDay] = useState("");
  const [priceWeek, setPriceWeek] = useState("");
  const [priceMonth, setPriceMonth] = useState("");
  const [priceDeposit, setPriceDeposit] = useState("");
  const [batteryWh, setBatteryWh] = useState("");
  const [rangeKm, setRangeKm] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError("Name is required");
    setLoading(true);
    setError("");

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name, brand, model, vehicleType, stock: parseInt(stock) || 1,
        priceFullDay: priceFullDay ? parseFloat(priceFullDay) : null,
        priceWeek: priceWeek ? parseFloat(priceWeek) : null,
        priceMonth: priceMonth ? parseFloat(priceMonth) : null,
        priceDeposit: priceDeposit ? parseFloat(priceDeposit) : null,
        batteryWh: batteryWh ? parseInt(batteryWh) : null,
        rangeKm: rangeKm ? parseInt(rangeKm) : null,
        description, coverUrl,
      }),
    });
    const data = await res.json();
    if (res.ok) { router.push("/dashboard/fleet"); } else { setError(data.error || "Failed"); }
    setLoading(false);
  };

  const inputStyle = { borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-outfit mb-6 text-3xl font-bold" style={{ color: "var(--dark)" }}>Add vehicle</h1>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-8" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} required placeholder="e.g. Trek E-Caliber 9.6" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Type</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle}>
              {["ebike","road","mountain","gravel","city","scooter","tandem","cargo","kids","other"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Brand</label><input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Model</label><input type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Stock</label><input type="number" min="1" value={stock} onChange={e => setStock(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Price/Day (฿)</label><input type="number" step="0.01" value={priceFullDay} onChange={e => setPriceFullDay(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="500" /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Price/Week (฿)</label><input type="number" step="0.01" value={priceWeek} onChange={e => setPriceWeek(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="2800" /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Price/Month (฿)</label><input type="number" step="0.01" value={priceMonth} onChange={e => setPriceMonth(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="8000" /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Deposit (฿)</label><input type="number" step="0.01" value={priceDeposit} onChange={e => setPriceDeposit(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="3000" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Battery (Wh)</label><input type="number" value={batteryWh} onChange={e => setBatteryWh(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="500" /></div>
          <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Range (km)</label><input type="number" value={rangeKm} onChange={e => setRangeKm(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} placeholder="80" /></div>
        </div>
        <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Description</label><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} /></div>
        <div><label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Cover image URL</label><input type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={inputStyle} /></div>
        {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(224,122,95,0.1)", color: "var(--coral)" }}>{error}</div>}
        <div className="flex justify-end gap-4 pt-2">
          <a href="/dashboard/fleet" className="px-6 py-3 text-sm" style={{ color: "var(--secondary-text)" }}>Cancel</a>
          <button type="submit" disabled={loading} className="bg-gradient-movana rounded-xl px-8 py-3 font-semibold text-white disabled:opacity-50">
            {loading ? "Adding..." : "Add vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
