import { PriorityBadge, StatusBadge } from '@/components/ui/Badges';
import type { FaultRecord } from '@/types';
import { cn, formatDateTime } from '@/utils/format';
import { lineById, partById, sectionById } from '@/utils/lookups';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const cardTone: Record<FaultRecord['priority'], string> = {
  critical: 'border border-red-300 border-l-[6px] border-l-red-700 bg-white ring-1 ring-red-100',
  high: 'border border-orange-200 border-l-[6px] border-l-orange-500 bg-white',
  medium: 'border border-yellow-200 border-l-[6px] border-l-yellow-400 bg-white',
  low: 'border border-emerald-200 border-l-[6px] border-l-emerald-600 bg-white',
};

export function FaultWorkCard({
  fault,
  onIntervene,
}: {
  fault: FaultRecord;
  onIntervene: (id: string) => void;
}) {
  return (
    <article className={cn('rounded-2xl p-4 shadow-sm', cardTone[fault.priority])}>
      {fault.priority === 'critical' ? (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-800">
          <AlertTriangle size={14} aria-hidden />
          Kritik arıza
        </p>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-navy-900">{fault.id}</p>
        <PriorityBadge priority={fault.priority} />
      </div>
      <p className="mt-1 text-sm font-medium">
        {lineById(fault.machineLineId)?.code} · {sectionById(fault.sectionId)?.shortName}
      </p>
      <p className="text-sm">Arızalı parça: {partById(fault.partId)?.name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-navy-700">{fault.description}</p>
      <p className="mt-2 text-xs text-navy-600">
        Üretim durdu: {fault.productionStopped ? 'Evet' : 'Hayır'}
      </p>
      <p className="text-xs text-navy-600">{formatDateTime(fault.createdAt)}</p>
      <div className="mt-2">
        <StatusBadge status={fault.status} />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="min-h-[44px] flex-1 rounded-xl bg-navy-900 px-3 text-sm font-semibold text-white"
          onClick={() => onIntervene(fault.id)}
        >
          Müdahale et
        </button>
        <Link
          to={`/arizalar/${fault.id}`}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-navy-800 px-3 text-sm font-semibold"
        >
          Detayı aç
        </Link>
      </div>
    </article>
  );
}
