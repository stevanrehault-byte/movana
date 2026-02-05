"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";

function NavItem({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active: boolean; badge?: number }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
      style={{ backgroundColor: active ? "rgba(104,181,155,0.15)" : "transparent", color: active ? "var(--teal-deep)" : "var(--secondary-text)" }}>
      {icon}
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--coral)" }}>{badge}</span> : null}
    </a>
  );
}

function I({ d }: { d: string }) {
  return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d={d} /></svg>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, operator, loading, logout, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Fetch unread notifications count
  useEffect(() => {
    if (!token) return;
    fetch("/api/notifications?unread=true&limit=1", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUnread(d.unreadCount || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/notifications?unread=true&limit=1", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setUnread(d.unreadCount || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--off-white)" }}><Logo /></div>;
  if (!user) return null;

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: <I d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />, match: (p: string) => p === "/dashboard" },
    { href: "/dashboard/routes", label: "Routes", icon: <I d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77" />, match: (p: string) => p.startsWith("/dashboard/routes") },
    { href: "/dashboard/fleet", label: "Fleet", icon: <I d="M5.5 17.5L5.5 17.5 M18.5 17.5L18.5 17.5 M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h3" />, match: (p: string) => p.startsWith("/dashboard/fleet") },
    { href: "/dashboard/bookings", label: "Bookings", icon: <I d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, match: (p: string) => p.startsWith("/dashboard/bookings") },
    { href: "/dashboard/notifications", label: "Notifications", icon: <I d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" />, match: (p: string) => p.startsWith("/dashboard/notifications"), badge: unread },
    { href: "/dashboard/profile", label: "Profile", icon: <I d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z" />, match: (p: string) => p.startsWith("/dashboard/profile") },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--off-white)" }}>
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r bg-white p-6" style={{ borderColor: "rgba(59,118,137,0.1)" }}>
        <div className="mb-8">
          <Logo />
          {operator && <div className="mt-3 rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: "rgba(104,181,155,0.1)", color: "var(--teal-deep)" }}>{operator.name} — {operator.tier}</div>}
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(n => <NavItem key={n.href} href={n.href} icon={n.icon} label={n.label} active={n.match(pathname)} badge={(n as any).badge} />)}
        </nav>
        <div className="space-y-3 border-t pt-4" style={{ borderColor: "rgba(59,118,137,0.1)" }}>
          <div className="px-4">
            <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>{user.firstName} {user.lastName}</p>
            <p className="text-xs" style={{ color: "var(--secondary-text)" }}>{user.email}</p>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-red-50" style={{ color: "var(--coral)" }}>
            <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" /> Sign out
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
