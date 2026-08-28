import { EmptyState, LoadingState } from '@/components/ui/States';
import { STATUS_LABELS } from '@/data/catalog';
import { FaultWorkCard } from '@/features/maintenance/FaultWorkCard';
import { useAppStore } from '@/store/appStore';
import type { FaultRecord } from '@/types';
import { cn, formatDateTime } from '@/utils/format';
import { partById, sectionById } from '@/utils/lookups';
import { LayoutGrid, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badges';

const COLUMNS = ['new', 'reviewing', 'waiting_parts', 'in_progress', 'resolved', 'closed'] as const;
const rank: Record<FaultRecord['priority'], number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function MaintenancePage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);
  const [mode, setMode] = useState<'kanban' | 'table'>('kanban');

  const sorted = useMemo(
    () => [...faults].sort((a, b) => rank[a.priority] - rank[b.priority]),
    [faults],
  );

  if (!hydrated) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bakım görev panosu</h2>
          <p className="text-navy-600">Kritik kayıtlar üstte · kanban veya tablo</p>
        </div>
        <div className="flex rounded-xl bg-white p-1 shadow">
          <button
            type="button"
            className={cn('flex items-center gap-1 rounded-lg px-3 py-2', mode === 'kanban' && 'bg-navy-900 text-white')}
            onClick={() => setMode('kanban')}
          >
            <LayoutGrid size={16} /> Kanban
          </button>
          <button
            type="button"
            className={cn('flex items-center gap-1 rounded-lg px-3 py-2', mode === 'table' && 'bg-navy-900 text-white')}
            onClick={() => setMode('table')}
          >
            <Table2 size={16} /> Tablo
          </button>
        </div>
      </div>

      {sorted.length === 0 ? <EmptyState title="Aktif kayıt yok" /> : null}

      {mode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <section key={col} className="w-80 shrink-0 rounded-2xl bg-navy-50 p-2">
              <h3 className="px-2 py-1 text-sm font-bold">{STATUS_LABELS[col]}</h3>
              <div className="space-y-2">
                {sorted
                  .filter((f) => f.status === col)
                  .map((f) => (
                    <FaultWorkCard key={f.id} fault={f} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-navy-900 text-white">
              <tr>
                <th className="px-3 py-2">Kayıt</th>
                <th>Öncelik</th>
                <th>Bölüm / parça</th>
                <th>Durum</th>
                <th>Duruş</th>
                <th>Zaman</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link className="font-semibold hover:underline" to={`/arizalar/${f.id}`}>
                      {f.id}
                    </Link>
                  </td>
                  <td>
                    <PriorityBadge priority={f.priority} />
                  </td>
                  <td>
                    {sectionById(f.sectionId)?.shortName} / {partById(f.partId)?.name}
                  </td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                  <td>{f.productionStopped ? 'Evet' : 'Hayır'}</td>
                  <td>{formatDateTime(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
