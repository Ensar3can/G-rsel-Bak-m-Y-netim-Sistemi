import { MACHINE_PARTS } from '@/data/catalog';
import type {
  AIContext,
  AIRecommendation,
  CostTierRecommendation,
  FaultRecord,
  IAIRecommendationService,
} from '@/types';
import { suggestedMaterialLabels } from '@/utils/suggestedMaterials';

const DISCLAIMER =
  'Bu öneri bakım prosedürlerinin ve yetkili personel kontrolünün yerine geçmez. Sistem yalnızca karar destek aracıdır. Gerçek müdahale, kilit/etiket ve iş izinleri yetkili bakım personeli onayı ile uygulanmalıdır.';

export class RuleBasedAIRecommendationService implements IAIRecommendationService {
  async getRecommendations(fault: FaultRecord, context: AIContext): Promise<AIRecommendation> {
    const part = MACHINE_PARTS.find((p) => p.id === fault.partId);
    const similar = context.similarFaults.filter(
      (f) => f.partId === fault.partId && f.id !== fault.id,
    );
    const closedSimilar = similar.filter((f) => f.status === 'closed' || f.status === 'resolved');
    const avgMinutes =
      closedSimilar.length > 0
        ? Math.round(
            closedSimilar.reduce((s, f) => s + (f.actualRepairMinutes ?? 60), 0) /
              closedSimilar.length,
          )
        : 75;

    const materials = suggestedMaterialLabels(fault.partId);

    const economic: CostTierRecommendation = {
      title: 'Ekonomik çözüm',
      costLevel: 'low',
      estimatedCost: Math.round(fault.estimatedCost * 0.35),
      durationHint: 'Kısa vadeli (vardiya içi)',
      materials: materials.slice(0, 1),
      benefit: `${part?.name ?? 'Parça'} üzerinde temizlik, sıkma ve hizalama ile geçici stabilite.`,
      riskOrLimitation:
        'Kök neden giderilmezse 7–14 gün içinde tekrarlama olasılığı yüksektir. Üretim hızı sınırlanmalıdır.',
    };

    const balanced: CostTierRecommendation = {
      title: 'Dengeli çözüm',
      costLevel: 'medium',
      estimatedCost: Math.round(fault.estimatedCost * 0.7),
      durationHint: 'Orta vadeli (1–2 vardiya)',
      materials,
      benefit: `Aşınan elemanın değişimi ve kalibrasyon. Benzer kayıtlarda ortalama müdahale ${avgMinutes} dk.`,
      riskOrLimitation: 'Stok yoksa malzeme bekleme süresi üretim kaybını uzatabilir.',
    };

    const guaranteed: CostTierRecommendation = {
      title: 'Kesin / garantili çözüm',
      costLevel: 'high',
      estimatedCost: Math.round(fault.estimatedCost * 1.45),
      durationHint: 'Kalıcı (planlı duruş veya tam değişim)',
      materials: [...materials, 'Hizalama kiti', 'Yağlama ve sızdırmazlık seti'],
      benefit:
        'Ünite revizyonu veya OEM parça değişimi ile tekrarlama riski düşer, hat kararlılığı artar.',
      riskOrLimitation: 'Yüksek maliyet ve daha uzun duruş penceresi gerektirir.',
      productionImpact: fault.productionStopped
        ? 'Hat zaten durmuş; tam değişim için ek 90–180 dk duruş planlanmalıdır.'
        : 'Planlı duruş penceresi önerilir; canlı hatta tam değişim risklidir.',
    };

    const possibleCauses = [
      part?.typicalFailure ?? 'Aşınma belirtileri',
      fault.category === 'sensor' ? 'Kirlenme veya kablo temas sorunu' : 'Yağlama / hizalama sapması',
      fault.productionStopped ? 'Ani kilitlenme veya emniyet devre kesmesi' : 'Kademeli performans kaybı',
    ];

    return {
      id: `ai-${fault.id}`,
      generatedAt: new Date().toISOString(),
      confidence: fault.priority === 'critical' ? 0.62 : 0.74,
      possibleCauses,
      checklist: [
        'Enerji ve kilit/etiket prosedürünü doğrula',
        `${part?.name ?? 'Ünite'} görsel hasar ve ısınma kontrolü yap`,
        'Sensör ve enkoder sinyallerini izle',
        'Yedek parça stok ve uygunluk kontrolü yap',
        'Yetkili bakım onayı olmadan üniteyi çalıştırma',
      ],
      suggestedParts: materials,
      similarFaultInsights: [
        similar.length
          ? `Aynı parçada son dönemde ${similar.length} benzer kayıt bulundu.`
          : 'Bu parçada sınırlı benzer kayıt var; prosedür önceliklidir.',
        closedSimilar.length
          ? `Kapanan benzer kayıtlarda ortalama çözüm süresi ${avgMinutes} dakikadır.`
          : 'Kapanmış benzer kayıt az; saha doğrulaması kritik.',
        fault.sectionId === 'sec-process'
          ? 'Ana üretim bölümündeki duruşlar maliyet etkisini hızla yükseltir.'
          : 'Giriş/çıkış bölümü arızaları genellikle daha kısa izolasyon süresi ister.',
      ],
      economic,
      balanced,
      guaranteed,
      disclaimer: DISCLAIMER,
    };
  }
}

/** İleride gerçek model çağrısı için iskelet. API anahtarı burada tutulmaz. */
export class RemoteAIRecommendationService implements IAIRecommendationService {
  constructor(private readonly endpoint = '/api/ai/recommendations') {}

  async getRecommendations(fault: FaultRecord, context: AIContext): Promise<AIRecommendation> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faultId: fault.id, contextHint: context.similarFaults.length }),
    });
    if (!response.ok) {
      throw new Error('Yapay zekâ servisi yanıt vermedi');
    }
    return (await response.json()) as AIRecommendation;
  }
}

export const aiRecommendationService: IAIRecommendationService =
  new RuleBasedAIRecommendationService();
