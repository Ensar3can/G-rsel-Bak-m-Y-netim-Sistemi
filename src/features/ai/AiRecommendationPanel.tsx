import { CATEGORY_LABELS, MACHINE_LINES, SPARE_PARTS } from '@/data/catalog';
import { aiRecommendationService } from '@/services/aiRecommendationService';
import type { AIRecommendation, FaultRecord } from '@/types';
import { formatMoney } from '@/utils/format';
import { AlertTriangle, CheckSquare, Package, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sectionById } from '@/utils/lookups';

export function AiRecommendationPanel({
  fault,
  similar,
}: {
  fault: FaultRecord;
  similar: FaultRecord[];
}) {
  const [data, setData] = useState<AIRecommendation | null>(fault.aiRecommendations ?? null);
  const [loading, setLoading] = useState(!fault.aiRecommendations);

  useEffect(() => {
    let cancelled = false;
    if (fault.aiRecommendations) {
      setData(fault.aiRecommendations);
      setLoading(false);
      return;
    }
    setLoading(true);
    void aiRecommendationService
      .getRecommendations(fault, { similarFaults: similar, catalogParts: [] })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fault, similar]);

  if (loading || !data) {
    return <div className="rounded-2xl bg-white p-4 shadow-card">Yapay zekâ önerileri hazırlanıyor…</div>;
  }

  const tiers = [data.economic, data.balanced, data.guaranteed];
  const section = sectionById(fault.sectionId);

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Yapay Zekâ Önerileri</h2>
          <p className="text-sm text-navy-600">
            {MACHINE_LINES.find((l) => l.id === fault.machineLineId)?.name} · {section?.shortName} ·{' '}
            {CATEGORY_LABELS[fault.category]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-navy-500">Güven seviyesi</p>
          <p className="text-xl font-bold">{Math.round(data.confidence * 100)}%</p>
          <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full bg-brand-yellow" style={{ width: `${data.confidence * 100}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
        <ShieldAlert className="mt-0.5 shrink-0" size={18} />
        {data.disclaimer}
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.title} className="rounded-2xl border border-navy-100 p-3">
            <p className="text-xs font-semibold uppercase text-navy-500">
              {tier.costLevel === 'low' ? 'Düşük maliyet' : tier.costLevel === 'medium' ? 'Orta maliyet' : 'Yüksek maliyet'}
            </p>
            <h3 className="font-bold">{tier.title}</h3>
            <p className="text-sm text-navy-600">{tier.durationHint}</p>
            <p className="mt-2 text-lg font-bold text-navy-900">{formatMoney(tier.estimatedCost)}</p>
            <p className="mt-2 text-sm">{tier.benefit}</p>
            <ul className="mt-2 list-disc pl-4 text-sm text-navy-700">
              {tier.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-red-700">
              <AlertTriangle size={12} className="mr-1 inline" />
              {tier.riskOrLimitation}
            </p>
            {tier.productionImpact ? <p className="mt-1 text-xs text-navy-600">{tier.productionImpact}</p> : null}
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold">Olası arıza nedenleri</h3>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {data.possibleCauses.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-1 font-semibold">
            <CheckSquare size={16} /> Önerilen kontrol listesi
          </h3>
          <ol className="mt-1 list-decimal pl-5 text-sm">
            {data.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="flex items-center gap-1 font-semibold">
            <Package size={16} /> Gerekli olabilecek yedek parçalar
          </h3>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {data.suggestedParts.map((p) => (
              <li key={p}>
                {p}
                {SPARE_PARTS.find((s) => p.includes(s.sku))
                  ? ` · stok ${SPARE_PARTS.find((s) => p.includes(s.sku))?.stock}`
                  : ''}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Benzer kayıtlardan içgörüler</h3>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {data.similarFaultInsights.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
