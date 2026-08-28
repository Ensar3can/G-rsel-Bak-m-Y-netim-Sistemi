import lineOverview from '@/assets/machines/line-overview.svg?raw';
import photoPlaceholder from '@/assets/machines/photo-placeholder.svg?raw';
import process from '@/assets/machines/section-process.svg?raw';
import quality from '@/assets/machines/section-quality.svg?raw';
import raw from '@/assets/machines/section-raw.svg?raw';

/** Yerel SVG şemaları Vite `?raw` ile gömülür; kırık img ikonu oluşmaz. */
export const MACHINE_IMAGE_SVG: Record<string, string> = {
  lineOverview,
  raw,
  process,
  quality,
  photoPlaceholder,
};

export const MACHINE_IMAGE_KEYS = {
  lineOverview: 'lineOverview',
  raw: 'raw',
  process: 'process',
  quality: 'quality',
  photoPlaceholder: 'photoPlaceholder',
} as const;

export type MachineImageKey = keyof typeof MACHINE_IMAGE_KEYS;
