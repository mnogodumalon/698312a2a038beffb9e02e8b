import type { EnrichedTestausfuehrungen, EnrichedTestfaelle } from '@/types/enriched';
import type { Testausfuehrungen, Testfaelle, Testprojekte } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface TestausfuehrungenMaps {
  testfaelleMap: Map<string, Testfaelle>;
}

export function enrichTestausfuehrungen(
  testausfuehrungen: Testausfuehrungen[],
  maps: TestausfuehrungenMaps
): EnrichedTestausfuehrungen[] {
  return testausfuehrungen.map(r => ({
    ...r,
    testfallName: resolveDisplay(r.fields.testfall, maps.testfaelleMap, 'titel'),
  }));
}

interface TestfaelleMaps {
  testprojekteMap: Map<string, Testprojekte>;
}

export function enrichTestfaelle(
  testfaelle: Testfaelle[],
  maps: TestfaelleMaps
): EnrichedTestfaelle[] {
  return testfaelle.map(r => ({
    ...r,
    projektName: resolveDisplay(r.fields.projekt, maps.testprojekteMap, 'projektname'),
  }));
}
