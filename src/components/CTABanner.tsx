export function CTABanner() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div
          className="bg-gradient-movana relative overflow-hidden rounded-3xl p-12 text-center md:p-16"
          style={{ boxShadow: "0 20px 60px rgba(59,118,137,0.3)" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 h-96 w-96 opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 h-96 w-96 opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <h2
              className="font-outfit mx-auto mb-6 max-w-3xl font-bold text-white"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.2 }}
            >
              Ready to explore Thailand differently?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/95">
              Join thousands of riders who have already discovered the magic of
              Thailand on two wheels.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/explore"
                className="min-w-[200px] rounded-full px-8 py-4 font-semibold text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--dark)",
                  boxShadow: "0 8px 24px rgba(31,46,43,0.3)",
                }}
              >
                Discover routes
              </a>
              <a
                href="/login"
                className="min-w-[200px] rounded-full bg-white px-8 py-4 font-semibold transition-all hover:scale-105"
                style={{
                  color: "var(--teal-deep)",
                  boxShadow: "0 8px 24px rgba(255,255,255,0.2)",
                }}
              >
                Become a partner
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
