import { RouteCard } from "./RouteCard";

const routes = [
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    badge: "Beach",
    badgeColor: "rgba(104,181,155,0.9)",
    location: "Jomtien",
    distance: "10-12 km",
    duration: "2h",
    title: "Jomtien Beach Discovery",
    description:
      "The perfect coastal ride for beginners. Beach promenade, Instagram cafés, night market and panoramic viewpoints.",
    rating: 4.9,
    operator: "FreeRide",
  },
  {
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    badge: "Culture",
    badgeColor: "rgba(232,184,109,0.9)",
    location: "Bang Saray",
    distance: "30-35 km",
    duration: "4-5h",
    title: "Bang Saray Fishing Village",
    description:
      "Immerse yourself in authentic Thailand. Traditional fishing village, stilted houses, fresh seafood straight from the boats.",
    rating: 4.8,
    operator: "FreeRide",
  },
  {
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    badge: "Nature",
    badgeColor: "rgba(146,217,158,0.9)",
    location: "Pattaya South",
    distance: "35-45 km",
    duration: "5-6h",
    title: "Silver Lake & Buddha Mountain",
    description:
      "Cultural landmarks meet stunning scenery. The world's largest Buddha carving, Italian vineyard, and serene temple complex.",
    rating: 4.7,
    operator: "FreeRide",
  },
];

export function RoutesSection() {
  return (
    <section id="routes" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="font-outfit mb-4 font-bold"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--dark)" }}
          >
            Routes ready to ride
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg"
            style={{ color: "var(--secondary-text)" }}
          >
            Each route is crafted to reveal the authentic Thailand, far from
            tourist traps. GPS-guided, hassle-free.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route, i) => (
            <RouteCard key={i} {...route} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/explore"
            className="bg-gradient-movana inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:shadow-lg"
          >
            View all routes
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
