import { Logo } from "./Logo";

function InstagramIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

const sections = {
  explore: [
    { label: "All routes", href: "/explore" },
    { label: "Pattaya & Jomtien", href: "/explore/pattaya" },
    { label: "Chiang Mai", href: "/explore/chiang-mai" },
    { label: "Southern Islands", href: "/explore/islands" },
  ],
  partners: [
    { label: "Become a partner", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Documentation", href: "/docs" },
    { label: "Support", href: "/support" },
  ],
  movana: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  { icon: InstagramIcon, href: "https://instagram.com/movana.bike" },
  { icon: FacebookIcon, href: "https://facebook.com/movana.bike" },
  { icon: TwitterIcon, href: "https://twitter.com/movana_bike" },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--dark)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo className="mb-4" />
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--mint)" }}>
              Explore locally, move freely.
              <br />
              Authentic cycling adventures in Thailand.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: "rgba(104,181,155,0.2)", color: "var(--mint)" }}
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-outfit mb-4 text-base font-semibold text-white">Explore</h4>
            <ul className="space-y-3">
              {sections.explore.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--mint)" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-outfit mb-4 text-base font-semibold text-white">Partners</h4>
            <ul className="space-y-3">
              {sections.partners.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--mint)" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Movana */}
          <div>
            <h4 className="font-outfit mb-4 text-base font-semibold text-white">Movana</h4>
            <ul className="space-y-3">
              {sections.movana.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--mint)" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{ borderTop: "1px solid rgba(104,181,155,0.2)" }}
        >
          <p className="text-sm" style={{ color: "var(--mint)" }}>
            © 2026 Movana. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((t) => (
              <a
                key={t}
                href={`/${t.toLowerCase()}`}
                className="text-sm transition-colors hover:opacity-70"
                style={{ color: "var(--mint)" }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
