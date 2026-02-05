"use client";

import { useState } from "react";

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      viewBox="0 0 24 24"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      style={{ color: "var(--teal-deep)" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const faqs = [
  {
    q: "What's the difference between Movana and Komoot?",
    a: "Movana focuses on curated, authentic experiences in Thailand, designed by local operators. Unlike Komoot which generates routes algorithmically, we create immersive itineraries with cultural stops, restaurant recommendations, and genuine connection with local culture.",
  },
  {
    q: "Do I need to bring my own bike?",
    a: "Not at all! Our partner operators offer quality bike rentals. You can book your bike directly through our platform along with your route.",
  },
  {
    q: "Do partners keep control of their brand?",
    a: "Absolutely. Our partners fully customize their routes with their visual identity, pricing, and approach. Movana provides the technology, you keep your brand.",
  },
  {
    q: "How are the routes created?",
    a: "Each route is designed by local experts who know the region intimately. We test every itinerary multiple times and collect rider feedback to constantly improve the experience.",
  },
  {
    q: "Can I use the routes offline?",
    a: "Yes! Our rider app works offline once you've downloaded the route. Perfect for areas with spotty mobile coverage.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2
            className="font-outfit mb-4 font-bold"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--dark)" }}
          >
            Frequently asked questions
          </h2>
          <p className="text-lg" style={{ color: "var(--secondary-text)" }}>
            Everything you need to know about Movana
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="cursor-pointer rounded-2xl bg-white p-6 transition-all"
                style={{
                  border: "1px solid rgba(59,118,137,0.1)",
                  boxShadow: isOpen
                    ? "0 8px 24px rgba(59,118,137,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="font-outfit flex-1 text-lg font-semibold"
                    style={{ color: "var(--dark)" }}
                  >
                    {faq.q}
                  </h3>
                  <ChevronDown open={isOpen} />
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? "200px" : "0",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="mt-4 leading-relaxed" style={{ color: "var(--secondary-text)" }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
