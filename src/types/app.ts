// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Testprojekte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    projektname?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    status?: 'geplant' | 'in_bearbeitung' | 'abgeschlossen' | 'pausiert';
  };
}

export interface Testfaelle {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    projekt?: string; // applookup -> URL zu 'Testprojekte' Record
    titel?: string;
    beschreibung?: string;
    prioritaet?: 'kritisch' | 'niedrig' | 'mittel' | 'hoch';
    erwartetes_ergebnis?: string;
  };
}

export interface Testausfuehrungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    testfall?: string; // applookup -> URL zu 'Testfaelle' Record
    ausfuehrungszeitpunkt?: string; // Format: YYYY-MM-DD oder ISO String
    tester_vorname?: string;
    tester_nachname?: string;
    tatsaechliches_ergebnis?: string;
    status?: string;
    anmerkungen?: string;
    anhang?: string;
  };
}

export const APP_IDS = {
  TESTPROJEKTE: '69831269d2f08ae9c50e685c',
  TESTFAELLE: '698312754560a97404d76b75',
  TESTAUSFUEHRUNGEN: '69831276eb4690de26587cf0',
} as const;

// Helper Types for creating new records
export type CreateTestprojekte = Testprojekte['fields'];
export type CreateTestfaelle = Testfaelle['fields'];
export type CreateTestausfuehrungen = Testausfuehrungen['fields'];