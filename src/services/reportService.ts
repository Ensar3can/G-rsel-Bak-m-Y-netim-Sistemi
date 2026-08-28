import type { FaultRecord, ReportFilter } from '@/types';
import { parseISO, isWithinInterval, subDays } from 'date-fns';

const OPEN: FaultRecord['status'][] = ['new', 'reviewing', 'waiting_parts', 'in_progress'];

export function applyReportFilter(faults: FaultRecord[], filter: ReportFilter): FaultRecord[] {
  const from = parseISO(filter.from);
  const to = parseISO(filter.to);
  return faults.filter((f) => {
    const created = parseISO(f.createdAt);
    if (!isWithinInterval(created, { start: from, end: to })) return false;
    if (filter.machineLineId && f.machineLineId !== filter.machineLineId) return false;
    if (filter.sectionId && f.sectionId !== filter.sectionId) return false;
    if (filter.category && f.category !== filter.category) return false;
    if (filter.priority && f.priority !== filter.priority) return false;
    if (filter.status && f.status !== filter.status) return false;
    return true;
  });
}

export function previousPeriod(filter: ReportFilter): ReportFilter {
  const from = parseISO(filter.from);
  const to = parseISO(filter.to);
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
  return {
    ...filter,
    from: subDays(from, days).toISOString(),
    to: from.toISOString(),
  };
}

export function isOpen(f: FaultRecord) {
  return OPEN.includes(f.status);
}

export function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
