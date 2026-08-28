import { buildSeedFaults, buildSeedNotifications } from '@/data/seed';
import type { FaultRepository } from '@/services/faultRepository';
import { storage } from '@/services/storage';
import type { FaultRecord, Notification } from '@/types';

export class LocalFaultRepository implements FaultRepository {
  private faults: FaultRecord[] = [];
  private notifications: Notification[] = [];

  constructor() {
    const persisted = storage.load();
    if (persisted?.seeded) {
      this.faults = JSON.parse(persisted.faultsJson) as FaultRecord[];
      this.notifications = JSON.parse(persisted.notificationsJson) as Notification[];
    } else {
      this.faults = buildSeedFaults();
      this.notifications = buildSeedNotifications(this.faults);
      this.persist();
    }
  }

  private persist() {
    storage.save({
      seeded: true,
      faultsJson: JSON.stringify(this.faults),
      notificationsJson: JSON.stringify(this.notifications),
    });
  }

  async listFaults() {
    return [...this.faults].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getFault(id: string) {
    return this.faults.find((f) => f.id === id);
  }

  async upsertFault(record: FaultRecord) {
    const idx = this.faults.findIndex((f) => f.id === record.id);
    if (idx >= 0) this.faults[idx] = record;
    else this.faults.unshift(record);
    this.persist();
    return record;
  }

  async listNotifications() {
    return [...this.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async upsertNotification(item: Notification) {
    const idx = this.notifications.findIndex((n) => n.id === item.id);
    if (idx >= 0) this.notifications[idx] = item;
    else this.notifications.unshift(item);
    this.persist();
  }

  async replaceAll(faults: FaultRecord[], notifications: Notification[]) {
    this.faults = faults;
    this.notifications = notifications;
    this.persist();
  }
}

export const faultRepository = new LocalFaultRepository();
