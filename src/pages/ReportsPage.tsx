import { KpiCard } from '@/components/ui/KpiCard';
import { LoadingState } from '@/components/ui/States';
import {
  CATEGORY_LABELS,
  MACHINE_LINES,
  MACHINE_PARTS,
  MACHINE_SECTIONS,
  PRIORITY_LABELS,
  SPARE_PARTS,
  STATUS_LABELS,
} from '@/data/catalog';
import { applyReportFilter, avg, previousPeriod } from '@/services/reportService';
import { useAppStore } from '@/store/appStore';
import type { FaultCategory, FaultPriority, FaultStatus, ReportFilter } from '@/types';
import { Clock, Flame, PauseCircle, Timer } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#12203a', '#F5C518', '#c2410c', '#047857', '#1d4ed8', '#7c3aed', '#be123c'];

export function ReportsPage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const faults = useAppStore((s) => s.faults);
  const [filter, setFilter] = useState<ReportFilter>(() => {
    const end = new Date();
    return {
      from: subDays(end, 30).toISOString(),
      to: end.toISOString(),
      period: 'monthly',
    };
  });

  const data = useMemo(() => applyReportFilter(faults, filter), [faults, filter]);
  const prev = useMemo(
    () => applyReportFilter(faults, previousPeriod(filter)),
    [faults, filter],
  );

  const changePct =
    prev.length === 0 ? 100 : Math.round(((data.length - prev.length) / prev.length) * 100);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((f) => {
      const k = format(parseISO(f.createdAt), 'd MMM', { locale: tr });
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return [...map.entries()].map(([day, count]) => ({ day, count }));
  }, [data]);

  const bySection = MACHINE_SECTIONS.map((s) => ({
    name: s.shortName,
    count: data.filter((f) => f.sectionId === s.id).length,
  }));
  const byCat = Object.keys(CATEGORY_LABELS).map((k) => ({
    name: CATEGORY_LABELS[k],
    value: data.filter((f) => f.category === k).length,
  })).filter((x) => x.value > 0);

  const partsTable = MACHINE_PARTS.map((p) => ({
    name: p.name,
    count: data.filter((f) => f.partId === p.id).length,
  })).sort((a, b) => b.count - a.count);

  const rootMap = new Map<string, number>();
  data.forEach((f) => {
    if (f.rootCause) rootMap.set(f.rootCause, (rootMap.get(f.rootCause) ?? 0) + 1);
  });
  const roots = [...rootMap.entries()].map(([name, count]) => ({ name, count }));

  const downtime = MACHINE_SECTIONS.map((s) => ({
    name: s.name,
    stops: data.filter((f) => f.sectionId === s.id && f.productionStopped).length,
  })).sort((a, b) => b.stops - a.stops);

  const usedParts = new Map<string, number>();
  data.forEach((f) =>
    f.spareParts.forEach((u) => usedParts.set(u.sparePartId, (usedParts.get(u.sparePartId) ?? 0) + u.quantity)),
  );
  const usedTable = [...usedParts.entries()]
    .map(([id, qty]) => ({ name: SPARE_PARTS.find((p) => p.id === id)?.name ?? id, qty }))
    .sort((a, b) => b.qty - a.qty);

  const interventionMins = data.map((f) => f.estimatedRepairMinutes ?? 0).filter(Boolean);
  const solveMins = data.map((f) => f.actualRepairMinutes ?? 0).filter(Boolean);
  const avgIntervention = avg(interventionMins);
  const avgSolve = avg(solveMins);
  const critical = data.filter((f) => f.priority === 'critical').length;
  const stopCount = data.filter((f) => f.productionStopped).length;

  const topSection = [...bySection].sort((a, b) => b.count - a.count)[0];
  const sensorNow = data.filter((f) => f.category === 'sensor').length;
  const sensorPrev = prev.filter((f) => f.category === 'sensor').length;
  const motorMins = data
    .filter((f) => f.partId === 'part-motor')
    .map((f) => f.actualRepairMinutes ?? 0)
    .filter(Boolean);
  const otherMins = data
    .filter((f) => f.partId !== 'part-motor')
    .map((f) => f.actualRepairMinutes ?? 0)
    .filter(Boolean);
  const motorAvg = avg(motorMins);
  const otherAvg = avg(otherMins);

  if (!hydrated) return <LoadingState />;

  const setPeriod = (period: ReportFilter['period']) => {
    const end = new Date();
    const days = period === 'weekly' ? 7 : 30;
    setFilter((f) => ({
      ...f,
      period,
      from: subDays(end, days).toISOString(),
      to: end.toISOString(),
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Raporlar ve hata analizi</h2>
      <p className="text-sm text-navy-600">Demo verileri · {format(new Date(), 'd MMMM yyyy', { locale: tr })}</p>
      <div className="flex min-w-0 flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-card">
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.period}
          onChange={(e) => setPeriod(e.target.value as ReportFilter['period'])}
        >
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
          <option value="custom">Özel aralık</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          Başlangıç
          <input
            type="date"
            className="rounded-xl border px-3 py-2"
            value={filter.from.slice(0, 10)}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                period: 'custom',
                from: `${e.target.value}T00:00:00.000Z`,
              }))
            }
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Bitiş
          <input
            type="date"
            className="rounded-xl border px-3 py-2"
            value={filter.to.slice(0, 10)}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                period: 'custom',
                to: `${e.target.value}T23:59:59.000Z`,
              }))
            }
          />
        </label>
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.machineLineId ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, machineLineId: e.target.value || undefined }))}
        >
          <option value="">Tüm hatlar</option>
          {MACHINE_LINES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.sectionId ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, sectionId: e.target.value || undefined }))}
        >
          <option value="">Tüm bölümler</option>
          {MACHINE_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shortName}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.category ?? ''}
          onChange={(e) =>
            setFilter((f) => ({ ...f, category: (e.target.value || undefined) as FaultCategory | undefined }))
          }
        >
          <option value="">Tüm kategoriler</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.priority ?? ''}
          onChange={(e) =>
            setFilter((f) => ({ ...f, priority: (e.target.value || undefined) as FaultPriority | undefined }))
          }
        >
          <option value="">Tüm öncelikler</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border px-3 py-2"
          value={filter.status ?? ''}
          onChange={(e) =>
            setFilter((f) => ({ ...f, status: (e.target.value || undefined) as FaultStatus | undefined }))
          }
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ort. müdahale süresi"
          value={interventionMins.length ? `${avgIntervention} dk` : '—'}
          icon={Timer}
        />
        <KpiCard
          title="Ort. çözüm süresi"
          value={solveMins.length ? `${avgSolve} dk` : '—'}
          icon={Clock}
          tone="green"
        />
        <KpiCard title="Kritik arıza" value={critical} icon={Flame} tone="red" />
        <KpiCard title="Üretim duruşu" value={stopCount} icon={PauseCircle} tone="yellow" />
      </div>
      <p className="text-sm text-navy-700">
        {prev.length === 0
          ? data.length === 0
            ? 'Seçilen aralıkta karşılaştırılacak kayıt yok.'
            : `Bu dönemde ${data.length} kayıt var. Önceki dönemde karşılaştırma için yeterli veri yok.`
          : prev.length < 5 && Math.abs(changePct) > 80
            ? `Bu dönemde ${data.length} kayıt, önceki dönemde ${prev.length} kayıt.`
            : (
              <>
                Önceki döneme göre kayıt sayısı:{' '}
                <strong className={changePct > 0 ? 'text-red-700' : 'text-emerald-700'}>
                  %{changePct > 0 ? '+' : ''}
                  {changePct}
                </strong>
              </>
            )}
      </p>

      <article className="rounded-2xl bg-navy-900 p-4 text-white shadow-card">
        <h3 className="font-bold text-brand-yellow">Yönetici özeti</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {data.length === 0 ? (
            <li>Seçilen filtrelerde kayıt yok. Özet üretilemedi.</li>
          ) : (
            <>
              <li>
                {topSection && topSection.count > 0
                  ? `En fazla arıza ${topSection.name} bölgesinde görüldü (${topSection.count} kayıt).`
                  : 'Bölüm bazında öne çıkan bir yoğunluk yok.'}
              </li>
              <li>
                {sensorPrev === 0
                  ? `Sensör kaynaklı kayıt bu dönemde ${sensorNow} adet. Önceki dönemde karşılaştırılacak sensör kaydı yok.`
                  : `Sensör kaynaklı kayıtlar ${sensorNow} adet (önceki dönem ${sensorPrev}).`}
              </li>
              <li>
                {motorMins.length === 0 || otherMins.length === 0
                  ? 'Motor ve diğer arızalar için ortalama çözüm süresi karşılaştırması yeterli veri olmadığından gösterilmiyor.'
                  : `Motor arızalarının ortalama çözüm süresi ${motorAvg} dk, diğer arızalar ${otherAvg} dk.`}
              </li>
            </>
          )}
        </ul>
      </article>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Günlere göre hata sayısı</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" hide={byDay.length > 14} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="count" name="Hata" stroke="#12203a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Bölümlere göre dağılım</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={bySection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#12203a" name="Kayıt" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Kategori dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                  {byCat.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">En sık kök nedenler</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={roots} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip />
                <Bar dataKey="count" fill="#F5C518" name="Adet" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">En sık arızalanan parçalar</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {partsTable.map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="py-1">{p.name}</td>
                  <td className="text-right font-semibold">{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">Üretim duruşuna neden olan alanlar</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {downtime.map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="py-1">{p.name}</td>
                  <td className="text-right font-semibold">{p.stops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold">En sık kullanılan yedek parçalar</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {usedTable.length === 0 ? (
                <tr>
                  <td>Kayıt yok</td>
                </tr>
              ) : (
                usedTable.map((p) => (
                  <tr key={p.name} className="border-t">
                    <td className="py-1">{p.name}</td>
                    <td className="text-right font-semibold">{p.qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
