const STORAGE_KEY = 'gy-fault-system-v1';
const ROLE_KEY = 'gy-fault-system-role';

export interface PersistedState {
  faultsJson: string;
  notificationsJson: string;
  seeded: boolean;
}

export const storage = {
  load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedState;
    } catch {
      return null;
    }
  },
  save(state: PersistedState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      const quota =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014);
      if (quota) {
        throw new Error('QUOTA');
      }
      throw error;
    }
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
  loadRole(): string | null {
    try {
      return localStorage.getItem(ROLE_KEY);
    } catch {
      return null;
    }
  },
  saveRole(role: string) {
    localStorage.setItem(ROLE_KEY, role);
  },
};
