import { cn } from '@/utils/format';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'navy' | 'yellow' | 'red' | 'green';
}

const tones = {
  navy: 'bg-navy-800 text-white',
  yellow: 'bg-brand-yellow text-navy-900',
  red: 'bg-red-600 text-white',
  green: 'bg-emerald-700 text-white',
};

export function KpiCard({ title, value, hint, icon: Icon, tone = 'navy' }: Props) {
  return (
    <article className={cn('min-w-0 rounded-2xl p-4 shadow-card min-h-[112px]', tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm opacity-80">{title}</p>
          <p className="mt-1 break-words text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1 text-xs opacity-80">{hint}</p> : null}
        </div>
        <span className="rounded-xl bg-white/15 p-2" aria-hidden>
          <Icon size={22} />
        </span>
      </div>
    </article>
  );
}
