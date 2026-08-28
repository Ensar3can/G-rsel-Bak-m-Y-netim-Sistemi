import type { FaultCategory, FaultPriority } from '@/types';

export const NOTICE_OPTIONS = [
  { id: 'stopped', label: 'Makine durdu' },
  { id: 'noise', label: 'Anormal ses / titreşim' },
  { id: 'leak', label: 'Sızıntı' },
  { id: 'heat', label: 'Isınma / koku' },
  { id: 'sensor', label: 'Sensör / ışık uyarısı' },
  { id: 'broken', label: 'Kırık / gevşek parça' },
  { id: 'other', label: 'Diğer' },
] as const;

export type NoticeId = (typeof NOTICE_OPTIONS)[number]['id'];
export type StopAnswer = 'yes' | 'no' | 'unsure';

export function noticeLabel(id: NoticeId): string {
  return NOTICE_OPTIONS.find((n) => n.id === id)?.label ?? 'Diğer';
}

export function deriveCategory(params: {
  hotspotCategory?: FaultCategory;
  sectionCategory?: FaultCategory;
  noticeId: NoticeId;
  unknownPart: boolean;
}): FaultCategory {
  if (params.unknownPart) return 'other';
  if (params.noticeId === 'sensor') return 'sensor';
  if (params.noticeId === 'leak') return params.hotspotCategory === 'hydraulic' ? 'hydraulic' : 'mechanical';
  return params.hotspotCategory ?? params.sectionCategory ?? 'mechanical';
}

export function derivePriority(params: { stop: StopAnswer; noticeId: NoticeId }): FaultPriority {
  if (params.stop === 'yes' || params.noticeId === 'stopped') return 'critical';
  if (params.stop === 'unsure') return 'high';
  if (params.noticeId === 'heat' || params.noticeId === 'leak' || params.noticeId === 'broken') return 'high';
  if (params.noticeId === 'noise' || params.noticeId === 'sensor') return 'medium';
  return 'medium';
}
