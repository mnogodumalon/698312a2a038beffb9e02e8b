import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Testprojekte, Testausfuehrungen, Testfaelle } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [testprojekte, setTestprojekte] = useState<Testprojekte[]>([]);
  const [testausfuehrungen, setTestausfuehrungen] = useState<Testausfuehrungen[]>([]);
  const [testfaelle, setTestfaelle] = useState<Testfaelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [testprojekteData, testausfuehrungenData, testfaelleData] = await Promise.all([
        LivingAppsService.getTestprojekte(),
        LivingAppsService.getTestausfuehrungen(),
        LivingAppsService.getTestfaelle(),
      ]);
      setTestprojekte(testprojekteData);
      setTestausfuehrungen(testausfuehrungenData);
      setTestfaelle(testfaelleData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const testprojekteMap = useMemo(() => {
    const m = new Map<string, Testprojekte>();
    testprojekte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [testprojekte]);

  const testfaelleMap = useMemo(() => {
    const m = new Map<string, Testfaelle>();
    testfaelle.forEach(r => m.set(r.record_id, r));
    return m;
  }, [testfaelle]);

  return { testprojekte, setTestprojekte, testausfuehrungen, setTestausfuehrungen, testfaelle, setTestfaelle, loading, error, fetchAll, testprojekteMap, testfaelleMap };
}