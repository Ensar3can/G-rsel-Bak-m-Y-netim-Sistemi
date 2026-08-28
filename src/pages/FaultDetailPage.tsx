import { PriorityBadge, StatusBadge } from '@/components/ui/Badges';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { CATEGORY_LABELS, SPARE_PARTS, STATUS_LABELS } from '@/data/catalog';
import { AiRecommendationPanel } from '@/features/ai/AiRecommendationPanel';
import { MachineImage, SafeImg } from '@/features/machines/MachineImage';
import { FaultWorkPanel } from '@/features/maintenance/FaultWorkPanel';
import { useAppStore } from '@/store/appStore';
import type { MachineImageKey } from '@/data/machineAssets';
import { formatDateTime } from '@/utils/format';
import { partById, sectionById, userById } from '@/utils/lookups';
import { Link, useParams } from 'react-router-dom';

export function FaultDetailPage() {
  const { id } = useParams();
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);
  const role = useAppStore((s) => s.currentUser.role);
  const fault = faults.find((f) => f.id === id);

  if (!hydrated) return <LoadingState />;
  if (!fault) return <EmptyState title="Kayıt bulunamadı" hint="Bağlantıyı kontrol edin." />;

  const section = sectionById(fault.sectionId);
  const similar = faults.filter(
    (f) => f.id !== fault.id && (f.partId === fault.partId || f.category === fault.category),
  );
  const imageKey = (section?.imageKey ?? 'lineOverview') as MachineImageKey;
  const canWork = role === 'maintenance' || role === 'admin';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-navy-500">Arıza detayı</p>
          <h2 className="text-2xl font-bold">{fault.id}</h2>
          <p className="text-navy-600">{fault.title}</p>
        </div>
        <div className="flex gap-2">
          <PriorityBadge priority={fault.priority} />
          <StatusBadge status={fault.status} />
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Arıza özeti</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-navy-500">Kategori</dt>
              <dd>{CATEGORY_LABELS[fault.category]}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Parça</dt>
              <dd>{partById(fault.partId)?.name}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Operatör</dt>
              <dd>{userById(fault.createdBy)?.name}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Atanan</dt>
              <dd>{userById(fault.assignedTo)?.name ?? 'Atanmadı'}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Duruş</dt>
              <dd>{fault.productionStopped ? 'Evet' : 'Hayır'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">{fault.description}</p>
          <p className="mt-1 text-sm text-navy-600">Belirti: {fault.symptom}</p>
        </article>
        <article className="rounded-2xl bg-navy-900 p-4 text-white shadow-card">
          <h3 className="font-semibold text-brand-yellow">Seçilen makine görseli</h3>
          <div className="relative mt-2 overflow-hidden rounded-xl">
            <MachineImage
              imageKey={imageKey}
              alt={section?.name ?? 'Makine'}
              className="h-52 w-full object-cover"
            />
            <span
              className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-brand-yellow bg-red-600/70"
              style={{ left: `${fault.visualLocation.hotspotX}%`, top: `${fault.visualLocation.hotspotY}%` }}
              aria-label="Sorunlu alan"
            />
          </div>
          <p className="mt-2 text-sm">Yakın görünüm: {section?.name}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Operatör fotoğrafları</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {fault.attachments.map((a) => (
              <figure key={a.id}>
                <SafeImg src={a.url} alt={a.name} className="h-32 w-full rounded-xl object-cover" />
                <figcaption className="text-xs text-navy-500">{a.name}</figcaption>
              </figure>
            ))}
          </div>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Zaman çizelgesi</h3>
          <ol className="mt-2 space-y-2 border-l-2 border-navy-200 pl-4">
            {fault.statusHistory.map((h, i) => (
              <li key={`${h.at}-${i}`}>
                <p className="text-sm font-semibold">{STATUS_LABELS[h.status]}</p>
                <p className="text-xs text-navy-500">
                  {formatDateTime(h.at)} · {userById(h.by)?.name}
                </p>
                {h.note ? <p className="text-xs">{h.note}</p> : null}
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Bakım notları</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {fault.maintenanceNotes.length === 0 ? <li>Henüz not yok.</li> : null}
            {fault.maintenanceNotes.map((n) => (
              <li key={n.id} className="rounded-xl bg-navy-50 p-2">
                <p>{n.text}</p>
                <p className="text-xs text-navy-500">
                  {userById(n.authorId)?.name} · {formatDateTime(n.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Kullanılan malzemeler</h3>
          <ul className="mt-2 text-sm">
            {fault.spareParts.length === 0 ? <li>Malzeme eklenmedi.</li> : null}
            {fault.spareParts.map((s) => {
              const sp = SPARE_PARTS.find((p) => p.id === s.sparePartId);
              return (
                <li key={s.id}>
                  {sp?.name} × {s.quantity}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm">Müdahale: {fault.estimatedRepairMinutes ?? '—'} dk (tahmini)</p>
          <p className="text-sm">Çözüm: {fault.actualRepairMinutes ?? '—'} dk</p>
          <p className="text-sm">Kök neden: {fault.rootCause ?? 'Henüz seçilmedi'}</p>
          <p className="text-sm">Sonuç: {fault.resolutionSummary ?? 'Açık kayıt'}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Benzer geçmiş arızalar</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {similar.slice(0, 6).map((f) => (
              <li key={f.id}>
                <Link className="font-semibold hover:underline" to={`/arizalar/${f.id}`}>
                  {f.id}
                </Link>{' '}
                · {partById(f.partId)?.name}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {canWork ? (
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <FaultWorkPanel fault={fault} />
        </section>
      ) : null}

      <AiRecommendationPanel fault={fault} similar={similar} />
    </div>
  );
}
