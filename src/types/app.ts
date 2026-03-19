// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Testprojekte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    projektname?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    status?: LookupValue;
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
    status?: LookupValue;
    anmerkungen?: string;
    anhang?: string;
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
    prioritaet?: LookupValue;
    erwartetes_ergebnis?: string;
  };
}

export const APP_IDS = {
  TESTPROJEKTE: '69831269d2f08ae9c50e685c',
  TESTAUSFUEHRUNGEN: '69831276eb4690de26587cf0',
  TESTFAELLE: '698312754560a97404d76b75',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  testprojekte: {
    status: [{ key: "geplant", label: "Geplant" }, { key: "in_bearbeitung", label: "In Bearbeitung" }, { key: "abgeschlossen", label: "Abgeschlossen" }, { key: "pausiert", label: "Pausiert" }],
  },
  testausfuehrungen: {
    status: [{ key: "bestanden", label: "Bestanden" }, { key: "fehlgeschlagen", label: "Fehlgeschlagen" }, { key: "blockiert", label: "Blockiert" }],
  },
  testfaelle: {
    prioritaet: [{ key: "niedrig", label: "Niedrig" }, { key: "mittel", label: "Mittel" }, { key: "hoch", label: "Hoch" }, { key: "kritisch", label: "Kritisch" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'testprojekte': {
    'projektname': 'string/text',
    'beschreibung': 'string/textarea',
    'startdatum': 'date/date',
    'status': 'lookup/select',
  },
  'testausfuehrungen': {
    'testfall': 'applookup/select',
    'ausfuehrungszeitpunkt': 'date/datetimeminute',
    'tester_vorname': 'string/text',
    'tester_nachname': 'string/text',
    'tatsaechliches_ergebnis': 'string/textarea',
    'status': 'lookup/radio',
    'anmerkungen': 'string/textarea',
    'anhang': 'file',
  },
  'testfaelle': {
    'projekt': 'applookup/select',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'prioritaet': 'lookup/select',
    'erwartetes_ergebnis': 'string/textarea',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateTestprojekte = StripLookup<Testprojekte['fields']>;
export type CreateTestausfuehrungen = StripLookup<Testausfuehrungen['fields']>;
export type CreateTestfaelle = StripLookup<Testfaelle['fields']>;