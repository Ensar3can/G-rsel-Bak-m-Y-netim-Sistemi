import { PriorityBadge, StatusBadge } from '@/components/ui/Badges';
import { KpiCard } from '@/components/ui/KpiCard';
import { LoadingState } from '@/components/ui/States';
import { CATEGORY_LABELS } from '@/data/catalog';
import { isOpen } from '@/services/reportService';
import { useAppStore } from '@/store/appStore';
import { formatDateTime, formatTimeAgo } from '@/utils/format';
import { partById, sectionById, userById } from '@/utils/lookups';
import { AlertTriangle, Clock3, Flame, Inbox, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export function DashboardPage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);
  const role = useAppStore((s) => s.currentUser.role);
  const userId = useAppStore((s) => s.currentUser.id);

  if (!hydrated) return <LoadingState />;

  const open = faults.filter(isOpen);
  const critical = open.filter((f) => f.priority === 'critical');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openedToday = faults.filter((f) => parseISO(f.createdAt) >= today);
  const waiting = faults.filter((f) => f.status === 'new' || f.status === 'waiting_parts');
  const resolved = faults.filter((f) => f.actualRepairMinutes);
  const avgMin = resolved.length
    ? Math.round(resolved.reduce((s, f) => s + (f.actualRepairMinutes ?? 0), 0) / resolved.length)
    : 0;
  const high = [...open]
    .filter((f) => f.priority === 'critical' || f.priority === 'high')
    .sort((a, b) => (a.priority === 'critical' ? 0 : 1) - (b.priority === 'critical' ? 0 : 1));
  const newForMaint = faults.filter((f) => f.status === 'new');

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    return {
      day: format(d, 'EEE', { locale: tr }),
      count: faults.filter((f) => format(parseISO(f.createdAt), 'yyyy-MM-dd') === key).length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Ana kontrol paneli</h2>
        <p className="text-navy-600">
          Demo verileri · {format(new Date(), 'd MMMM yyyy', { locale: tr })}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Aktif arıza" value={open.length} icon={Inbox} />
        <KpiCard title="Acil / kritik" value={critical.length} icon={Flame} tone="red" />
        <KpiCard title="Bugün açılan" value={openedToday.length} icon={AlertTriangle} tone="yellow" />
        {(role === 'maintenance' || role === 'admin') && (
          <KpiCard title="Çözülmeyi bekleyen" value={waiting.length} icon={Clock3} />
        )}
        {(role === 'manager' || role === 'admin' || role === 'maintenance') && (
          <KpiCard title="Ort. müdahale" value={resolved.length ? `${avgMin} dk` : '—'} icon={Timer} tone="green" />
        )}
        {role === 'operator' && (
          <KpiCard
            title="Sizin kayıtlarınız"
            value={faults.filter((f) => f.createdBy === userId).length}
            icon={Inbox}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow-card lg:col-span-2">
          <h3 className="font-semibold">Haftalık hata trendi</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Kayıt" stroke="#12203a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Bakım ekibine yeni bildirimler</h3>
          <ul className="mt-2 space-y-2">
            {newForMaint.slice(0, 5).map((f) => (
              <li key={f.id}>
                <Link to={`/arizalar/${f.id}`} className="block rounded-xl bg-navy-50 px-3 py-2 hover:bg-navy-100">
                  <p className="text-sm font-semibold">{f.id}</p>
                  <p className="text-xs text-navy-600">{f.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Son açılan hata kayıtları</h3>
          <ul className="mt-3 divide-y">
            {faults.slice(0, 6).map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <Link to={`/arizalar/${f.id}`} className="font-semibold text-navy-800 hover:underline">
                    {f.id}
                  </Link>
                  <p className="text-xs text-navy-500">
                    {partById(f.partId)?.name} · {sectionById(f.sectionId)?.shortName} · {formatTimeAgo(f.createdAt)}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Önceliği yüksek kayıtlar</h3>
          <ul className="mt-3 space-y-2">
            {high.slice(0, 6).map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xl border border-navy-100 p-2">
                <div>
                  <Link to={`/arizalar/${f.id}`} className="font-semibold hover:underline">
                    {f.id}
                  </Link>
                  <p className="text-xs text-navy-500">
                    {CATEGORY_LABELS[f.category]} · {userById(f.createdBy)?.name} · {formatDateTime(f.createdAt)}
                  </p>
                </div>
                <PriorityBadge priority={f.priority} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
