function SearchIcon() {
  return (
    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

const steps = [
  {
    number: "01",
    icon: SearchIcon,
    title: "Choose",
    description: "Pick your destination, duration, and the vibe that suits you best.",
  },
  {
    number: "02",
    icon: NavigationIcon,
    title: "Ride",
    description: "Follow simple GPS directions and discover recommended stops along the way.",
  },
  {
    number: "03",
    icon: SmileIcon,
    title: "Enjoy",
    description: "Live an authentic travel experience, completely hassle-free.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            className="font-outfit mb-4 font-bold"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--dark)" }}
          >
            How it works
          </h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: "var(--secondary-text)" }}>
            Three simple steps to transform your trip into an authentic adventure.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div
            className="absolute top-20 left-[20%] right-[20%] hidden h-0.5 md:block"
            style={{
              background: "linear-gradient(90deg, #3B7689 0%, #68B59B 50%, #92D99E 100%)",
              opacity: 0.3,
            }}
          />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 text-center">
              {/* Number circle */}
              <div className="mb-6 flex justify-center">
                <div className="bg-gradient-movana relative flex h-20 w-20 items-center justify-center rounded-full">
                  <span className="font-outfit absolute inset-1 flex items-center justify-center rounded-full bg-white text-2xl font-bold text-gradient">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "rgba(104,181,155,0.1)" }}
                >
                  <span style={{ color: "var(--teal-deep)" }}>
                    <step.icon />
                  </span>
                </div>
              </div>

              <h3
                className="font-outfit mb-3 text-2xl font-semibold"
                style={{ color: "var(--dark)" }}
              >
                {step.title}
              </h3>
              <p
                className="mx-auto max-w-xs text-base leading-relaxed"
                style={{ color: "var(--secondary-text)" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
