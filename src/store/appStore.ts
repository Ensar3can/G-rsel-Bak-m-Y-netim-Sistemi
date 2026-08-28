import { MACHINE_PARTS, USERS } from '@/data/catalog';
import { faultRepository } from '@/services/localFaultRepository';
import { storage } from '@/services/storage';
import type { FaultRecord, Notification, Role, User } from '@/types';
import { nextFaultId } from '@/utils/format';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

interface AppState {
  hydrated: boolean;
  currentUser: User;
  faults: FaultRecord[];
  notifications: Notification[];
  toasts: Toast[];
  hydrate: () => Promise<void>;
  setRole: (role: Role) => void;
  createFault: (payload: Omit<FaultRecord, 'id' | 'statusHistory' | 'updatedAt' | 'aiRecommendations'> & { id?: string }) => Promise<FaultRecord>;
  updateFault: (id: string, patch: Partial<FaultRecord>, actorId?: string) => Promise<FaultRecord | undefined>;
  claimFault: (id: string) => Promise<void>;
  addNote: (id: string, text: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
}

const userForRole = (role: Role) => USERS.find((u) => u.role === role) ?? USERS[0];

function notify(
  item: Omit<Notification, 'id' | 'createdAt' | 'read'> & { id?: string },
): Notification {
  return {
    id: item.id ?? `n-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...item,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  currentUser: USERS[0],
  faults: [],
  notifications: [],
  toasts: [],

  hydrate: async () => {
    const [faults, notifications] = await Promise.all([
      faultRepository.listFaults(),
      faultRepository.listNotifications(),
    ]);
    const savedRole = storage.loadRole() as Role | null;
    const currentUser = savedRole ? userForRole(savedRole) : USERS[0];
    set({ faults, notifications, currentUser, hydrated: true });
  },

  setRole: (role) => {
    storage.saveRole(role);
    set({ currentUser: userForRole(role) });
  },

  pushToast: (message, tone = 'success') => {
    const id = `t-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    window.setTimeout(() => get().dismissToast(id), 4200);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  createFault: async (payload) => {
    const { faults, currentUser } = get();
    const id = payload.id ?? nextFaultId(faults);
    const now = new Date().toISOString();
    const record: FaultRecord = {
      ...payload,
      id,
      createdBy: payload.createdBy || currentUser.id,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      status: 'new',
      statusHistory: [
        { status: 'new', at: now, by: payload.createdBy || currentUser.id, note: 'Yeni bildirim' },
      ],
      attachments: payload.attachments ?? [],
      maintenanceNotes: payload.maintenanceNotes ?? [],
      spareParts: payload.spareParts ?? [],
    };
    await faultRepository.upsertFault(record);
    const n = notify({
      type: record.priority === 'critical' ? 'new_critical' : 'new_fault',
      title: record.priority === 'critical' ? 'Yeni kritik arıza kaydı oluşturuldu' : 'Yeni arıza kaydı',
      message: `${record.id}: ${MACHINE_PARTS.find((p) => p.id === record.partId)?.name ?? 'Parça'} bildirildi.`,
      faultId: record.id,
    });
    await faultRepository.upsertNotification(n);
    set((s) => ({
      faults: [record, ...s.faults],
      notifications: [n, ...s.notifications],
    }));
    get().pushToast(`${record.id} kaydı oluşturuldu.`);
    return record;
  },

  updateFault: async (id, patch, actorId) => {
    const current = get().faults.find((f) => f.id === id);
    if (!current) return undefined;
    const actor = actorId ?? get().currentUser.id;
    const now = new Date().toISOString();
    const next: FaultRecord = {
      ...current,
      ...patch,
      updatedAt: now,
    };
    if (patch.status && patch.status !== current.status) {
      next.statusHistory = [
        ...current.statusHistory,
        { status: patch.status, at: now, by: actor, note: patch.resolutionSummary },
      ];
    }
    await faultRepository.upsertFault(next);

    let extra: Notification | undefined;
    if (patch.status === 'closed') {
      extra = notify({
        type: 'closed',
        title: 'Arıza kapatıldı',
        message: `${next.id} kaydı kapatıldı.`,
        faultId: next.id,
      });
    } else if (patch.status === 'waiting_parts') {
      extra = notify({
        type: 'waiting',
        title: 'Arıza çözüm bekliyor',
        message: `${next.id} malzeme bekliyor.`,
        faultId: next.id,
      });
    }
    if (extra) await faultRepository.upsertNotification(extra);

    set((s) => ({
      faults: s.faults.map((f) => (f.id === id ? next : f)),
      notifications: extra ? [extra, ...s.notifications] : s.notifications,
    }));
    return next;
  },

  claimFault: async (id) => {
    const user = get().currentUser;
    await get().updateFault(id, { status: 'reviewing', assignedTo: user.id }, user.id);
    const n = notify({
      type: 'claimed',
      title: 'Bir bakım personeli arızayı üzerine aldı',
      message: `${user.name}, ${id} kaydını üzerine aldı.`,
      faultId: id,
    });
    await faultRepository.upsertNotification(n);
    set((s) => ({ notifications: [n, ...s.notifications] }));
    get().pushToast('Kayıt üzerinize alındı.');
  },

  addNote: async (id, text) => {
    const user = get().currentUser;
    const current = get().faults.find((f) => f.id === id);
    if (!current) return;
    await get().updateFault(id, {
      maintenanceNotes: [
        ...current.maintenanceNotes,
        { id: `note-${Date.now()}`, authorId: user.id, text, createdAt: new Date().toISOString() },
      ],
    });
    get().pushToast('Bakım notu eklendi.');
  },

  markNotificationsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    for (const n of updated) {
      await faultRepository.upsertNotification(n);
    }
    set({ notifications: updated });
  },
}));
