"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";

function MenuIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const navLinks = [
  { href: "#routes", label: "Routes" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#partners", label: "Partners" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
      style={{
        backdropFilter: scrolled ? "blur(12px)" : "none",
        backgroundColor: scrolled ? "rgba(247,250,249,0.8)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(59,118,137,0.1)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--secondary-text)" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition-all hover:opacity-80"
            style={{ color: "var(--teal-deep)" }}
          >
            Sign in
          </a>
          <a
            href="/login"
            className="bg-gradient-movana rounded-full px-5 py-2.5 text-[15px] font-semibold text-white transition-all hover:shadow-lg"
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="p-2 md:hidden"
          style={{ color: "var(--teal-deep)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="absolute top-full right-0 left-0 space-y-4 px-6 py-6 md:hidden"
          style={{
            backgroundColor: "rgba(247,250,249,0.98)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(59,118,137,0.1)",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-base font-medium"
              style={{ color: "var(--secondary-text)" }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div
            className="space-y-3 border-t pt-4"
            style={{ borderColor: "rgba(59,118,137,0.1)" }}
          >
            <a
              href="/login"
              className="block w-full rounded-full border-2 px-5 py-2.5 text-center text-[15px] font-semibold"
              style={{ color: "var(--teal-deep)", borderColor: "var(--teal-deep)" }}
            >
              Sign in
            </a>
            <a
              href="/login"
              className="bg-gradient-movana block w-full rounded-full px-5 py-2.5 text-center text-[15px] font-semibold text-white"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
