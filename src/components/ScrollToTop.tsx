"use client";

import { useState, useEffect } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="bg-gradient-movana fixed right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-110"
      style={{ boxShadow: "0 4px 20px rgba(59,118,137,0.3)" }}
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
