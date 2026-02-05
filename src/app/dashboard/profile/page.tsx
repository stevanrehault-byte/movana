"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { token, operator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    if (!token || !operator) return;
    fetch(`/api/operators/${operator.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.operator) {
          const o = data.operator;
          setName(o.name || "");
          setDescription(o.description || "");
          setEmail(o.email || "");
          setPhone(o.phone || "");
          setWebsite(o.website || "");
          setCity(o.city || "");
          setLogoUrl(o.logo_url || "");
          setCoverUrl(o.cover_url || "");
        }
      })
      .catch(() => {});
  }, [token, operator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    const res = await fetch(`/api/operators/${operator?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, email, phone, website, city, logoUrl, coverUrl }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
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
        <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>Operator Profile</h1>
        <p className="mt-1" style={{ color: "var(--secondary-text)" }}>Manage how riders see your business</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8"
        style={{ boxShadow: "0 2px 12px rgba(59,118,137,0.06)", border: "1px solid rgba(59,118,137,0.08)" }}
      >
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Business name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell riders about your business..."
            rows={4}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Pattaya, Chiang Mai..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>Cover image URL</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(224,122,95,0.1)", color: "var(--coral)" }}>
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(104,181,155,0.1)", color: "var(--teal-deep)" }}>
            ✓ Profile saved successfully
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-movana rounded-xl px-8 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
