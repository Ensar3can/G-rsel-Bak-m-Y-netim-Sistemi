import type { FaultCategory } from '@/types';

/**
 * Operatör görsel bildirimi için tek kaynak.
 * Gerçek fotoğraf eklemek: dosyayı `public/machines/` altına koyun,
 * aşağıdaki `photoPath` değerini `/machines/dosya-adi.jpg` olarak güncelleyin.
 * Bileşen koduna dokunmanız gerekmez. Dosya yoksa mevcut SVG şema kullanılır.
 */
export interface MachineHotspot {
  id: string;
  label: string;
  partId: string;
  /** Yatay konum, fotoğraf genişliğinin yüzdesi (0–100). */
  x: number;
  /** Dikey konum, fotoğraf yüksekliğinin yüzdesi (0–100). */
  y: number;
  /** İsteğe bağlı dokunma alanı genişliği (%). */
  width?: number;
  /** İsteğe bağlı dokunma alanı yüksekliği (%). */
  height?: number;
  defaultCategory: FaultCategory;
}

export interface MachineSectionMap {
  sectionId: string;
  code: 'raw' | 'process' | 'quality';
  name: string;
  shortName: string;
  hint: string;
  /** SVG yer tutucu anahtarı (`machineAssets`). */
  imageKey: 'raw' | 'process' | 'quality';
  /**
   * Gerçek fotoğraf yolu, örn. `/machines/raw.jpg`.
   * Dosya henüz yoksa boş bırakın; şema otomatik kullanılır.
   */
  photoPath: string;
  defaultCategory: FaultCategory;
  hotspots: MachineHotspot[];
}

export const UNKNOWN_PART_ID = 'part-unknown';

export const MACHINE_SECTION_MAPS: MachineSectionMap[] = [
  {
    sectionId: 'sec-raw',
    code: 'raw',
    name: 'Ham madde / giriş bölümü',
    shortName: 'Giriş',
    hint: 'Sorun olan bölüme dokunun.',
    imageKey: 'raw',
    photoPath: '/machines/raw.jpg',
    defaultCategory: 'mechanical',
    hotspots: [
      { id: 'hs-raw-conveyor', label: 'Konveyör', partId: 'part-conveyor', x: 42, y: 28, defaultCategory: 'mechanical' },
      { id: 'hs-raw-sensor', label: 'Sensör', partId: 'part-sensor', x: 85, y: 38, defaultCategory: 'sensor' },
      { id: 'hs-raw-motor', label: 'Motor', partId: 'part-motor', x: 18, y: 68, defaultCategory: 'mechanical' },
      { id: 'hs-raw-belt', label: 'Kayış sistemi', partId: 'part-belt', x: 42, y: 68, defaultCategory: 'mechanical' },
      { id: 'hs-raw-electrical', label: 'Elektrik paneli', partId: 'part-electrical', x: 75, y: 68, defaultCategory: 'electrical' },
      { id: 'hs-raw-bearing', label: 'Rulman', partId: 'part-bearing', x: 28, y: 86, defaultCategory: 'mechanical' },
    ],
  },
  {
    sectionId: 'sec-process',
    code: 'process',
    name: 'Ana üretim / işlem bölümü',
    shortName: 'Üretim',
    hint: 'Sorun olan bölüme dokunun.',
    imageKey: 'process',
    photoPath: '/machines/process.jpg',
    defaultCategory: 'mechanical',
    hotspots: [
      { id: 'hs-prc-cutter', label: 'Kesici ünite', partId: 'part-cutter', x: 50, y: 32, defaultCategory: 'mechanical' },
      { id: 'hs-prc-hydraulic', label: 'Hidrolik sistem', partId: 'part-hydraulic', x: 80, y: 32, defaultCategory: 'hydraulic' },
      { id: 'hs-prc-conveyor', label: 'Konveyör', partId: 'part-conveyor', x: 50, y: 64, defaultCategory: 'mechanical' },
      { id: 'hs-prc-motor', label: 'Motor', partId: 'part-motor', x: 16, y: 86, defaultCategory: 'mechanical' },
      { id: 'hs-prc-bearing', label: 'Rulman', partId: 'part-bearing', x: 28, y: 86, defaultCategory: 'mechanical' },
      { id: 'hs-prc-electrical', label: 'Elektrik paneli', partId: 'part-electrical', x: 78, y: 78, defaultCategory: 'electrical' },
    ],
  },
  {
    sectionId: 'sec-quality',
    code: 'quality',
    name: 'Çıkış / kalite kontrol bölümü',
    shortName: 'Çıkış',
    hint: 'Sorun olan bölüme dokunun.',
    imageKey: 'quality',
    photoPath: '/machines/quality.jpg',
    defaultCategory: 'sensor',
    hotspots: [
      { id: 'hs-q-sensor', label: 'Sensör', partId: 'part-sensor', x: 56, y: 32, defaultCategory: 'sensor' },
      { id: 'hs-q-motor', label: 'Motor', partId: 'part-motor', x: 78, y: 32, defaultCategory: 'mechanical' },
      { id: 'hs-q-conveyor', label: 'Konveyör', partId: 'part-conveyor', x: 50, y: 62, defaultCategory: 'mechanical' },
      { id: 'hs-q-electrical', label: 'Elektrik paneli', partId: 'part-electrical', x: 20, y: 84, defaultCategory: 'electrical' },
      { id: 'hs-q-belt', label: 'Kayış sistemi', partId: 'part-belt', x: 72, y: 84, defaultCategory: 'mechanical' },
    ],
  },
];

export function sectionMapById(sectionId: string): MachineSectionMap | undefined {
  return MACHINE_SECTION_MAPS.find((s) => s.sectionId === sectionId);
}

export function hotspotById(sectionId: string, hotspotId: string): MachineHotspot | undefined {
  return sectionMapById(sectionId)?.hotspots.find((h) => h.id === hotspotId);
}
