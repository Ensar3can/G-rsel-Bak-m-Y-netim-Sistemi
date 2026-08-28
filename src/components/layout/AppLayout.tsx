import { ROLE_LABELS, USERS } from '@/data/catalog';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useAppStore } from '@/store/appStore';
import type { Role } from '@/types';
import { cn } from '@/utils/format';
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Wrench,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { ToastViewport } from '@/components/ui/ToastViewport';

const nav = [
  { to: '/', label: 'Kontrol paneli', icon: LayoutDashboard, roles: ['operator', 'maintenance', 'manager', 'admin'] as Role[] },
  { to: '/yeni-ariza', label: 'Yeni arıza bildir', icon: PlusCircle, roles: ['operator', 'admin'] as Role[] },
  { to: '/bakim', label: 'Bakım panosu', icon: Wrench, roles: ['maintenance', 'admin'] as Role[] },
  { to: '/raporlar', label: 'Raporlar', icon: BarChart3, roles: ['manager', 'admin'] as Role[] },
  { to: '/yonetim', label: 'Yönetim', icon: ClipboardList, roles: ['manager', 'admin'] as Role[] },
  { to: '/sistem', label: 'Sistem', icon: Settings, roles: ['admin'] as Role[] },
];

export function AppLayout() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setRole = useAppStore((s) => s.setRole);
  const items = nav.filter((n) => n.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen overflow-x-hidden bg-navy-100">
      <header className="sticky top-0 z-30 bg-navy-900 text-white shadow">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow sm:text-base">
              Goodyear
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-navy-200 sm:inline">Rol</span>
                <select
                  className="max-w-[11rem] rounded-xl bg-navy-800 px-2 py-2 text-sm font-medium sm:max-w-none sm:px-3"
                  value={currentUser.role}
                  aria-label="Aktif rolü değiştir"
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {USERS.filter((u, i, arr) => arr.findIndex((x) => x.role === u.role) === i).map((u) => (
                    <option key={u.role} value={u.role}>
                      {ROLE_LABELS[u.role]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-navy-300">{currentUser.shift}</p>
              </div>
              <NotificationBell />
            </div>
          </div>
          <h1 className="mt-1 text-[11px] font-medium leading-snug text-navy-200 sm:text-sm sm:text-white">
            Görsel Bakım ve Arıza Yönetim Sistemi
          </h1>
        </div>
        <nav className="border-t border-white/10 bg-navy-800" aria-label="Ana menü">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] min-w-max items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium',
                      isActive ? 'bg-brand-yellow text-navy-900' : 'text-white hover:bg-white/10',
                    )
                  }
                >
                  <Icon size={18} aria-hidden />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  );
}
