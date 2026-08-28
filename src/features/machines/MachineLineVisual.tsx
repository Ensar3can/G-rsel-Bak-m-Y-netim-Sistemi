import { MACHINE_PARTS, MACHINE_SECTIONS } from '@/data/catalog';
import { MachineImage } from '@/features/machines/MachineImage';
import type { MachineImageKey } from '@/data/machineAssets';
import type { MachineSection } from '@/types';
import { cn } from '@/utils/format';

const HOTSPOTS: Record<string, { partId: string; x: string; y: string }[]> = {
  raw: [
    { partId: 'part-conveyor', x: '42%', y: '28%' },
    { partId: 'part-motor', x: '18%', y: '68%' },
    { partId: 'part-belt', x: '42%', y: '68%' },
    { partId: 'part-electrical', x: '75%', y: '68%' },
    { partId: 'part-sensor', x: '85%', y: '38%' },
  ],
  process: [
    { partId: 'part-cutter', x: '50%', y: '32%' },
    { partId: 'part-hydraulic', x: '80%', y: '32%' },
    { partId: 'part-conveyor', x: '50%', y: '64%' },
    { partId: 'part-motor', x: '16%', y: '86%' },
    { partId: 'part-bearing', x: '28%', y: '86%' },
  ],
  quality: [
    { partId: 'part-sensor', x: '56%', y: '32%' },
    { partId: 'part-conveyor', x: '50%', y: '62%' },
    { partId: 'part-electrical', x: '20%', y: '84%' },
    { partId: 'part-motor', x: '78%', y: '32%' },
  ],
};

interface Props {
  selectedSectionId?: string;
  selectedPartId?: string;
  onSelectSection: (section: MachineSection) => void;
  onSelectPart: (partId: string) => void;
}

export function MachineLineVisual({
  selectedSectionId,
  selectedPartId,
  onSelectSection,
  onSelectPart,
}: Props) {
  const selected = MACHINE_SECTIONS.find((s) => s.id === selectedSectionId);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
      <div className="min-w-0 rounded-2xl bg-navy-900 p-3 text-white shadow-card sm:p-4">
        <p className="mb-3 text-sm font-semibold text-brand-yellow">Üç bölümlü hat şeması</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {MACHINE_SECTIONS.map((section) => {
            const active = section.id === selectedSectionId;
            const key = section.imageKey as MachineImageKey;
            return (
              <button
                key={section.id}
                type="button"
                className={cn(
                  'section-card min-h-[44px] overflow-hidden rounded-2xl border-2 text-left transition',
                  active
                    ? 'border-brand-yellow shadow-lg ring-2 ring-brand-yellow/40'
                    : 'border-white/10 opacity-90 hover:opacity-100',
                )}
                onClick={() => onSelectSection(section)}
                aria-pressed={active}
                aria-label={section.name}
              >
                <MachineImage
                  imageKey={key}
                  alt={section.name}
                  fallbackSubtitle={section.shortName}
                  className="h-40 w-full object-cover object-center md:h-36"
                />
                <div className="bg-navy-800 px-3 py-2">
                  <p className="text-xs text-brand-yellow">{section.shortName}</p>
                  <p className="text-sm font-semibold leading-snug">{section.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="min-w-0 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-lg font-bold text-navy-900">Seçim paneli</h2>
        {selected ? (
          <>
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-navy-200 bg-navy-900">
              <MachineImage
                imageKey={selected.imageKey as MachineImageKey}
                alt={`${selected.name} yakın görünüm`}
                fallbackSubtitle="Yakın şema"
                className="h-48 w-full origin-center object-cover sm:h-56"
              />
              {(HOTSPOTS[selected.code] ?? []).map((h) => {
                const part = MACHINE_PARTS.find((p) => p.id === h.partId);
                const on = selectedPartId === h.partId;
                return (
                  <button
                    key={h.partId}
                    type="button"
                    className={cn(
                      'machine-hotspot absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-2 py-1 text-[10px] font-bold sm:text-[11px]',
                      on
                        ? 'border-navy-900 bg-brand-yellow text-navy-900'
                        : 'border-white bg-navy-900/80 text-white hover:bg-brand-yellow hover:text-navy-900',
                    )}
                    style={{ left: h.x, top: h.y }}
                    onClick={() => onSelectPart(h.partId)}
                    aria-label={`${part?.name} seç`}
                    aria-pressed={on}
                  >
                    {part?.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-navy-600">{selected.description}</p>
            <p className="mt-3 text-xs font-semibold uppercase text-navy-400">Parça seçimi</p>
            <ul className="mt-2 grid grid-cols-1 gap-2">
              {MACHINE_PARTS.map((part) => (
                <li key={part.id}>
                  <button
                    type="button"
                    className={cn(
                      'min-h-[44px] w-full rounded-xl border px-3 py-2 text-left text-sm',
                      selectedPartId === part.id
                        ? 'border-brand-yellow bg-yellow-50 font-semibold'
                        : 'border-navy-100 hover:bg-navy-50',
                    )}
                    onClick={() => onSelectPart(part.id)}
                  >
                    {part.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-navy-500">Sorun olan bölüme dokunun. Yakın görünüm ve parça listesi burada açılır.</p>
        )}
      </aside>
    </div>
  );
}
