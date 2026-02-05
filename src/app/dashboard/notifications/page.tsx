"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Notification {
  id: string; type: string; title: string; body: string; is_read: boolean;
  entity_type: string; entity_id: string; created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  booking_new: "🔔", booking_confirmed: "✅", booking_cancelled: "❌",
  booking_reminder: "⏰", review_new: "⭐", route_published: "🗺",
  system: "ℹ️", payment: "💰", fleet_alert: "🔧", team_invite: "👥",
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    if (!token) return;
    fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unreadCount || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, [token]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifs();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-3xl font-bold" style={{ color: "var(--dark)" }}>
            Notifications {unreadCount > 0 && <span className="ml-2 rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: "var(--coral)" }}>{unreadCount}</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-medium" style={{ color: "var(--teal-deep)" }}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? <p>Loading...</p> : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center" style={{ border: "1px solid rgba(59,118,137,0.08)" }}>
          <p className="text-4xl mb-4">🔔</p>
          <p style={{ color: "var(--secondary-text)" }}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              className="flex items-start gap-4 rounded-xl p-4 transition-all"
              style={{
                backgroundColor: n.is_read ? "white" : "rgba(104,181,155,0.06)",
                border: n.is_read ? "1px solid rgba(59,118,137,0.08)" : "1px solid rgba(104,181,155,0.2)",
              }}>
              <span className="text-2xl">{TYPE_ICONS[n.type] || "📌"}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs" style={{ color: "var(--secondary-text)" }}>{n.body}</p>}
              </div>
              <span className="shrink-0 text-xs" style={{ color: "var(--secondary-text)" }}>{timeAgo(n.created_at)}</span>
              {!n.is_read && <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--teal-deep)" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
