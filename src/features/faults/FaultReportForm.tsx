import {
  CATEGORY_LABELS,
  MACHINE_LINES,
  MACHINE_PARTS,
  MACHINE_SECTIONS,
  PRIORITY_LABELS,
} from '@/data/catalog';
import type { FaultCategory, FaultPriority } from '@/types';
import { cn } from '@/utils/format';
import { Mic, ImagePlus } from 'lucide-react';

export interface FaultFormValues {
  machineLineId: string;
  sectionId: string;
  partId: string;
  category: FaultCategory | '';
  symptom: string;
  description: string;
  priority: FaultPriority | '';
  productionStopped: '' | 'yes' | 'no';
  occurredAt: string;
  photoName: string;
  photoUrl: string;
}

export const emptyForm = (lineId = ''): FaultFormValues => ({
  machineLineId: lineId,
  sectionId: '',
  partId: '',
  category: '',
  symptom: '',
  description: '',
  priority: '',
  productionStopped: '',
  occurredAt: new Date().toISOString().slice(0, 16),
  photoName: '',
  photoUrl: '',
});

export function validateFaultForm(v: FaultFormValues): Record<string, string> {
  const e: Record<string, string> = {};
  if (!v.machineLineId) e.machineLineId = 'Makine hattı seçin.';
  if (!v.sectionId) e.sectionId = 'Makine bölümü seçin.';
  if (!v.partId) e.partId = 'Arızalı parçayı seçin.';
  if (!v.category) e.category = 'Hata kategorisi seçin.';
  if (!v.symptom.trim()) e.symptom = 'Belirti / neden girin.';
  if (v.description.trim().length < 12) e.description = 'Açıklama en az 12 karakter olmalı.';
  if (!v.priority) e.priority = 'Öncelik seçin.';
  if (!v.productionStopped) e.productionStopped = 'Üretim duruşunu belirtin.';
  return e;
}

interface Props {
  values: FaultFormValues;
  errors: Record<string, string>;
  operatorName: string;
  onChange: (patch: Partial<FaultFormValues>) => void;
  onSubmit: () => void;
}

export function FaultReportForm({ values, errors, operatorName, onChange, onSubmit }: Props) {
  const field = (name: keyof FaultFormValues) => errors[name];
  return (
    <form
      className="grid gap-4 rounded-2xl bg-white p-4 shadow-card md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="text-sm font-medium">
        Makine hattı
        <select
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.machineLineId}
          onChange={(e) => onChange({ machineLineId: e.target.value })}
        >
          <option value="">Seçin</option>
          {MACHINE_LINES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
        {field('machineLineId') ? <span className="text-xs text-red-600">{field('machineLineId')}</span> : null}
      </label>
      <label className="text-sm font-medium">
        Makine bölümü
        <select
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.sectionId}
          onChange={(e) => onChange({ sectionId: e.target.value })}
        >
          <option value="">Seçin</option>
          {MACHINE_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {field('sectionId') ? <span className="text-xs text-red-600">{field('sectionId')}</span> : null}
      </label>
      <label className="text-sm font-medium">
        Arızalı parça
        <select
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.partId}
          onChange={(e) => onChange({ partId: e.target.value })}
        >
          <option value="">Seçin</option>
          {MACHINE_PARTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {field('partId') ? <span className="text-xs text-red-600">{field('partId')}</span> : null}
      </label>
      <label className="text-sm font-medium">
        Hata kategorisi
        <select
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.category}
          onChange={(e) => onChange({ category: e.target.value as FaultCategory })}
        >
          <option value="">Seçin</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {field('category') ? <span className="text-xs text-red-600">{field('category')}</span> : null}
      </label>
      <label className="text-sm font-medium md:col-span-2">
        Hata nedeni veya belirtisi
        <input
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.symptom}
          onChange={(e) => onChange({ symptom: e.target.value })}
        />
        {field('symptom') ? <span className="text-xs text-red-600">{field('symptom')}</span> : null}
      </label>
      <label className="text-sm font-medium md:col-span-2">
        Hata açıklaması
        <textarea
          rows={4}
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        {field('description') ? <span className="text-xs text-red-600">{field('description')}</span> : null}
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Öncelik seviyesi</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(PRIORITY_LABELS) as FaultPriority[]).map((p) => (
            <label
              key={p}
              className={cn(
                'min-h-[44px] cursor-pointer rounded-xl border px-3 py-2 text-sm',
                values.priority === p ? 'border-navy-900 bg-brand-yellow font-semibold' : 'border-navy-200',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name="priority"
                checked={values.priority === p}
                onChange={() => onChange({ priority: p })}
              />
              {PRIORITY_LABELS[p]}
            </label>
          ))}
        </div>
        {field('priority') ? <span className="text-xs text-red-600">{field('priority')}</span> : null}
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium">Makine üretimi durdurdu mu?</legend>
        <div className="mt-2 flex gap-2">
          {(['yes', 'no'] as const).map((v) => (
            <label
              key={v}
              className={cn(
                'min-h-[44px] cursor-pointer rounded-xl border px-4 py-2',
                values.productionStopped === v ? 'border-navy-900 bg-brand-yellow font-semibold' : 'border-navy-200',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name="stopped"
                checked={values.productionStopped === v}
                onChange={() => onChange({ productionStopped: v })}
              />
              {v === 'yes' ? 'Evet' : 'Hayır'}
            </label>
          ))}
        </div>
        {field('productionStopped') ? (
          <span className="text-xs text-red-600">{field('productionStopped')}</span>
        ) : null}
      </fieldset>
      <label className="text-sm font-medium">
        Fotoğraf ekle
        <span className="mt-1 flex min-h-[48px] items-center gap-2 rounded-xl border border-dashed border-navy-300 px-3 py-2">
          <ImagePlus size={18} />
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                onChange({ photoName: '', photoUrl: '' });
                return;
              }
              const reader = new FileReader();
              reader.onload = () =>
                onChange({ photoName: file.name, photoUrl: String(reader.result ?? '') });
              reader.readAsDataURL(file);
            }}
          />
        </span>
        <span className="text-xs text-navy-500">
          {values.photoName || 'Dosya seçilmezse örnek saha görseli eklenir.'}
        </span>
      </label>
      <div className="rounded-xl border border-dashed border-navy-300 p-3 text-sm text-navy-600">
        <p className="flex items-center gap-2 font-medium text-navy-800">
          <Mic size={16} /> Sesli not (yakında)
        </p>
        <p className="mt-1 text-xs">Kayıt arayüzü hazır; ses işleme bu sürümde bağlı değildir.</p>
      </div>
      <label className="text-sm font-medium">
        Arıza oluşma zamanı
        <input
          type="datetime-local"
          className="mt-1 w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.occurredAt}
          onChange={(e) => onChange({ occurredAt: e.target.value })}
        />
      </label>
      <label className="text-sm font-medium">
        Bildirimi yapan operatör
        <input className="mt-1 w-full rounded-xl border border-navy-200 bg-navy-50 px-3 py-2" value={operatorName} readOnly />
      </label>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-2xl bg-navy-900 px-4 py-3 text-base font-bold text-white hover:bg-navy-800"
        >
          Arıza kaydını gönder
        </button>
      </div>
    </form>
  );
}
