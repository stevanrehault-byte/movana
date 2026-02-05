"use client";

import { useAuth } from "@/components/AuthProvider";

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(59,118,137,0.06)", border: "1px solid rgba(59,118,137,0.08)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--secondary-text)" }}>{label}</span>
        <span style={{ color: "var(--teal-deep)" }}>{icon}</span>
      </div>
      <p className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>{value}</p>
    </div>
  );
}

function RouteIconSmall() {
  return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>;
}
function EyeIcon() {
  return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function StarIcon() {
  return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function BikeIcon() {
  return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h3" /></svg>;
}

export default function DashboardPage() {
  const { user, operator } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>
          Hello {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-base" style={{ color: "var(--secondary-text)" }}>
          Here&apos;s an overview of {operator?.name || "your business"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published routes" value="0" icon={<RouteIconSmall />} />
        <StatCard label="Total views" value="0" icon={<EyeIcon />} />
        <StatCard label="Avg. rating" value="—" icon={<StarIcon />} />
        <StatCard label="Total rides" value="0" icon={<BikeIcon />} />
      </div>

      {/* Quick actions */}
      <div
        className="rounded-2xl bg-white p-8"
        style={{ boxShadow: "0 2px 12px rgba(59,118,137,0.06)", border: "1px solid rgba(59,118,137,0.08)" }}
      >
        <h2 className="font-outfit mb-4 text-xl font-semibold" style={{ color: "var(--dark)" }}>
          Getting started
        </h2>
        <div className="space-y-4">
          <a
            href="/dashboard/profile"
            className="flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-gray-50"
            style={{ border: "1px solid rgba(59,118,137,0.1)" }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(104,181,155,0.15)" }}
            >
              <span style={{ color: "var(--teal-deep)" }}>1</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--dark)" }}>Complete your profile</p>
              <p className="text-sm" style={{ color: "var(--secondary-text)" }}>Add your logo, description, and location</p>
            </div>
          </a>

          <a
            href="/dashboard/routes/new"
            className="flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-gray-50"
            style={{ border: "1px solid rgba(59,118,137,0.1)" }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(104,181,155,0.15)" }}
            >
              <span style={{ color: "var(--teal-deep)" }}>2</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--dark)" }}>Create your first route</p>
              <p className="text-sm" style={{ color: "var(--secondary-text)" }}>Design a GPS-guided cycling experience</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
