import type { WorksData, Series } from '../data';

export function safeGetScore(data: WorksData | null | undefined): Series[] | undefined {
  return data?.series ?? undefined;
}