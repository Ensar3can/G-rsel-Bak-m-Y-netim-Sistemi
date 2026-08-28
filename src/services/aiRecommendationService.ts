import { MACHINE_PARTS } from '@/data/catalog';
import type {
  AIContext,
  AIRecommendation,
  FaultRecord,
  IAIRecommendationService,
  SolutionOption,
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

    const quick: SolutionOption = {
      title: 'Hızlı Müdahale',
      applicability: 'Belirti yeni başladıysa veya hat kısa süreli stabilize edilebiliyorsa uygundur.',
      durationHint: `Tahmini müdahale: ${Math.max(20, Math.round(avgMinutes * 0.45))} dk (vardiya içi)`,
      productionImpact: fault.productionStopped
        ? 'Hat durmuş durumda; önce emniyet izolasyonu, ardından geçici çalıştırma değerlendirmesi.'
        : 'Hız düşürülerek üretim sürdürülebilir; kalıcı onarım ertelenebilir.',
      materials: materials.slice(0, 1),
      steps: [
        'Kilit/etiket ve enerji kesimini doğrula',
        `${part?.name ?? 'Ünite'} görsel ve ısınma kontrolü yap`,
        'Temizlik, sıkma ve hizalama dene',
      ],
      riskOrLimitation:
        'Kök neden giderilmezse 7–14 gün içinde tekrarlama olasılığı yüksektir. Üretim hızı sınırlanmalıdır.',
    };

    const standard: SolutionOption = {
      title: 'Standart Çözüm',
      applicability: 'Aşınma doğrulandıysa ve yedek parça stokta varsa tercih edilir.',
      durationHint: `Tahmini müdahale: ${avgMinutes} dk (1–2 vardiya)`,
      productionImpact: 'Kısa planlı duruş ile hat normale döner; kalibrasyon sonrası izleme gerekir.',
      materials,
      steps: [
        'Aşınan elemanı sök ve uygun yedekle değiştir',
        'Sensör/enkoder kalibrasyonunu doğrula',
        'Deneme çalıştırması ve titreşim kontrolü yap',
      ],
      riskOrLimitation: 'Stok yoksa malzeme bekleme süresi üretim kaybını uzatabilir.',
    };

    const comprehensive: SolutionOption = {
      title: 'Kapsamlı Çözüm',
      applicability: 'Tekrarlayan arıza, kritik duruş veya OEM revizyon gerektiğinde uygulanır.',
      durationHint: 'Tahmini müdahale: 90–180 dk (planlı duruş veya tam değişim)',
      productionImpact: fault.productionStopped
        ? 'Hat zaten durmuş; tam değişim için ek duruş penceresi planlanmalıdır.'
        : 'Canlı hatta tam değişim risklidir; planlı duruş önerilir.',
      materials: [...materials, 'Hizalama kiti', 'Yağlama ve sızdırmazlık seti'],
      steps: [
        'Ünite revizyonu veya OEM parça değişimini planla',
        'Hizalama ve yağlama prosedürünü uygula',
        'Yetkili bakım onayı ile hattı kademeli devreye al',
      ],
      riskOrLimitation: 'Daha uzun duruş penceresi ve daha geniş saha hazırlığı gerektirir.',
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
          ? 'Ana üretim bölümündeki duruşlar diğer bölümlere göre daha hızlı yayılır.'
          : 'Giriş/çıkış bölümü arızaları genellikle daha kısa izolasyon süresi ister.',
      ],
      quick,
      standard,
      comprehensive,
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
