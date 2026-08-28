import { PriorityBadge, StatusBadge } from '@/components/ui/Badges';
import { ROOT_CAUSES, SPARE_PARTS, STATUS_LABELS } from '@/data/catalog';
import { useAppStore } from '@/store/appStore';
import type { FaultRecord, FaultStatus } from '@/types';
import { cn, formatDateTime } from '@/utils/format';
import { lineById, partById, sectionById } from '@/utils/lookups';
import { suggestedMaterialLabels } from '@/utils/suggestedMaterials';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const COLUMNS: FaultStatus[] = [
  'new',
  'reviewing',
  'waiting_parts',
  'in_progress',
  'resolved',
  'closed',
];

const cardTone: Record<FaultRecord['priority'], string> = {
  critical: 'border-l-4 border-l-red-600 bg-red-50',
  high: 'border-l-4 border-l-orange-500 bg-orange-50',
  medium: 'border-l-4 border-l-yellow-400 bg-yellow-50',
  low: 'border-l-4 border-l-emerald-500 bg-emerald-50',
};

export function FaultWorkCard({ fault }: { fault: FaultRecord }) {
  const claim = useAppStore((s) => s.claimFault);
  const updateFault = useAppStore((s) => s.updateFault);
  const addNote = useAppStore((s) => s.addNote);
  const pushToast = useAppStore((s) => s.pushToast);
  const [note, setNote] = useState('');
  const [eta, setEta] = useState(String(fault.estimatedRepairMinutes ?? 60));
  const [root, setRoot] = useState(fault.rootCause ?? '');
  const [actual, setActual] = useState(String(fault.actualRepairMinutes ?? ''));
  const [partId, setPartId] = useState(SPARE_PARTS[0].id);
  const materials = suggestedMaterialLabels(fault.partId);

  return (
    <article className={cn('rounded-2xl p-3 shadow-sm', cardTone[fault.priority])}>
      <div className="flex items-start justify-between gap-2">
        <Link to={`/arizalar/${fault.id}`} className="font-bold hover:underline">
          {fault.id}
        </Link>
        <PriorityBadge priority={fault.priority} />
      </div>
      <p className="mt-1 text-sm font-medium">
        {lineById(fault.machineLineId)?.code} · {sectionById(fault.sectionId)?.shortName}
      </p>
      <p className="text-sm">Arızalı parça: {partById(fault.partId)?.name}</p>
      <p className="mt-1 line-clamp-2 text-xs text-navy-700">{fault.description}</p>
      <img
        src={fault.attachments[0]?.url}
        alt="Operatör saha fotoğrafı"
        className="mt-2 h-20 w-full rounded-lg object-cover"
      />
      <p className="mt-2 text-xs">
        {formatDateTime(fault.createdAt)} · Üretim durdu: {fault.productionStopped ? 'Evet' : 'Hayır'}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        <StatusBadge status={fault.status} />
        <span className="text-xs text-navy-600">ETA: {fault.estimatedRepairMinutes ?? '—'} dk</span>
      </div>
      <p className="mt-1 text-xs">Görsel konum: {sectionById(fault.visualLocation.sectionId)?.name}</p>
      <p className="mt-1 text-xs text-navy-700">
        Olası malzemeler: {materials.join(', ')}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {fault.status === 'new' && (
          <button
            type="button"
            className="min-h-[40px] rounded-xl bg-navy-900 px-3 text-sm font-semibold text-white"
            onClick={() => void claim(fault.id)}
          >
            Üzerime Al
          </button>
        )}
        <select
          className="rounded-xl border px-2 py-1 text-xs"
          aria-label="Durum değiştir"
          value={fault.status}
          onChange={(e) => void updateFault(fault.id, { status: e.target.value as FaultStatus })}
        >
          {COLUMNS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <label>
          Tahmini bitiş (dk)
          <input
            className="w-full rounded border px-2 py-1"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            onBlur={() => void updateFault(fault.id, { estimatedRepairMinutes: Number(eta) || undefined })}
          />
        </label>
        <label>
          Çözüm süresi (dk)
          <input
            className="w-full rounded border px-2 py-1"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            onBlur={() => void updateFault(fault.id, { actualRepairMinutes: Number(actual) || undefined })}
          />
        </label>
      </div>
      <label className="mt-2 block text-xs">
        Kök neden
        <select
          className="w-full rounded border px-2 py-1"
          value={root}
          onChange={(e) => {
            setRoot(e.target.value);
            void updateFault(fault.id, { rootCause: e.target.value });
          }}
        >
          <option value="">Seçin</option>
          {ROOT_CAUSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 flex gap-1">
        <select
          className="flex-1 rounded border px-1 text-xs"
          aria-label="Yedek parça"
          value={partId}
          onChange={(e) => setPartId(e.target.value)}
        >
          {SPARE_PARTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded bg-navy-800 px-2 text-xs text-white"
          onClick={() => {
            const sp = SPARE_PARTS.find((p) => p.id === partId)!;
            void updateFault(fault.id, {
              spareParts: [
                ...fault.spareParts,
                { id: `use-${Date.now()}`, sparePartId: sp.id, quantity: 1, unitCost: sp.unitCost },
              ],
            });
            pushToast('Malzeme eklendi.');
          }}
        >
          Malzeme
        </button>
      </div>
      <div className="mt-2 flex gap-1">
        <input
          className="flex-1 rounded border px-2 py-1 text-xs"
          placeholder="Bakım notu"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-navy-800 px-2 text-xs text-white"
          onClick={() => {
            if (note.trim().length < 3) return;
            void addNote(fault.id, note);
            setNote('');
          }}
        >
          Not
        </button>
      </div>
      <button
        type="button"
        className="mt-2 w-full rounded-xl border border-navy-800 py-1 text-xs font-semibold"
        onClick={() =>
          void updateFault(fault.id, {
            status: 'closed',
            resolutionSummary: 'Saha müdahalesi tamamlandı, hat serbest.',
          })
        }
      >
        Arızayı kapat
      </button>
    </article>
  );
}
