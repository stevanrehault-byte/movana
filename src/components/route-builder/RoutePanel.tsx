"use client";

import { useState, useEffect } from "react";
import { PoiData, POI_CATEGORIES } from "./RouteBuilder";

interface RoutePanelProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  bikeType: string;
  setBikeType: (v: string) => void;
  regionId: string;
  setRegionId: (v: string) => void;
  coverUrl: string;
  setCoverUrl: (v: string) => void;
  pois: PoiData[];
  onPoiEdit: (poi: PoiData) => void;
  onPoiDelete: (id: string) => void;
  saving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

interface Region {
  id: string;
  name: string;
}

const difficulties = [
  { value: "easy", label: "Easy", color: "#68B59B" },
  { value: "moderate", label: "Moderate", color: "#E8B86D" },
  { value: "challenging", label: "Challenging", color: "#E07A5F" },
  { value: "expert", label: "Expert", color: "#c0392b" },
];

export function RoutePanel({
  title, setTitle, description, setDescription,
  difficulty, setDifficulty, bikeType, setBikeType,
  regionId, setRegionId, coverUrl, setCoverUrl,
  pois, onPoiEdit, onPoiDelete,
  saving, onSaveDraft, onPublish,
}: RoutePanelProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "pois">("details");

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((d) => setRegions(d.regions || []))
      .catch(() => {});
  }, []);

  const inputStyle = { borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" };

  return (
    <div className="flex w-96 shrink-0 flex-col bg-white" style={{ borderLeft: "1px solid rgba(59,118,137,0.1)" }}>
      {/* Header */}
      <div className="border-b p-4" style={{ borderColor: "rgba(59,118,137,0.1)" }}>
        <h2 className="font-outfit text-lg font-semibold" style={{ color: "var(--dark)" }}>
          Route Editor
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "rgba(59,118,137,0.1)" }}>
        {(["details", "pois"] as const).map((tab) => (
          <button
            key={tab}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all"
            style={{
              color: activeTab === tab ? "var(--teal-deep)" : "var(--secondary-text)",
              borderBottom: activeTab === tab ? "2px solid var(--teal-deep)" : "2px solid transparent",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "details" ? "Details" : `POIs (${pois.length})`}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "details" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Jomtien Beach Discovery"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the experience..."
                rows={3}
                className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Region</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Select region</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--dark)" }}>Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    className="flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: difficulty === d.value ? d.color : "rgba(0,0,0,0.04)",
                      color: difficulty === d.value ? "white" : "var(--secondary-text)",
                    }}
                    onClick={() => setDifficulty(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Bike type</label>
              <select
                value={bikeType}
                onChange={(e) => setBikeType(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                <option value="any">Any</option>
                <option value="road">Road</option>
                <option value="mountain">Mountain</option>
                <option value="ebike">E-Bike</option>
                <option value="gravel">Gravel</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--dark)" }}>Cover image URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
              {coverUrl && (
                <div className="mt-2 h-32 overflow-hidden rounded-lg bg-gray-100">
                  <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pois.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                  No POIs yet. Select the POI tool and click on the map to add one.
                </p>
              </div>
            ) : (
              pois.map((poi, i) => {
                const cat = POI_CATEGORIES.find((c) => c.id === poi.category) || POI_CATEGORIES[POI_CATEGORIES.length - 1];
                return (
                  <div
                    key={poi.id}
                    className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-gray-50"
                    style={{ border: "1px solid rgba(59,118,137,0.08)" }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--dark)" }}>
                        {poi.name || "Unnamed"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--secondary-text)" }}>{cat.label}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onPoiEdit(poi)}
                        className="rounded-lg p-1.5 transition-all hover:bg-gray-100"
                        style={{ color: "var(--teal-deep)" }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onPoiDelete(poi.id)}
                        className="rounded-lg p-1.5 transition-all hover:bg-red-50"
                        style={{ color: "var(--coral)" }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t p-4" style={{ borderColor: "rgba(59,118,137,0.1)" }}>
        <div className="flex gap-3">
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all hover:shadow disabled:opacity-50"
            style={{ color: "var(--teal-deep)", borderColor: "var(--teal-deep)" }}
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
          <button
            onClick={onPublish}
            disabled={saving}
            className="bg-gradient-movana flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
          >
            {saving ? "..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
