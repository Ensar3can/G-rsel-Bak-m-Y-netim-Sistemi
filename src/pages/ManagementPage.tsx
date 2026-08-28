import { KpiCard } from '@/components/ui/KpiCard';
import { LoadingState } from '@/components/ui/States';
import { isOpen } from '@/services/reportService';
import { useAppStore } from '@/store/appStore';
import { formatMoney } from '@/utils/format';
import { partById, sectionById } from '@/utils/lookups';
import { AlertTriangle, Banknote, Flame, Gauge } from 'lucide-react';
import { parseISO, subDays } from 'date-fns';
import { Link } from 'react-router-dom';

export function ManagementPage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);
  if (!hydrated) return <LoadingState />;

  const open = faults.filter(isOpen);
  const since = subDays(new Date('2026-08-27'), 30);
  const last30 = faults.filter((f) => parseISO(f.createdAt) >= since);
  const criticalTrend = last30.filter((f) => f.priority === 'critical').length;
  const cost = last30.reduce((s, f) => s + f.estimatedCost, 0);
  const stopRisk = last30.filter((f) => f.productionStopped).length;
  const sectionCounts = new Map<string, number>();
  last30.forEach((f) => sectionCounts.set(f.sectionId, (sectionCounts.get(f.sectionId) ?? 0) + 1));
  const worstSection = [...sectionCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const partCounts = new Map<string, number>();
  last30.forEach((f) => partCounts.set(f.partId, (partCounts.get(f.partId) ?? 0) + 1));
  const worstPart = [...partCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const responded = last30.filter((f) => f.statusHistory.length > 1);
  const response = responded.length
    ? Math.round(
        responded.reduce((s, f) => {
          const a = parseISO(f.statusHistory[0].at).getTime();
          const b = parseISO(f.statusHistory[1].at).getTime();
          return s + (b - a) / 60000;
        }, 0) / responded.length,
      )
    : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Yönetim karar destek ekranı</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Toplam açık arıza" value={open.length} icon={AlertTriangle} />
        <KpiCard title="Kritik arıza trendi (30g)" value={criticalTrend} icon={Flame} tone="red" />
        <KpiCard title="Tahmini bakım maliyeti" value={formatMoney(cost)} icon={Banknote} tone="yellow" />
        <KpiCard title="Üretim kaybı riski" value={`${stopRisk} duruş`} icon={Gauge} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">En problemli bölge</h3>
          <p className="mt-2 text-lg font-bold">
            {sectionById(worstSection?.[0] ?? '')?.name ?? '—'}
          </p>
          <p className="text-sm text-navy-600">{worstSection?.[1] ?? 0} kayıt / 30 gün</p>
          <h3 className="mt-4 font-semibold">En fazla tekrar eden hata</h3>
          <p className="text-lg font-bold">{partById(worstPart?.[0] ?? '')?.name}</p>
          <p className="mt-4 text-sm">Bakım ekibi ortalama yanıt: {response} dk</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Önceliklendirilmiş aksiyon önerileri</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
            <li>Kritik açık kayıtlara 30 dk SLA ile bakım ataması yapın.</li>
            <li>
              {partById(worstPart?.[0] ?? '')?.name} için yedek parça min. stok seviyesini gözden geçirin.
            </li>
            <li>Ana üretim bölümünde planlı duruş penceresi ile hizalama bakımı planlayın.</li>
            <li>Sensör kalibrasyon rutininin vardiya başı kontrol listesine eklenmesini değerlendirin.</li>
          </ol>
        </article>
      </div>
      <article className="rounded-2xl bg-navy-900 p-4 text-white shadow-card">
        <h3 className="font-bold text-brand-yellow">Son 30 günün öne çıkan bulguları</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {last30
            .filter((f) => f.priority === 'critical' || f.productionStopped)
            .slice(0, 6)
            .map((f) => (
              <li key={f.id}>
                <Link className="text-brand-yellow hover:underline" to={`/arizalar/${f.id}`}>
                  {f.id}
                </Link>{' '}
                · {f.title}
              </li>
            ))}
        </ul>
      </article>
    </div>
  );
}
