"use client";

export function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const colors = {
    success: { bg: "rgba(104,181,155,0.95)", text: "white" },
    error: { bg: "rgba(224,122,95,0.95)", text: "white" },
    info: { bg: "rgba(59,118,137,0.95)", text: "white" },
  };

  const c = colors[type];

  return (
    <div
      className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium backdrop-blur"
      style={{ backgroundColor: c.bg, color: c.text, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
    >
      {type === "success" && "✓ "}
      {type === "error" && "✕ "}
      {message}
    </div>
  );
}
