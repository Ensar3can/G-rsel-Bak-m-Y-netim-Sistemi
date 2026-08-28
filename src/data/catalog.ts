import type {
  MachineLine,
  MachinePart,
  MachineSection,
  SparePart,
  User,
} from '@/types';

export const USERS: User[] = [
  { id: 'u-op-1', name: 'Mehmet Yıldız', role: 'operator', shift: 'A Vardiyası', department: 'Üretim' },
  { id: 'u-op-2', name: 'Ayşe Demir', role: 'operator', shift: 'B Vardiyası', department: 'Üretim' },
  { id: 'u-mt-1', name: 'Hasan Korkmaz', role: 'maintenance', shift: 'A Vardiyası', department: 'Bakım' },
  { id: 'u-mt-2', name: 'Elif Şahin', role: 'maintenance', shift: 'B Vardiyası', department: 'Bakım' },
  { id: 'u-mg-1', name: 'Selim Arslan', role: 'manager', shift: 'Gündüz', department: 'Üretim Yönetimi' },
  { id: 'u-ad-1', name: 'Deniz Aksoy', role: 'admin', shift: 'Gündüz', department: 'Bilgi Sistemleri' },
];

export const ROLE_LABELS: Record<User['role'], string> = {
  operator: 'Operatör',
  maintenance: 'Bakım personeli',
  manager: 'Yönetici',
  admin: 'Sistem yöneticisi',
};

export const MACHINE_LINES: MachineLine[] = [
  {
    id: 'line-a',
    code: 'HAT-A',
    name: 'Kalender ve Kompound Hattı',
    hall: 'Salon 1',
    description: 'Ham kauçuk ve dolgu karışımının hazırlandığı hat.',
  },
  {
    id: 'line-b',
    code: 'HAT-B',
    name: 'Kesim ve Birleştirme Hattı',
    hall: 'Salon 2',
    description: 'Karkas katmanlarının kesilip birleştirildiği hat.',
  },
  {
    id: 'line-c',
    code: 'HAT-C',
    name: 'Vulkanizasyon ve Final Hat',
    hall: 'Salon 3',
    description: 'Pişirme, kalite kontrol ve çıkış hattı.',
  },
];

export const MACHINE_SECTIONS: MachineSection[] = [
  {
    id: 'sec-raw',
    lineId: '*',
    code: 'raw',
    name: 'Ham madde / giriş bölümü',
    shortName: 'Bölüm 1 · Giriş',
    description: 'Malzeme besleme, tartım ve ilk konveyör.',
    imageKey: 'raw',
  },
  {
    id: 'sec-process',
    lineId: '*',
    code: 'process',
    name: 'Ana üretim / işlem bölümü',
    shortName: 'Bölüm 2 · Üretim',
    description: 'Ana proses, silindir, kesici ve hidrolik üniteler.',
    imageKey: 'process',
  },
  {
    id: 'sec-quality',
    lineId: '*',
    code: 'quality',
    name: 'Çıkış / kalite kontrol bölümü',
    shortName: 'Bölüm 3 · Çıkış',
    description: 'Ölçüm, görsel kontrol ve paletleme.',
    imageKey: 'quality',
  },
];

export const MACHINE_PARTS: MachinePart[] = [
  { id: 'part-motor', name: 'Motor', code: 'MTR', typicalFailure: 'Aşırı ısınma, rulman sesi' },
  { id: 'part-belt', name: 'Kayış sistemi', code: 'BELT', typicalFailure: 'Kayma, kopma, hizalama' },
  { id: 'part-sensor', name: 'Sensör', code: 'SNS', typicalFailure: 'Yanlış okuma, kablo kopuğu' },
  { id: 'part-conveyor', name: 'Konveyör', code: 'CNV', typicalFailure: 'Durma, sapma, tıkınma' },
  { id: 'part-hydraulic', name: 'Hidrolik sistem', code: 'HYD', typicalFailure: 'Basınç kaybı, sızıntı' },
  { id: 'part-electrical', name: 'Elektrik paneli', code: 'ELP', typicalFailure: 'Kontaktör, sigorta, ısınma' },
  { id: 'part-cutter', name: 'Kesici ünite', code: 'CUT', typicalFailure: 'Bıçak aşınması, hizasızlık' },
  { id: 'part-bearing', name: 'Rulman', code: 'BRG', typicalFailure: 'Gürültü, titreşim, kilitlenme' },
];

export const SPARE_PARTS: SparePart[] = [
  { id: 'sp-1', sku: 'GY-MTR-18', name: 'Sürücü motor 18.5 kW', category: 'Motor', stock: 2 },
  { id: 'sp-2', sku: 'GY-BELT-2100', name: 'Konveyör kayışı 2100 mm', category: 'Kayış', stock: 6 },
  { id: 'sp-3', sku: 'GY-SNS-PX', name: 'Fotoelektrik sensör', category: 'Sensör', stock: 14 },
  { id: 'sp-4', sku: 'GY-BRG-6310', name: 'Rulman 6310-2RS', category: 'Rulman', stock: 20 },
  { id: 'sp-5', sku: 'GY-HYD-VLV', name: 'Hidrolik valf grubu', category: 'Hidrolik', stock: 3 },
  { id: 'sp-6', sku: 'GY-CNT-40', name: 'Kontaktör 40A', category: 'Elektrik', stock: 8 },
  { id: 'sp-7', sku: 'GY-BLD-C', name: 'Kesici bıçak seti', category: 'Kesici', stock: 4 },
  { id: 'sp-8', sku: 'GY-ENC-ABS', name: 'Mutlak enkoder', category: 'Otomasyon', stock: 5 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  mechanical: 'Mekanik',
  electrical: 'Elektrik',
  sensor: 'Sensör / otomasyon',
  hydraulic: 'Hidrolik',
  software: 'Yazılım / kontrol',
  safety: 'Güvenlik',
  other: 'Diğer',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'Yeni',
  reviewing: 'İnceleniyor',
  waiting_parts: 'Malzeme Bekleniyor',
  in_progress: 'Müdahale Ediliyor',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

export const ROOT_CAUSES = [
  'Aşınma / yıpranma',
  'Yanlış hizalama',
  'Yetersiz yağlama',
  'Elektrik dalgalanması',
  'Sensör kalibrasyon sapması',
  'Operatör kullanım hatası',
  'Malzeme kalitesi',
  'Yazılım parametre sapması',
  'Hidrolik kaçak',
  'Planlı bakım gecikmesi',
] as const;
