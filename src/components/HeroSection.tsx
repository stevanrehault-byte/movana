"use client";

import Image from "next/image";

function SearchIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20">
      {/* Gradient blob */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #68B59B 0%, #92D99E 50%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left */}
          <div className="space-y-6">
            <h1
              className="font-outfit font-bold leading-tight"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", color: "var(--dark)" }}
            >
              Explore locally,{" "}
              <span className="text-gradient">hassle-free</span>.
            </h1>

            <p
              className="max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--secondary-text)" }}
            >
              Authentic cycling routes across Thailand, designed to immerse you
              in local culture. No planning headaches, just pure adventure.
            </p>

            {/* Search */}
            <div
              className="flex max-w-2xl flex-col items-stretch gap-3 rounded-3xl bg-white p-2 sm:flex-row sm:items-center sm:rounded-full"
              style={{ boxShadow: "0 8px 24px rgba(59,118,137,0.12)" }}
            >
              <div className="flex flex-1 items-center gap-3 px-4 py-1">
                <span style={{ color: "var(--secondary-text)" }}>
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search a destination..."
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--dark)" }}
                />
              </div>
              <button className="bg-gradient-movana shrink-0 rounded-full px-8 py-3 text-[15px] font-semibold text-white transition-all hover:shadow-lg">
                Explore
              </button>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-3">
              {["Guided & self-guided", "GPS navigation", "Powered by locals"].map(
                (text) => (
                  <span
                    key={text}
                    className="rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(104,181,155,0.1)",
                      color: "var(--teal-deep)",
                      border: "1px solid rgba(104,181,155,0.2)",
                    }}
                  >
                    {text}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative mt-8 md:mt-0">
            <div
              className="relative h-[400px] overflow-hidden rounded-3xl md:h-[500px]"
              style={{ boxShadow: "0 20px 60px rgba(59,118,137,0.2)" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80"
                alt="Cycling along a tropical Thai coast"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute bottom-4 left-4 rounded-2xl px-4 py-2 backdrop-blur-md md:bottom-8 md:left-8 md:px-6 md:py-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}
            >
              <p className="text-xs font-medium md:text-sm" style={{ color: "var(--secondary-text)" }}>
                🌴 Explore Thailand
              </p>
              <p className="text-sm font-bold md:text-base" style={{ color: "var(--dark)" }}>
                50+ routes available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
