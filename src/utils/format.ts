import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy HH:mm', { locale: tr });
}

export function formatTimeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: tr });
}

export function cn(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}

export function nextFaultId(existing: { id: string }[]): string {
  const nums = existing
    .map((f) => Number(f.id.replace('GY-2026-', '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `GY-2026-${String(next).padStart(4, '0')}`;
}
