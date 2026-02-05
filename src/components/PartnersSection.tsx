function UsersIcon() {
  return (
    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const stats = [
  { number: "50+", label: "Active routes" },
  { number: "12", label: "Regions" },
  { number: "2k+", label: "Riders" },
  { number: "4.8", label: "Avg. rating" },
];

export function PartnersSection() {
  return (
    <section id="partners" className="px-6 py-20" style={{ backgroundColor: "var(--dark)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            className="font-outfit mb-4 font-bold text-white"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            For partners
          </h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: "var(--mint)" }}>
            Offer premium experiences to your customers with turnkey routes.
          </p>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-2">
          {/* Card 1 */}
          <div
            className="rounded-3xl p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="bg-gradient-movana mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
              <UsersIcon />
            </div>
            <h3 className="font-outfit mb-3 text-2xl font-semibold text-white">
              Build your brand
            </h3>
            <p className="leading-relaxed" style={{ color: "var(--mint)" }}>
              Customize your routes with your visual identity. Keep full control
              over the customer experience while leveraging our platform.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-3xl p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #E8B86D 0%, #E07A5F 100%)" }}
            >
              <TrendingUpIcon />
            </div>
            <h3 className="font-outfit mb-3 text-2xl font-semibold text-white">
              Boost your bookings
            </h3>
            <p className="leading-relaxed" style={{ color: "var(--mint)" }}>
              Offer guided cycling experiences without the guide. Reduce your
              operational costs while providing more options to your customers.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="mb-8 grid grid-cols-2 gap-6 rounded-3xl p-8 md:grid-cols-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,118,137,0.2) 0%, rgba(104,181,155,0.2) 100%)",
            border: "1px solid rgba(104,181,155,0.3)",
          }}
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="font-outfit mb-2 font-bold text-gradient"
                style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
              >
                {s.number}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--mint)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="bg-gradient-movana inline-block rounded-full px-8 py-4 font-semibold text-white transition-all hover:shadow-2xl"
            style={{ boxShadow: "0 8px 24px rgba(104,181,155,0.3)" }}
          >
            Request a demo
          </a>
        </div>
      </div>
    </section>
  );
}
