import { MACHINE_LINES, MACHINE_PARTS } from '@/data/catalog';
import {
  MACHINE_SECTION_MAPS,
  UNKNOWN_PART_ID,
  hotspotById,
  sectionMapById,
} from '@/data/machineMapConfig';
import { MachineSectionPhoto } from '@/features/machines/MachineImage';
import {
  NOTICE_OPTIONS,
  deriveCategory,
  derivePriority,
  noticeLabel,
  type NoticeId,
  type StopAnswer,
} from '@/features/faults/deriveOperatorReport';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/format';
import { prepareDemoPhoto } from '@/utils/prepareDemoPhoto';
import { Check, ChevronLeft, ImagePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { n: 1, label: 'Bölüm' },
  { n: 2, label: 'Parça' },
  { n: 3, label: 'Sorun' },
  { n: 4, label: 'Onay' },
] as const;

const STOP_OPTIONS: { id: StopAnswer; label: string }[] = [
  { id: 'yes', label: 'Evet' },
  { id: 'no', label: 'Hayır' },
  { id: 'unsure', label: 'Emin değilim' },
];

export function OperatorReportWizard() {
  const user = useAppStore((s) => s.currentUser);
  const createFault = useAppStore((s) => s.createFault);

  const singleLine = MACHINE_LINES.length === 1;
  const [lineId, setLineId] = useState(MACHINE_LINES[0]?.id ?? '');
  const [step, setStep] = useState(1);
  const [sectionId, setSectionId] = useState('');
  const [hotspotId, setHotspotId] = useState<string | 'unknown' | ''>('');
  const [noticeId, setNoticeId] = useState<NoticeId | ''>('');
  const [stop, setStop] = useState<StopAnswer | ''>('');
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoHint, setPhotoHint] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const section = sectionMapById(sectionId);
  const hotspot = hotspotId && hotspotId !== 'unknown' ? hotspotById(sectionId, hotspotId) : undefined;
  const partId = hotspotId === 'unknown' ? UNKNOWN_PART_ID : hotspot?.partId ?? '';
  const part = MACHINE_PARTS.find((p) => p.id === partId);
  const line = MACHINE_LINES.find((l) => l.id === lineId);

  const missingHint = useMemo(() => {
    if (!lineId) return 'Makine hattını seçin.';
    if (!sectionId) return '1. adımda makine bölümünü seçin.';
    if (!hotspotId) return '2. adımda arızalı parçayı veya “Emin değilim” seçin.';
    if (!noticeId) return '3. adımda ne fark ettiğinizi seçin.';
    if (!stop) return '3. adımda üretimin durup durmadığını belirtin.';
    return '';
  }, [lineId, sectionId, hotspotId, noticeId, stop]);

  const canEnter = (target: number) => {
    if (target <= 1) return true;
    if (target === 2) return Boolean(lineId && sectionId);
    if (target === 3) return Boolean(lineId && sectionId && hotspotId);
    if (target === 4) return Boolean(lineId && sectionId && hotspotId && noticeId && stop);
    return false;
  };

  const go = (target: number) => {
    if (canEnter(target)) {
      setSubmitError('');
      setStep(target);
      return;
    }
    setSubmitError(missingHint || 'Önceki adımı tamamlayın.');
  };

  const selectSection = (id: string) => {
    setSectionId(id);
    setHotspotId('');
    setSubmitError('');
  };

  const resetWizard = () => {
    setStep(1);
    setSectionId('');
    setHotspotId('');
    setNoticeId('');
    setStop('');
    setNotes('');
    setPhotoName('');
    setPhotoUrl('');
    setPhotoHint('');
    setSubmitError('');
    setCreatedId(null);
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoHint('');
    try {
      const prepared = await prepareDemoPhoto(file);
      setPhotoUrl(prepared.dataUrl);
      setPhotoName(prepared.name);
    } catch (err) {
      setPhotoUrl('');
      setPhotoName('');
      setPhotoHint(err instanceof Error ? err.message : 'Fotoğraf eklenemedi.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = async () => {
    if (missingHint) {
      setSubmitError(missingHint);
      if (!sectionId) setStep(1);
      else if (!hotspotId) setStep(2);
      else setStep(3);
      return;
    }
    const unknown = hotspotId === 'unknown';
    const category = deriveCategory({
      hotspotCategory: hotspot?.defaultCategory,
      sectionCategory: section?.defaultCategory,
      noticeId: noticeId as NoticeId,
      unknownPart: unknown,
    });
    const priority = derivePriority({ stop: stop as StopAnswer, noticeId: noticeId as NoticeId });
    const symptom = noticeLabel(noticeId as NoticeId);
    const stopText =
      stop === 'yes' ? 'Üretim durdu.' : stop === 'unsure' ? 'Üretimin durup durmadığı belirsiz.' : 'Üretim durmadı.';
    const description =
      notes.trim() ||
      `${section?.name ?? 'Bölüm'} · ${part?.name ?? 'Parça'} · ${symptom}. ${stopText}`;
    const occurred = new Date().toISOString();
    const attachments = photoUrl
      ? [
          {
            id: `att-${Date.now()}`,
            name: photoName || 'saha-foto.jpg',
            kind: 'photo' as const,
            url: photoUrl,
            createdAt: occurred,
          },
        ]
      : [];

    setSending(true);
    setSubmitError('');
    try {
      const record = await createFault({
        title: `${line?.code} · ${part?.name ?? 'Belirsiz alan'}`,
        machineLineId: lineId,
        sectionId,
        partId,
        category,
        priority,
        description,
        symptom,
        productionStopped: stop === 'yes',
        status: 'new',
        createdAt: occurred,
        occurredAt: occurred,
        createdBy: user.id,
        attachments,
        maintenanceNotes: unknown
          ? [
              {
                id: `note-${Date.now()}`,
                authorId: user.id,
                text: 'Operatör konumu net seçemedi (Emin değilim / Diğer alan).',
                createdAt: occurred,
              },
            ]
          : [],
        spareParts: [],
        visualLocation: {
          lineId,
          sectionId,
          partId,
          hotspotX: unknown ? 50 : hotspot?.x ?? 50,
          hotspotY: unknown ? 50 : hotspot?.y ?? 50,
        },
      });
      setCreatedId(record.id);
    } catch {
      setSubmitError('Kayıt gönderilemedi. Fotoğraf varsa daha küçük bir görsel deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (createdId) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-6 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow text-navy-900">
          <Check size={28} aria-hidden />
        </div>
        <h2 className="text-2xl font-bold text-navy-900">Arıza kaydı oluşturuldu</h2>
        <p className="font-mono text-lg font-semibold text-navy-800">{createdId}</p>
        <p className="text-navy-600">Bakım ekibi bildirimi görüntüleyebilir.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            to={`/arizalar/${createdId}`}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-navy-900 px-4 py-3 font-semibold text-white"
          >
            Kaydın özetini gör
          </Link>
          <button
            type="button"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-navy-200 px-4 py-3 font-semibold"
            onClick={resetWizard}
          >
            Yeni arıza bildir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Yeni arıza bildir</h2>
        <p className="text-navy-600">Sorun olan alana dokunun. Teknik parça adı bilmeniz gerekmez.</p>
      </div>

      <ol className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-2 shadow-card sm:gap-2">
        {STEPS.map((s) => {
          const active = step === s.n;
          const done = step > s.n && canEnter(s.n + 1);
          return (
            <li key={s.n}>
              <button
                type="button"
                className={cn(
                  'flex min-h-[48px] w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-center text-xs font-semibold sm:text-sm',
                  active && 'bg-brand-yellow text-navy-900',
                  done && !active && 'bg-navy-50 text-navy-800',
                  !active && !done && 'text-navy-400',
                )}
                onClick={() => go(s.n)}
              >
                <span>{s.n}. {s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          {singleLine ? (
            <p className="rounded-xl bg-navy-50 px-3 py-2 text-sm">
              Hat: <strong>{line?.code}</strong> · {line?.name}
            </p>
          ) : (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Makine hattı</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {MACHINE_LINES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={cn(
                      'min-h-[48px] rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold',
                      lineId === l.id ? 'border-brand-yellow bg-brand-yellow/20' : 'border-navy-200 bg-white',
                    )}
                    onClick={() => setLineId(l.id)}
                  >
                    {l.code}
                    <span className="mt-0.5 block text-xs font-normal text-navy-600">{l.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            {MACHINE_SECTION_MAPS.map((sec) => {
              const selected = sectionId === sec.sectionId;
              return (
                <button
                  key={sec.sectionId}
                  type="button"
                  className={cn(
                    'section-card overflow-hidden rounded-2xl border-4 text-left shadow-card',
                    selected ? 'section-card-selected border-brand-yellow' : 'border-transparent',
                  )}
                  onClick={() => selectSection(sec.sectionId)}
                >
                  <div className="relative">
                    <MachineSectionPhoto
                      sectionId={sec.sectionId}
                      alt={sec.name}
                      className="h-40 w-full sm:h-48"
                    />
                    {selected ? (
                      <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-navy-900">
                        <Check size={20} aria-hidden />
                      </span>
                    ) : null}
                  </div>
                  <div className="bg-white px-3 py-3">
                    <p className="font-bold text-navy-900">{sec.name}</p>
                    <p className="text-sm text-navy-600">{sec.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="min-h-[48px] rounded-xl bg-navy-900 px-5 font-semibold text-white disabled:opacity-40"
              disabled={!sectionId}
              onClick={() => go(2)}
            >
              Devam
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 && section ? (
        <section className="space-y-3">
          <p className="text-sm text-navy-600">
            Etikete veya ilgili alana dokunun. Parça adını bilmeniz gerekmez.
          </p>
          <div className="relative w-full overflow-hidden rounded-2xl bg-navy-900">
            <MachineSectionPhoto
              sectionId={section.sectionId}
              alt={section.name}
              className="aspect-[16/10] w-full min-h-[220px] sm:min-h-[320px]"
            />
            {section.hotspots.map((hs) => {
              const selected = hotspotId === hs.id;
              const w = hs.width ?? 0;
              const h = hs.height ?? 0;
              return (
                <button
                  key={hs.id}
                  type="button"
                  className={cn(
                    'machine-hotspot absolute z-10 min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 px-2 py-1.5 text-left text-xs font-bold shadow-md sm:text-sm',
                    selected
                      ? 'hotspot-selected border-brand-yellow bg-brand-yellow text-navy-900'
                      : 'border-white/80 bg-navy-900/80 text-white',
                  )}
                  style={{
                    left: `${hs.x}%`,
                    top: `${hs.y}%`,
                    width: w ? `${w}%` : undefined,
                    height: h ? `${h}%` : undefined,
                  }}
                  onClick={() => {
                    setHotspotId(hs.id);
                    setSubmitError('');
                  }}
                >
                  {hs.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={cn(
              'min-h-[48px] w-full rounded-xl border-2 px-4 py-3 text-left font-semibold',
              hotspotId === 'unknown' ? 'border-brand-yellow bg-brand-yellow/20' : 'border-navy-200 bg-white',
            )}
            onClick={() => {
              setHotspotId('unknown');
              setSubmitError('');
            }}
          >
            Emin değilim / Diğer alan
            <span className="mt-0.5 block text-sm font-normal text-navy-600">
              Bakım ekibine belirsiz konum bildirilir.
            </span>
          </button>
          <div className="flex justify-between gap-2">
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center gap-1 rounded-xl border border-navy-200 px-4 font-semibold"
              onClick={() => go(1)}
            >
              <ChevronLeft size={18} aria-hidden /> Geri
            </button>
            <button
              type="button"
              className="min-h-[48px] rounded-xl bg-navy-900 px-5 font-semibold text-white disabled:opacity-40"
              disabled={!hotspotId}
              onClick={() => go(3)}
            >
              Devam
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-base font-bold">Ne fark ettiniz?</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NOTICE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    'min-h-[52px] rounded-xl border-2 px-4 py-3 text-left text-base font-semibold',
                    noticeId === opt.id ? 'border-brand-yellow bg-brand-yellow/20' : 'border-navy-200 bg-white',
                  )}
                  onClick={() => setNoticeId(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-base font-bold">Üretim şu an durdu mu?</legend>
            <div className="grid grid-cols-3 gap-2">
              {STOP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    'min-h-[52px] rounded-xl border-2 px-2 py-3 font-semibold',
                    stop === opt.id ? 'border-brand-yellow bg-brand-yellow/20' : 'border-navy-200 bg-white',
                  )}
                  onClick={() => setStop(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-semibold">Kısaca açıklayın (isteğe bağlı)</span>
            <textarea
              className="mt-1 min-h-[88px] w-full rounded-xl border border-navy-200 px-3 py-3 text-base"
              placeholder="Örnek: Konveyör durdu, bant hareket etmiyor."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div>
            <p className="text-sm font-semibold">Yakın plan fotoğraf ekle (isteğe bağlı)</p>
            <label className="mt-2 flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy-300 px-3 py-3">
              <ImagePlus size={20} aria-hidden />
              <span>{photoBusy ? 'Hazırlanıyor…' : photoName || 'Fotoğraf seçin'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => void onPhoto(e.target.files?.[0])}
              />
            </label>
            {photoHint ? <p className="mt-1 text-sm text-red-700">{photoHint}</p> : null}
            {photoUrl ? (
              <button type="button" className="mt-2 text-sm underline" onClick={() => { setPhotoUrl(''); setPhotoName(''); }}>
                Fotoğrafı kaldır
              </button>
            ) : (
              <p className="mt-1 text-xs text-navy-500">Fotoğraf eklemeden de kayıt tamamlanabilir.</p>
            )}
          </div>
          <div className="flex justify-between gap-2">
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center gap-1 rounded-xl border border-navy-200 px-4 font-semibold"
              onClick={() => go(2)}
            >
              <ChevronLeft size={18} aria-hidden /> Geri
            </button>
            <button
              type="button"
              className="min-h-[48px] rounded-xl bg-navy-900 px-5 font-semibold text-white disabled:opacity-40"
              disabled={!noticeId || !stop}
              onClick={() => go(4)}
            >
              Özeti gör
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-4">
          <article className="rounded-2xl bg-white p-4 shadow-card">
            <h3 className="font-bold">Göndermeden önce kontrol edin</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Makine hattı</dt>
                <dd className="font-semibold">{line?.code} · {line?.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Bölüm</dt>
                <dd className="font-semibold">{section?.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Parça</dt>
                <dd className="font-semibold">{part?.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Sorun</dt>
                <dd className="font-semibold">{noticeId ? noticeLabel(noticeId) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-500">Üretim</dt>
                <dd className="font-semibold">
                  {stop === 'yes' ? 'Durdu' : stop === 'no' ? 'Durmadı' : 'Emin değilim'}
                </dd>
              </div>
              {notes.trim() ? (
                <div>
                  <dt className="text-navy-500">Açıklama</dt>
                  <dd className="mt-1">{notes.trim()}</dd>
                </div>
              ) : null}
            </dl>
            {section ? (
              <div className="relative mt-3 overflow-hidden rounded-xl">
                <MachineSectionPhoto sectionId={section.sectionId} alt={section.name} className="h-36 w-full" />
              </div>
            ) : null}
          </article>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-navy-200 px-4 font-semibold"
              onClick={() => go(3)}
            >
              <ChevronLeft size={18} aria-hidden /> Geri
            </button>
            <button
              type="button"
              className="min-h-[56px] flex-1 rounded-xl bg-brand-yellow px-4 text-base font-bold text-navy-900 disabled:opacity-40 sm:max-w-md"
              disabled={sending || Boolean(missingHint)}
              onClick={() => void submit()}
            >
              {sending ? 'Gönderiliyor…' : 'Arıza kaydını bakım ekibine gönder'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
