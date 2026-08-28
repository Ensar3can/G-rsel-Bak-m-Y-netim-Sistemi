import { ROOT_CAUSES, SPARE_PARTS, STATUS_LABELS } from '@/data/catalog';
import { useAppStore } from '@/store/appStore';
import type { FaultRecord, FaultStatus } from '@/types';
import { formatDateTime } from '@/utils/format';
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

export function FaultWorkPanel({
  fault,
  onClose,
}: {
  fault: FaultRecord;
  onClose?: () => void;
}) {
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
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-navy-500">Müdahale</p>
          <h3 className="text-lg font-bold">{fault.id}</h3>
          <p className="text-navy-600">
            {lineById(fault.machineLineId)?.code} · {sectionById(fault.sectionId)?.shortName} ·{' '}
            {partById(fault.partId)?.name}
          </p>
        </div>
        {onClose ? (
          <button type="button" className="min-h-[44px] rounded-xl px-3 text-sm font-semibold" onClick={onClose}>
            Kapat
          </button>
        ) : null}
      </div>
      <p className="text-xs text-navy-500">{formatDateTime(fault.createdAt)}</p>
      <p className="text-navy-800">{fault.description}</p>
      <p className="text-xs text-navy-600">Olası malzemeler: {materials.join(', ')}</p>
      <div className="flex flex-wrap gap-2">
        {fault.status === 'new' && (
          <button
            type="button"
            className="min-h-[44px] rounded-xl bg-navy-900 px-3 text-sm font-semibold text-white"
            onClick={() => void claim(fault.id)}
          >
            Üzerime Al
          </button>
        )}
        <select
          className="min-h-[44px] rounded-xl border px-2 py-2 text-sm"
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label>
          Tahmini bitiş (dk)
          <input
            className="mt-1 min-h-[44px] w-full rounded-xl border px-3 py-2"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            onBlur={() => void updateFault(fault.id, { estimatedRepairMinutes: Number(eta) || undefined })}
          />
        </label>
        <label>
          Çözüm süresi (dk)
          <input
            className="mt-1 min-h-[44px] w-full rounded-xl border px-3 py-2"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            onBlur={() => void updateFault(fault.id, { actualRepairMinutes: Number(actual) || undefined })}
          />
        </label>
      </div>
      <label className="block">
        Kök neden
        <select
          className="mt-1 min-h-[44px] w-full rounded-xl border px-3 py-2"
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          className="min-h-[44px] flex-1 rounded-xl border px-2"
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
          className="min-h-[44px] rounded-xl bg-navy-800 px-3 font-semibold text-white"
          onClick={() => {
            const sp = SPARE_PARTS.find((p) => p.id === partId)!;
            void updateFault(fault.id, {
              spareParts: [...fault.spareParts, { id: `use-${Date.now()}`, sparePartId: sp.id, quantity: 1 }],
            });
            pushToast('Malzeme eklendi.');
          }}
        >
          Malzeme ekle
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="min-h-[44px] flex-1 rounded-xl border px-3 py-2"
          placeholder="Bakım notu"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="min-h-[44px] rounded-xl bg-navy-800 px-3 font-semibold text-white"
          onClick={() => {
            if (note.trim().length < 3) return;
            void addNote(fault.id, note);
            setNote('');
          }}
        >
          Not
        </button>
      </div>
      <Link
        to={`/arizalar/${fault.id}`}
        className="inline-flex min-h-[44px] items-center font-semibold text-navy-800 underline"
      >
        Arıza detay sayfası
      </Link>
      <button
        type="button"
        className="min-h-[44px] w-full rounded-xl border border-navy-800 py-2 text-sm font-semibold"
        onClick={() =>
          void updateFault(fault.id, {
            status: 'closed',
            resolutionSummary: 'Saha müdahalesi tamamlandı, hat serbest.',
          })
        }
      >
        Arızayı kapat
      </button>
    </div>
  );
}
