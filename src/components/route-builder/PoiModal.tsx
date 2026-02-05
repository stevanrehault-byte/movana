"use client";

import { useState } from "react";
import { PoiData, POI_CATEGORIES } from "./RouteBuilder";

interface PoiModalProps {
  poi?: PoiData;
  onSave: (data: Partial<PoiData>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function PoiModal({ poi, onSave, onDelete, onClose }: PoiModalProps) {
  const [name, setName] = useState(poi?.name || "");
  const [description, setDescription] = useState(poi?.description || "");
  const [category, setCategory] = useState(poi?.category || "");
  const [isHighlight, setIsHighlight] = useState(poi?.isHighlight || false);
  const [tips, setTips] = useState(poi?.tips || "");
  const [priceRange, setPriceRange] = useState(poi?.priceRange || "");
  const [openingHours, setOpeningHours] = useState(poi?.openingHours || "");
  const [photoUrl, setPhotoUrl] = useState(poi?.photoUrl || "");

  const inputStyle = { borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-outfit text-xl font-semibold" style={{ color: "var(--dark)" }}>
            {poi ? "Edit POI" : "Add POI"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Category grid */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium" style={{ color: "var(--dark)" }}>Category *</label>
          <div className="grid grid-cols-4 gap-2">
            {POI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all"
                style={{
                  backgroundColor: category === cat.id ? `${cat.color}20` : "rgba(0,0,0,0.03)",
                  border: category === cat.id ? `2px solid ${cat.color}` : "2px solid transparent",
                }}
                onClick={() => setCategory(cat.id)}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[10px] font-medium" style={{ color: category === cat.id ? cat.color : "var(--secondary-text)" }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunset Café, Temple of Dawn..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this place special?"
            rows={2}
            className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Tips */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Tips for riders</label>
          <input
            type="text"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="e.g. Best coffee in town, ask for the pad thai..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Price + Hours row */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Price range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">N/A</option>
              <option value="$">$ Budget</option>
              <option value="$$">$$ Mid-range</option>
              <option value="$$$">$$$ Premium</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Opening hours</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="e.g. 8:00 - 22:00"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Photo URL */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Photo URL</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Highlight toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className="flex h-6 w-11 items-center rounded-full transition-all"
              style={{ backgroundColor: isHighlight ? "var(--teal-deep)" : "rgba(0,0,0,0.15)" }}
              onClick={() => setIsHighlight(!isHighlight)}
            >
              <div
                className="h-5 w-5 rounded-full bg-white shadow transition-all"
                style={{ marginLeft: isHighlight ? "22px" : "2px" }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--dark)" }}>Highlight POI</span>
          </label>
          <p className="mt-1 text-xs" style={{ color: "var(--secondary-text)" }}>Highlighted POIs are featured in the route preview</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-red-50"
                style={{ color: "var(--coral)" }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
              Cancel
            </button>
            <button
              onClick={() => {
                if (!category) return;
                onSave({ name, description, category, isHighlight, tips, priceRange, openingHours, photoUrl });
              }}
              disabled={!category || !name.trim()}
              className="bg-gradient-movana rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
            >
              {poi ? "Update" : "Add POI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
