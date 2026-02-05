"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface Region {
  id: string;
  name: string;
  slug: string;
}

export default function NewRoutePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [regionId, setRegionId] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [elevationGain, setElevationGain] = useState("");
  const [bikeType, setBikeType] = useState("any");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        regionId: regionId || undefined,
        difficulty,
        distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        elevationGain: elevationGain ? parseInt(elevationGain) : undefined,
        bikeType,
        coverUrl: coverUrl || undefined,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/dashboard/routes");
    } else {
      setError(data.error || "Failed to create route");
    }

    setLoading(false);
  };

  const inputStyle = {
    borderColor: "rgba(59,118,137,0.2)",
    color: "var(--dark)",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>New route</h1>
        <p className="mt-1" style={{ color: "var(--secondary-text)" }}>Create a new cycling experience</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8"
        style={{ boxShadow: "0 2px 12px rgba(59,118,137,0.06)", border: "1px solid rgba(59,118,137,0.08)" }}
      >
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Jomtien Beach Discovery"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the experience..."
            rows={4}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Region + Difficulty */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Region</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Select a region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Distance + Duration + Elevation */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="12.5"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Duration (min)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="120"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Elevation (m)</label>
            <input
              type="number"
              value={elevationGain}
              onChange={(e) => setElevationGain(e.target.value)}
              placeholder="150"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Bike type */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Bike type</label>
          <select
            value={bikeType}
            onChange={(e) => setBikeType(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          >
            <option value="any">Any</option>
            <option value="road">Road</option>
            <option value="mountain">Mountain</option>
            <option value="ebike">E-Bike</option>
            <option value="gravel">Gravel</option>
          </select>
        </div>

        {/* Cover URL */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Cover image URL</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(224,122,95,0.1)", color: "var(--coral)" }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <a href="/dashboard/routes" className="px-6 py-3 text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-movana rounded-xl px-8 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create route"}
          </button>
        </div>
      </form>
    </div>
  );
}
