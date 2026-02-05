"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [firstName, setFirstName] = useState("");
  const [operatorName, setOperatorName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const result = await login(email, password);
      if (result.ok) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, operatorName: operatorName || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("movana_token", data.accessToken);
        router.push("/dashboard");
        window.location.reload();
      } else {
        setError(data.error || "Registration failed");
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: "var(--off-white)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-8"
        style={{ boxShadow: "0 8px 30px rgba(59,118,137,0.12)" }}
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="font-outfit mb-2 text-center text-2xl font-bold" style={{ color: "var(--dark)" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mb-8 text-center text-sm" style={{ color: "var(--secondary-text)" }}>
          {mode === "login" ? "Sign in to your operator dashboard" : "Start managing your cycling business"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" }}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>
                  Business name <span className="font-normal" style={{ color: "var(--secondary-text)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="e.g. FreeRide, Sawadee By Bike..."
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" }}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" }}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--dark)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: "rgba(59,118,137,0.2)", color: "var(--dark)" }}
              required
              minLength={8}
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(224,122,95,0.1)", color: "var(--coral)" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-movana w-full rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--secondary-text)" }}>
          {mode === "login" ? "No account yet? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="font-semibold underline"
            style={{ color: "var(--teal-deep)" }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
