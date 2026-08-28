import type { FaultRecord, Notification } from '@/types';

/**
 * Veri erişim sözleşmesi.
 * Demo: LocalFaultRepository. Üretim: RestFaultRepository / SupabaseFaultRepository.
 */
export interface FaultRepository {
  listFaults(): Promise<FaultRecord[]>;
  getFault(id: string): Promise<FaultRecord | undefined>;
  upsertFault(record: FaultRecord): Promise<FaultRecord>;
  listNotifications(): Promise<Notification[]>;
  upsertNotification(item: Notification): Promise<void>;
  replaceAll(faults: FaultRecord[], notifications: Notification[]): Promise<void>;
}
