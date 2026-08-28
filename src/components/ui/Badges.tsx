import { PRIORITY_LABELS, STATUS_LABELS } from '@/data/catalog';
import type { FaultPriority, FaultStatus } from '@/types';
import { cn } from '@/utils/format';
import { AlertTriangle, Circle, Flame, Minus } from 'lucide-react';

const priorityStyle: Record<FaultPriority, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const statusStyle: Record<FaultStatus, string> = {
  new: 'bg-sky-100 text-sky-800',
  reviewing: 'bg-indigo-100 text-indigo-800',
  waiting_parts: 'bg-amber-100 text-amber-900',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-700',
};

export function PriorityBadge({ priority }: { priority: FaultPriority }) {
  const Icon =
    priority === 'critical' ? Flame : priority === 'high' ? AlertTriangle : priority === 'medium' ? Circle : Minus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
        priorityStyle[priority],
      )}
    >
      <Icon size={14} aria-hidden />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: FaultStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', statusStyle[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
