/** Makine görselleri merkezi katalog. Gerçek fotoğraflar bu anahtarlarla değiştirilir. */

export const MACHINE_IMAGE_KEYS = {
  lineOverview: '/assets/machines/line-overview.svg',
  raw: '/assets/machines/section-raw.svg',
  process: '/assets/machines/section-process.svg',
  quality: '/assets/machines/section-quality.svg',
} as const;

export type MachineImageKey = keyof typeof MACHINE_IMAGE_KEYS;
