import { SPARE_PARTS } from '@/data/catalog';

/** Parça koduna göre olası yedek malzeme SKU’ları. */
const SKU_BY_PART: Record<string, string[]> = {
  'part-motor': ['GY-MTR-18', 'GY-BRG-6310'],
  'part-belt': ['GY-BELT-2100'],
  'part-sensor': ['GY-SNS-PX'],
  'part-conveyor': ['GY-BELT-2100', 'GY-BRG-6310'],
  'part-hydraulic': ['GY-HYD-VLV'],
  'part-electrical': ['GY-CNT-40'],
  'part-cutter': ['GY-BLD-C'],
  'part-bearing': ['GY-BRG-6310'],
  'part-unknown': [],
};

export function suggestedSkusForPart(partId: string): string[] {
  return SKU_BY_PART[partId] ?? [];
}

export function suggestedMaterialLabels(partId: string): string[] {
  return suggestedSkusForPart(partId).map((sku) => {
    const sp = SPARE_PARTS.find((p) => p.sku === sku);
    return sp ? `${sp.name} (${sp.sku})` : sku;
  });
}
