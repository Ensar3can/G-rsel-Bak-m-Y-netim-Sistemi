import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { formatTimeAgo } from '@/utils/format';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label={`Bildirimler${unread ? `, ${unread} okunmamış` : ''}`}
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread) void markRead();
        }}
      >
        <Bell size={20} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl bg-white p-2 text-navy-900 shadow-card">
          <p className="px-2 py-1 text-xs font-semibold uppercase text-navy-500">Bildirimler</p>
          <ul className="max-h-80 overflow-auto">
            {notifications.slice(0, 8).map((n) => (
              <li key={n.id}>
                {n.faultId ? (
                  <Link
                    to={`/arizalar/${n.faultId}`}
                    className="block rounded-xl px-3 py-2 hover:bg-navy-100"
                    onClick={() => setOpen(false)}
                  >
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-navy-600">{n.message}</p>
                    <p className="text-[11px] text-navy-400">{formatTimeAgo(n.createdAt)}</p>
                  </Link>
                ) : (
                  <div className="rounded-xl px-3 py-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-navy-600">{n.message}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
