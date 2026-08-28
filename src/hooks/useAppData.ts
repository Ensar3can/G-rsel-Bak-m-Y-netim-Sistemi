import { useAppStore } from '@/store/appStore';

export function useCurrentUser() {
  return useAppStore((s) => s.currentUser);
}

export function useFaults() {
  return useAppStore((s) => s.faults);
}
