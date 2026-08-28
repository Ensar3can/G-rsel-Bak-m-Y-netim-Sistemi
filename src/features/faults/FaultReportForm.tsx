import {
  CATEGORY_LABELS,
  MACHINE_LINES,
  MACHINE_PARTS,
  MACHINE_SECTIONS,
  PRIORITY_LABELS,
} from '@/data/catalog';
import type { FaultCategory, FaultPriority } from '@/types';
import { cn } from '@/utils/format';
import { prepareDemoPhoto } from '@/utils/prepareDemoPhoto';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';

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
  if (!v.sectionId) e.sectionId = 'Makine bölümünü şemadan seçin.';
  if (!v.partId) e.partId = 'Arızalı parçayı şemadan veya listeden seçin.';
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
  const line = MACHINE_LINES.find((l) => l.id === values.machineLineId);
  const section = MACHINE_SECTIONS.find((s) => s.id === values.sectionId);
  const part = MACHINE_PARTS.find((p) => p.id === values.partId);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoHint, setPhotoHint] = useState('');

  return (
    <form
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-card md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-xl bg-navy-50 px-3 py-3 text-sm md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Şemadan seçilen konum</p>
        <p className="mt-1 font-medium text-navy-900">
          {line ? `${line.code} · ${line.name}` : 'Hat seçilmedi'}
        </p>
        <p className="text-navy-700">{section ? section.name : 'Bölüm: şemaya dokunun'}</p>
        <p className="text-navy-700">{part ? `Parça: ${part.name}` : 'Parça: henüz seçilmedi'}</p>
        {field('sectionId') ? <p className="mt-1 text-xs text-red-600">{field('sectionId')}</p> : null}
        {field('partId') ? <p className="text-xs text-red-600">{field('partId')}</p> : null}
        {field('machineLineId') ? <p className="text-xs text-red-600">{field('machineLineId')}</p> : null}
      </div>
      <label className="text-sm font-medium">
        Hata kategorisi
        <select
          className="mt-1 min-h-[44px] w-full rounded-xl border border-navy-200 px-3 py-2"
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
      <label className="text-sm font-medium">
        Arıza oluşma zamanı
        <input
          type="datetime-local"
          className="mt-1 min-h-[44px] w-full rounded-xl border border-navy-200 px-3 py-2"
          value={values.occurredAt}
          onChange={(e) => onChange({ occurredAt: e.target.value })}
        />
      </label>
      <label className="text-sm font-medium md:col-span-2">
        Hata nedeni veya belirtisi
        <input
          className="mt-1 min-h-[44px] w-full rounded-xl border border-navy-200 px-3 py-2"
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
      <label className="text-sm font-medium md:col-span-2">
        Fotoğraf ekle
        <span className="mt-1 flex min-h-[48px] items-center gap-2 rounded-xl border border-dashed border-navy-300 px-3 py-2">
          <ImagePlus size={18} />
          <input
            type="file"
            accept="image/*"
            className="max-w-full text-sm"
            disabled={photoBusy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                onChange({ photoName: '', photoUrl: '' });
                setPhotoHint('');
                return;
              }
              setPhotoBusy(true);
              setPhotoHint('Görsel küçültülüyor...');
              void prepareDemoPhoto(file)
                .then((ready) => {
                  onChange({ photoName: ready.name, photoUrl: ready.dataUrl });
                  setPhotoHint('');
                })
                .catch((err: unknown) => {
                  onChange({ photoName: '', photoUrl: '' });
                  setPhotoHint(err instanceof Error ? err.message : 'Görsel işlenemedi.');
                })
                .finally(() => setPhotoBusy(false));
            }}
          />
        </span>
        <span className="text-xs text-navy-500">
          {photoBusy ? 'Görsel küçültülüyor...' : values.photoName || 'Dosya seçilmezse örnek saha görseli eklenir.'}
        </span>
        {photoHint && !photoBusy ? <span className="block text-xs text-red-600">{photoHint}</span> : null}
        {errors.photoUrl ? <span className="block text-xs text-red-600">{errors.photoUrl}</span> : null}
      </label>
      <label className="text-sm font-medium md:col-span-2">
        Bildirimi yapan operatör
        <input
          className="mt-1 min-h-[44px] w-full rounded-xl border border-navy-200 bg-navy-50 px-3 py-2"
          value={operatorName}
          readOnly
        />
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
