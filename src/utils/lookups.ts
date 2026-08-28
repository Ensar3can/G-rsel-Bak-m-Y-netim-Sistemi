import { MACHINE_LINES, MACHINE_PARTS, MACHINE_SECTIONS, USERS } from '@/data/catalog';

export function lineById(id: string) {
  return MACHINE_LINES.find((l) => l.id === id);
}

export function sectionById(id: string) {
  return MACHINE_SECTIONS.find((s) => s.id === id);
}

export function partById(id: string) {
  return MACHINE_PARTS.find((p) => p.id === id);
}

export function userById(id?: string) {
  if (!id) return undefined;
  return USERS.find((u) => u.id === id);
}
