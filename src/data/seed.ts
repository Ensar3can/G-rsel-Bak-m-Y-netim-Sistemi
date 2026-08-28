import { MACHINE_LINES, MACHINE_PARTS, MACHINE_SECTIONS, USERS } from '@/data/catalog';
import type {
  Attachment,
  FaultCategory,
  FaultPriority,
  FaultRecord,
  FaultStatus,
  Notification,
} from '@/types';

const PHOTO: Attachment = {
  id: 'att-seed',
  name: 'saha-foto.jpg',
  kind: 'photo',
  url: '/assets/machines/photo-placeholder.svg',
  createdAt: '2026-08-01T08:00:00.000Z',
};

const symptoms: Record<string, string> = {
  'part-motor': 'Motor gövdesinde ısınma ve tiz rulman sesi',
  'part-belt': 'Kayışta sapma ve periyodik gıcırdama',
  'part-sensor': 'Sensör aralıklı false-stop üretiyor',
  'part-conveyor': 'Konveyör duruyor, ürün birikmesi oluşuyor',
  'part-hydraulic': 'Basınç düşüşü ve yağ sızıntısı',
  'part-electrical': 'Panelde ısınma ve kontaktör çekme gecikmesi',
  'part-cutter': 'Kesim hattında çapak ve ölçü sapması',
  'part-bearing': 'Yüksek titreşim ve metalik tıkırtı',
};

const categoriesByPart: Record<string, FaultCategory> = {
  'part-motor': 'mechanical',
  'part-belt': 'mechanical',
  'part-sensor': 'sensor',
  'part-conveyor': 'mechanical',
  'part-hydraulic': 'hydraulic',
  'part-electrical': 'electrical',
  'part-cutter': 'mechanical',
  'part-bearing': 'mechanical',
};

const titles: Record<string, string> = {
  'part-motor': 'Motor aşırı ısınma',
  'part-belt': 'Kayış hizasızlığı',
  'part-sensor': 'Sensör yanlış tetikleme',
  'part-conveyor': 'Konveyör duruşu',
  'part-hydraulic': 'Hidrolik basınç kaybı',
  'part-electrical': 'Elektrik paneli arızası',
  'part-cutter': 'Kesici ünite sapması',
  'part-bearing': 'Rulman gürültüsü',
};

function isoDaysAgo(days: number, hour = 8, minute = 15): string {
  const d = new Date('2026-08-27T12:00:00+03:00');
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const statuses: FaultStatus[] = [
  'new',
  'reviewing',
  'waiting_parts',
  'in_progress',
  'resolved',
  'closed',
];
const priorities: FaultPriority[] = ['low', 'medium', 'high', 'critical'];

function makeFault(index: number): FaultRecord {
  const line = MACHINE_LINES[index % MACHINE_LINES.length];
  const section = MACHINE_SECTIONS[index % MACHINE_SECTIONS.length];
  const part = MACHINE_PARTS[index % MACHINE_PARTS.length];
  const status = statuses[index % statuses.length];
  const priority = priorities[(index * 3) % priorities.length];
  const daysAgo = (index * 2) % 40;
  const createdAt = isoDaysAgo(daysAgo, 7 + (index % 10), (index * 7) % 50);
  const operator = USERS[index % 2];
  const maint = USERS[2 + (index % 2)];
  const stopped = priority === 'critical' || (index % 4 === 0 && priority === 'high');
  const assigned = status === 'new' ? undefined : maint.id;
  const category: FaultCategory =
    index % 11 === 0 ? 'software' : index % 13 === 0 ? 'safety' : categoriesByPart[part.id];

  const history: FaultRecord['statusHistory'] = [
    { status: 'new' as FaultStatus, at: createdAt, by: operator.id, note: 'Operatör bildirimi' },
  ];
  if (status !== 'new') {
    history.push({
      status: 'reviewing',
      at: isoDaysAgo(Math.max(0, daysAgo - 0.1), 9, 0),
      by: maint.id,
      note: 'Kayıt üzerine alındı',
    });
  }
  if (['waiting_parts', 'in_progress', 'resolved', 'closed'].includes(status)) {
    history.push({
      status: status === 'waiting_parts' ? 'waiting_parts' : 'in_progress',
      at: isoDaysAgo(Math.max(0, daysAgo - 0.3), 11, 20),
      by: maint.id,
    });
  }
  if (status === 'resolved' || status === 'closed') {
    history.push({ status: 'resolved', at: isoDaysAgo(Math.max(0, daysAgo - 1), 16, 40), by: maint.id });
  }
  if (status === 'closed') {
    history.push({ status: 'closed', at: isoDaysAgo(Math.max(0, daysAgo - 1), 17, 10), by: maint.id });
  }

  const eta = status === 'new' || status === 'closed' ? undefined : 45 + (index % 6) * 15;
  const actual =
    status === 'resolved' || status === 'closed' ? 30 + (index % 8) * 12 : undefined;
  const costBase: Record<string, number> = {
    'part-motor': 8500,
    'part-belt': 2400,
    'part-sensor': 1600,
    'part-conveyor': 4200,
    'part-hydraulic': 7800,
    'part-electrical': 3100,
    'part-cutter': 5600,
    'part-bearing': 1200,
  };

  return {
    id: `GY-2026-${String(1001 + index).padStart(4, '0')}`,
    title: `${line.code} · ${titles[part.id]}`,
    machineLineId: line.id,
    sectionId: section.id,
    partId: part.id,
    category,
    priority,
    description: `${section.shortName} üzerinde ${part.name.toLowerCase()} kaynaklı duruş riski. ${symptoms[part.id]}. Vardiya notu: hat hızı ${80 + (index % 15)} m/dk iken belirti başladı.`,
    symptom: symptoms[part.id],
    productionStopped: stopped,
    status,
    createdAt,
    updatedAt: history[history.length - 1].at,
    occurredAt: createdAt,
    createdBy: operator.id,
    assignedTo: assigned,
    attachments: [{ ...PHOTO, id: `att-${index}`, createdAt }],
    maintenanceNotes:
      status === 'new'
        ? []
        : [
            {
              id: `note-${index}`,
              authorId: maint.id,
              text: 'Saha kontrolünde titreşim ve ısınma doğrulandı. Yedek parça stok durumu kontrol edilecek.',
              createdAt: isoDaysAgo(Math.max(0, daysAgo), 10, 5),
            },
          ],
    rootCause:
      status === 'resolved' || status === 'closed'
        ? index % 2 === 0
          ? 'Aşınma / yıpranma'
          : 'Yanlış hizalama'
        : undefined,
    estimatedRepairMinutes: eta,
    actualRepairMinutes: actual,
    estimatedCompletionAt:
      status === 'in_progress' || status === 'waiting_parts'
        ? isoDaysAgo(0, 18, 0)
        : undefined,
    spareParts:
      status === 'waiting_parts' || status === 'resolved' || status === 'closed'
        ? [
            {
              id: `use-${index}`,
              sparePartId: ['sp-4', 'sp-2', 'sp-3', 'sp-6'][index % 4],
              quantity: 1 + (index % 2),
              unitCost: [890, 3800, 1450, 2100][index % 4],
            },
          ]
        : [],
    estimatedCost: costBase[part.id] + (stopped ? 6500 : 800),
    visualLocation: {
      lineId: line.id,
      sectionId: section.id,
      partId: part.id,
      hotspotX: 22 + (index % 5) * 14,
      hotspotY: 30 + (index % 3) * 18,
    },
    statusHistory: history,
    resolutionSummary:
      status === 'resolved' || status === 'closed'
        ? 'Parça kontrolü ve hizalama sonrası hat tekrar devreye alındı.'
        : undefined,
  };
}

export function buildSeedFaults(): FaultRecord[] {
  const generated = Array.from({ length: 22 }, (_, i) => makeFault(i));
  // Bugün açılan ve acil kayıtların görünür olması için birkaç güncel kayıt
  generated.push(
    {
      ...makeFault(22),
      id: 'GY-2026-1023',
      title: 'HAT-C · Kritik konveyör duruşu',
      machineLineId: 'line-c',
      sectionId: 'sec-process',
      partId: 'part-conveyor',
      category: 'mechanical',
      priority: 'critical',
      status: 'new',
      productionStopped: true,
      createdAt: isoDaysAgo(0, 8, 40),
      updatedAt: isoDaysAgo(0, 8, 40),
      occurredAt: isoDaysAgo(0, 8, 32),
      assignedTo: undefined,
      estimatedCost: 12800,
      description:
        'Ana üretim konveyörü ani durdu. Ürün birikmesi başladı, hat kırmızı duruşta. Motor çekiyor ancak bant hareket etmiyor.',
      symptom: 'Konveyör tamamen durdu, ürün birikmesi',
    },
    {
      ...makeFault(23),
      id: 'GY-2026-1024',
      title: 'HAT-A · Sensör false-stop',
      machineLineId: 'line-a',
      sectionId: 'sec-quality',
      partId: 'part-sensor',
      category: 'sensor',
      priority: 'high',
      status: 'reviewing',
      productionStopped: false,
      createdAt: isoDaysAgo(0, 7, 10),
      updatedAt: isoDaysAgo(0, 7, 25),
      occurredAt: isoDaysAgo(0, 7, 5),
      assignedTo: 'u-mt-1',
      estimatedCost: 2100,
      description:
        'Kalite çıkış fotoceli toz nedeniyle yanlış tetikliyor. Hat kısa duruşlar yaşıyor.',
      symptom: 'Sensör aralıklı false-stop',
    },
  );
  return generated;
}

export function buildSeedNotifications(faults: FaultRecord[]): Notification[] {
  const critical = faults.find((f) => f.priority === 'critical' && f.status === 'new');
  return [
    {
      id: 'n-1',
      type: 'new_critical',
      title: 'Yeni kritik arıza',
      message: `${critical?.id ?? 'GY-2026-1023'} kaydı oluşturuldu. Üretim durmuş durumda.`,
      faultId: critical?.id,
      createdAt: isoDaysAgo(0, 8, 41),
      read: false,
    },
    {
      id: 'n-2',
      type: 'claimed',
      title: 'Arıza üzerine alındı',
      message: 'Hasan Korkmaz, GY-2026-1024 kaydını üzerine aldı.',
      faultId: 'GY-2026-1024',
      createdAt: isoDaysAgo(0, 7, 25),
      read: false,
    },
    {
      id: 'n-3',
      type: 'waiting',
      title: 'Arıza çözüm bekliyor',
      message: 'Malzeme bekleyen kayıtlar bakım panosunda birikti.',
      createdAt: isoDaysAgo(1, 16, 0),
      read: true,
    },
    {
      id: 'n-4',
      type: 'closed',
      title: 'Arıza kapatıldı',
      message: 'GY-2026-1006 kaydı kapatıldı ve hat serbest bırakıldı.',
      createdAt: isoDaysAgo(2, 17, 12),
      read: true,
    },
    {
      id: 'n-5',
      type: 'overdue_critical',
      title: 'Kritik arıza bekliyor',
      message: 'Kritik bir kayıt 30 dakikadır müdahale bekliyor.',
      faultId: critical?.id,
      createdAt: isoDaysAgo(0, 9, 12),
      read: false,
    },
  ];
}
