import type { Testausfuehrungen, Testfaelle } from './app';

export type EnrichedTestausfuehrungen = Testausfuehrungen & {
  testfallName: string;
};

export type EnrichedTestfaelle = Testfaelle & {
  projektName: string;
};
