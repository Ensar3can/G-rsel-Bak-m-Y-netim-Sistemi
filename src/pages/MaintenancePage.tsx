import { EmptyState, LoadingState } from '@/components/ui/States';
import { STATUS_LABELS } from '@/data/catalog';
import { FaultWorkCard } from '@/features/maintenance/FaultWorkCard';
import { useAppStore } from '@/store/appStore';
import type { FaultRecord } from '@/types';
import { useMemo } from 'react';

const COLUMNS = ['new', 'reviewing', 'waiting_parts', 'in_progress', 'resolved', 'closed'] as const;
const rank: Record<FaultRecord['priority'], number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function MaintenancePage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);

  const sorted = useMemo(
    () => [...faults].sort((a, b) => rank[a.priority] - rank[b.priority]),
    [faults],
  );

  if (!hydrated) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bakım görev panosu</h2>
        <p className="text-navy-600">Kayıtlar duruma göre dikey listelenir. Kritik arızalar üstte ve kırmızı çerçeveyle vurgulanır.</p>
      </div>

      {sorted.length === 0 ? <EmptyState title="Aktif kayıt yok" /> : null}

      <div className="space-y-6">
        {COLUMNS.map((col) => {
          const items = sorted.filter((f) => f.status === col);
          return (
            <section key={col} className="rounded-2xl bg-navy-50 p-3 sm:p-4">
              <h3 className="flex items-center justify-between gap-2 px-1 text-base font-bold text-navy-900">
                <span>{STATUS_LABELS[col]}</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold text-navy-700">
                  {items.length}
                </span>
              </h3>
              <div className="mt-3 space-y-3">
                {items.length === 0 ? (
                  <p className="px-1 text-sm text-navy-500">Bu durumda kayıt yok.</p>
                ) : (
                  items.map((f) => <FaultWorkCard key={f.id} fault={f} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
