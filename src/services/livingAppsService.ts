// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Testprojekte, Testfaelle, Testausfuehrungen } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- TESTPROJEKTE ---
  static async getTestprojekte(): Promise<Testprojekte[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTPROJEKTE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTestprojekteEntry(id: string): Promise<Testprojekte | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTPROJEKTE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTestprojekteEntry(fields: Testprojekte['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TESTPROJEKTE}/records`, { fields });
  }
  static async updateTestprojekteEntry(id: string, fields: Partial<Testprojekte['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TESTPROJEKTE}/records/${id}`, { fields });
  }
  static async deleteTestprojekteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TESTPROJEKTE}/records/${id}`);
  }

  // --- TESTFAELLE ---
  static async getTestfaelle(): Promise<Testfaelle[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTFAELLE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTestfaelleEntry(id: string): Promise<Testfaelle | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTFAELLE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTestfaelleEntry(fields: Testfaelle['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TESTFAELLE}/records`, { fields });
  }
  static async updateTestfaelleEntry(id: string, fields: Partial<Testfaelle['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TESTFAELLE}/records/${id}`, { fields });
  }
  static async deleteTestfaelleEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TESTFAELLE}/records/${id}`);
  }

  // --- TESTAUSFUEHRUNGEN ---
  static async getTestausfuehrungen(): Promise<Testausfuehrungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTAUSFUEHRUNGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTestausfuehrungenEntry(id: string): Promise<Testausfuehrungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TESTAUSFUEHRUNGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTestausfuehrungenEntry(fields: Testausfuehrungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TESTAUSFUEHRUNGEN}/records`, { fields });
  }
  static async updateTestausfuehrungenEntry(id: string, fields: Partial<Testausfuehrungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TESTAUSFUEHRUNGEN}/records/${id}`, { fields });
  }
  static async deleteTestausfuehrungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TESTAUSFUEHRUNGEN}/records/${id}`);
  }

}