import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichTestausfuehrungen, enrichTestfaelle } from '@/lib/enrich';
import type { EnrichedTestausfuehrungen, EnrichedTestfaelle } from '@/types/enriched';
import type { Testprojekte, Testausfuehrungen, Testfaelle } from '@/types/app';
import { APP_IDS, LOOKUP_OPTIONS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Plus, CheckCircle2, XCircle, AlertTriangle, FolderKanban, ClipboardList, Play, ChevronRight, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TestprojekteDialog } from '@/components/dialogs/TestprojekteDialog';
import { TestfaelleDialog } from '@/components/dialogs/TestfaelleDialog';
import { TestausfuehrungenDialog } from '@/components/dialogs/TestausfuehrungenDialog';
import { AI_PHOTO_SCAN } from '@/config/ai-features';

type ActiveTab = 'projekt' | 'testfaelle' | 'ausfuehrungen';

type DialogState =
  | { type: 'none' }
  | { type: 'createProjekt' }
  | { type: 'editProjekt'; record: Testprojekte }
  | { type: 'deleteProjekt'; record: Testprojekte }
  | { type: 'createTestfall'; projektId?: string }
  | { type: 'editTestfall'; record: EnrichedTestfaelle }
  | { type: 'deleteTestfall'; record: EnrichedTestfaelle }
  | { type: 'createAusfuehrung'; testfallId?: string }
  | { type: 'editAusfuehrung'; record: EnrichedTestausfuehrungen }
  | { type: 'deleteAusfuehrung'; record: EnrichedTestausfuehrungen };

export default function DashboardOverview() {
  const {
    testprojekte, testausfuehrungen, testfaelle,
    testprojekteMap, testfaelleMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedTestausfuehrungen = enrichTestausfuehrungen(testausfuehrungen, { testfaelleMap });
  const enrichedTestfaelle = enrichTestfaelle(testfaelle, { testprojekteMap });

  const [selectedProjektId, setSelectedProjektId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('testfaelle');
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [projektSearch, setProjektSearch] = useState('');
  const [testfallSearch, setTestfallSearch] = useState('');

  // Stats
  const totalProjekte = testprojekte.length;
  const totalTestfaelle = testfaelle.length;
  const totalAusfuehrungen = testausfuehrungen.length;
  const passedAusfuehrungen = testausfuehrungen.filter(a => a.fields.status?.key === 'bestanden').length;
  const passRate = totalAusfuehrungen > 0 ? Math.round((passedAusfuehrungen / totalAusfuehrungen) * 100) : 0;

  const selectedProjekt = useMemo(
    () => testprojekte.find(p => p.record_id === selectedProjektId) ?? null,
    [testprojekte, selectedProjektId]
  );

  const filteredProjekte = useMemo(() => {
    const q = projektSearch.toLowerCase();
    return testprojekte.filter(p =>
      !q || (p.fields.projektname ?? '').toLowerCase().includes(q)
    );
  }, [testprojekte, projektSearch]);

  const projektTestfaelle = useMemo(() => {
    if (!selectedProjektId) return [];
    return enrichedTestfaelle.filter(tf => {
      const id = extractRecordId(tf.fields.projekt);
      return id === selectedProjektId;
    });
  }, [enrichedTestfaelle, selectedProjektId]);

  const filteredTestfaelle = useMemo(() => {
    const q = testfallSearch.toLowerCase();
    return projektTestfaelle.filter(tf =>
      !q || (tf.fields.titel ?? '').toLowerCase().includes(q)
    );
  }, [projektTestfaelle, testfallSearch]);

  const projektAusfuehrungen = useMemo(() => {
    if (!selectedProjektId) return [];
    const tfIds = new Set(projektTestfaelle.map(tf => tf.record_id));
    return enrichedTestausfuehrungen.filter(a => {
      const id = extractRecordId(a.fields.testfall);
      return id && tfIds.has(id);
    });
  }, [enrichedTestausfuehrungen, projektTestfaelle, selectedProjektId]);

  // Test result stats per project
  const getProjectStats = useCallback((projektId: string) => {
    const tfIds = new Set(
      enrichedTestfaelle
        .filter(tf => extractRecordId(tf.fields.projekt) === projektId)
        .map(tf => tf.record_id)
    );
    const ausfuehrungen = enrichedTestausfuehrungen.filter(a => {
      const id = extractRecordId(a.fields.testfall);
      return id && tfIds.has(id);
    });
    const bestanden = ausfuehrungen.filter(a => a.fields.status?.key === 'bestanden').length;
    const fehlgeschlagen = ausfuehrungen.filter(a => a.fields.status?.key === 'fehlgeschlagen').length;
    const blockiert = ausfuehrungen.filter(a => a.fields.status?.key === 'blockiert').length;
    const testfaelleCount = tfIds.size;
    return { bestanden, fehlgeschlagen, blockiert, total: ausfuehrungen.length, testfaelleCount };
  }, [enrichedTestfaelle, enrichedTestausfuehrungen]);

  const getTestfallStats = useCallback((testfallId: string) => {
    const runs = enrichedTestausfuehrungen.filter(a => extractRecordId(a.fields.testfall) === testfallId);
    const bestanden = runs.filter(a => a.fields.status?.key === 'bestanden').length;
    const fehlgeschlagen = runs.filter(a => a.fields.status?.key === 'fehlgeschlagen').length;
    const blockiert = runs.filter(a => a.fields.status?.key === 'blockiert').length;
    return { bestanden, fehlgeschlagen, blockiert, total: runs.length };
  }, [enrichedTestausfuehrungen]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test-Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Projekte, Testfälle und Ausführungen verwalten</p>
        </div>
        <Button onClick={() => setDialog({ type: 'createProjekt' })} className="gap-1.5 shrink-0 w-full sm:w-auto">
          <Plus size={16} className="shrink-0" />
          Neues Projekt
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Projekte"
          value={String(totalProjekte)}
          description="Gesamt"
          icon={<FolderKanban size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Testfälle"
          value={String(totalTestfaelle)}
          description="Gesamt"
          icon={<ClipboardList size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Ausführungen"
          value={String(totalAusfuehrungen)}
          description="Gesamt"
          icon={<Play size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Bestanden"
          value={`${passRate}%`}
          description={`${passedAusfuehrungen} von ${totalAusfuehrungen}`}
          icon={<CheckCircle2 size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Main workspace: Project list + Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project list */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
              <Input
                placeholder="Projekt suchen..."
                value={projektSearch}
                onChange={e => setProjektSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredProjekte.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {projektSearch ? 'Keine Projekte gefunden.' : 'Noch keine Projekte vorhanden.'}
              </div>
            )}
            {filteredProjekte.map(p => {
              const stats = getProjectStats(p.record_id);
              const isSelected = selectedProjektId === p.record_id;
              return (
                <div
                  key={p.record_id}
                  onClick={() => { setSelectedProjektId(p.record_id); setActiveTab('testfaelle'); }}
                  className={`
                    group relative rounded-2xl border p-4 cursor-pointer transition-all overflow-hidden
                    ${isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'}
                  `}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{p.fields.projektname ?? '(Kein Name)'}</span>
                        {p.fields.status && (
                          <ProjektStatusBadge status={p.fields.status.key} label={p.fields.status.label} />
                        )}
                      </div>
                      {p.fields.startdatum && (
                        <p className="text-xs text-muted-foreground mt-0.5">Start: {formatDate(p.fields.startdatum)}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); setDialog({ type: 'editProjekt', record: p }); }}
                        className="p-1 rounded-lg hover:bg-accent"
                        title="Bearbeiten"
                      >
                        <Pencil size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDialog({ type: 'deleteProjekt', record: p }); }}
                        className="p-1 rounded-lg hover:bg-destructive/10"
                        title="Löschen"
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                  {/* Mini stats bar */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <ClipboardList size={11} />
                      {stats.testfaelleCount} Fälle
                    </span>
                    {stats.total > 0 && (
                      <>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={11} />
                          {stats.bestanden}
                        </span>
                        {stats.fehlgeschlagen > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle size={11} />
                            {stats.fehlgeschlagen}
                          </span>
                        )}
                        {stats.blockiert > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle size={11} />
                            {stats.blockiert}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  {stats.total > 0 && (
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.round((stats.bestanden / stats.total) * 100)}%` }}
                      />
                    </div>
                  )}
                  {isSelected && (
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selectedProjekt ? (
            <div className="rounded-2xl border border-dashed border-border p-16 flex flex-col items-center justify-center text-center gap-3">
              <FolderKanban size={40} className="text-muted-foreground/40" />
              <div>
                <p className="font-medium text-muted-foreground">Projekt auswählen</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Klicke links auf ein Projekt, um Testfälle und Ausführungen zu sehen.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
              {/* Panel header */}
              <div className="px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold truncate">{selectedProjekt.fields.projektname ?? '(Kein Name)'}</h2>
                      {selectedProjekt.fields.status && (
                        <ProjektStatusBadge status={selectedProjekt.fields.status.key} label={selectedProjekt.fields.status.label} />
                      )}
                    </div>
                    {selectedProjekt.fields.beschreibung && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedProjekt.fields.beschreibung}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialog({ type: 'createTestfall', projektId: selectedProjekt.record_id })}
                    className="gap-1.5 shrink-0"
                  >
                    <Plus size={14} className="shrink-0" />
                    Testfall
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                  <button
                    onClick={() => setActiveTab('testfaelle')}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      activeTab === 'testfaelle'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    Testfälle ({projektTestfaelle.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ausfuehrungen')}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      activeTab === 'ausfuehrungen'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    Ausführungen ({projektAusfuehrungen.length})
                  </button>
                </div>
              </div>

              {/* Tab: Testfälle */}
              {activeTab === 'testfaelle' && (
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Testfall suchen..."
                      value={testfallSearch}
                      onChange={e => setTestfallSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
                    {filteredTestfaelle.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        {testfallSearch ? 'Keine Testfälle gefunden.' : 'Noch keine Testfälle für dieses Projekt.'}
                      </div>
                    ) : (
                      filteredTestfaelle.map(tf => {
                        const stats = getTestfallStats(tf.record_id);
                        return (
                          <div key={tf.record_id} className="group rounded-xl border border-border bg-background px-4 py-3 hover:border-primary/30 transition-all">
                            <div className="flex items-start justify-between gap-2 min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span className="text-sm font-medium truncate">{tf.fields.titel ?? '(Kein Titel)'}</span>
                                  {tf.fields.prioritaet && (
                                    <PrioritaetBadge prio={tf.fields.prioritaet.key} label={tf.fields.prioritaet.label} />
                                  )}
                                </div>
                                {tf.fields.beschreibung && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tf.fields.beschreibung}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                                  <span>{stats.total} Ausführung{stats.total !== 1 ? 'en' : ''}</span>
                                  {stats.total > 0 && (
                                    <>
                                      <span className="flex items-center gap-0.5 text-green-600"><CheckCircle2 size={10} />{stats.bestanden}</span>
                                      {stats.fehlgeschlagen > 0 && <span className="flex items-center gap-0.5 text-red-500"><XCircle size={10} />{stats.fehlgeschlagen}</span>}
                                      {stats.blockiert > 0 && <span className="flex items-center gap-0.5 text-yellow-600"><AlertTriangle size={10} />{stats.blockiert}</span>}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                                <button
                                  onClick={() => setDialog({ type: 'createAusfuehrung', testfallId: tf.record_id })}
                                  className="p-1 rounded-lg hover:bg-accent"
                                  title="Ausführung hinzufügen"
                                >
                                  <Play size={13} className="text-primary" />
                                </button>
                                <button
                                  onClick={() => setDialog({ type: 'editTestfall', record: tf })}
                                  className="p-1 rounded-lg hover:bg-accent"
                                  title="Bearbeiten"
                                >
                                  <Pencil size={13} className="text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => setDialog({ type: 'deleteTestfall', record: tf })}
                                  className="p-1 rounded-lg hover:bg-destructive/10"
                                  title="Löschen"
                                >
                                  <Trash2 size={13} className="text-destructive" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-muted-foreground"
                    onClick={() => setDialog({ type: 'createTestfall', projektId: selectedProjekt.record_id })}
                  >
                    <Plus size={14} className="shrink-0" />
                    Testfall hinzufügen
                  </Button>
                </div>
              )}

              {/* Tab: Ausführungen */}
              {activeTab === 'ausfuehrungen' && (
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
                    {projektAusfuehrungen.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Noch keine Ausführungen für dieses Projekt.
                      </div>
                    ) : (
                      projektAusfuehrungen.map(a => (
                        <div key={a.record_id} className="group rounded-xl border border-border bg-background px-4 py-3 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="text-sm font-medium truncate">{a.testfallName || '(Kein Testfall)'}</span>
                                {a.fields.status && (
                                  <AusfuehrungStatusBadge status={a.fields.status.key} label={a.fields.status.label} />
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                {(a.fields.tester_vorname || a.fields.tester_nachname) && (
                                  <span>{a.fields.tester_vorname} {a.fields.tester_nachname}</span>
                                )}
                                {a.fields.ausfuehrungszeitpunkt && (
                                  <span>{formatDate(a.fields.ausfuehrungszeitpunkt)}</span>
                                )}
                              </div>
                              {a.fields.tatsaechliches_ergebnis && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.fields.tatsaechliches_ergebnis}</p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setDialog({ type: 'editAusfuehrung', record: a })}
                                className="p-1 rounded-lg hover:bg-accent"
                                title="Bearbeiten"
                              >
                                <Pencil size={13} className="text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => setDialog({ type: 'deleteAusfuehrung', record: a })}
                                className="p-1 rounded-lg hover:bg-destructive/10"
                                title="Löschen"
                              >
                                <Trash2 size={13} className="text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-muted-foreground"
                    onClick={() => setDialog({ type: 'createAusfuehrung' })}
                  >
                    <Plus size={14} className="shrink-0" />
                    Ausführung hinzufügen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}

      {/* Projekt create */}
      <TestprojekteDialog
        open={dialog.type === 'createProjekt'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          await LivingAppsService.createTestprojekteEntry(fields);
          fetchAll();
        }}
        defaultValues={undefined}
        enablePhotoScan={AI_PHOTO_SCAN['Testprojekte']}
      />

      {/* Projekt edit */}
      <TestprojekteDialog
        open={dialog.type === 'editProjekt'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          if (dialog.type !== 'editProjekt') return;
          await LivingAppsService.updateTestprojekteEntry(dialog.record.record_id, fields);
          fetchAll();
        }}
        defaultValues={dialog.type === 'editProjekt' ? dialog.record.fields : undefined}
        enablePhotoScan={AI_PHOTO_SCAN['Testprojekte']}
      />

      {/* Projekt delete */}
      <ConfirmDialog
        open={dialog.type === 'deleteProjekt'}
        title="Projekt löschen"
        description={`Möchtest du das Projekt "${dialog.type === 'deleteProjekt' ? dialog.record.fields.projektname ?? '' : ''}" wirklich löschen?`}
        onConfirm={async () => {
          if (dialog.type !== 'deleteProjekt') return;
          await LivingAppsService.deleteTestprojekteEntry(dialog.record.record_id);
          if (selectedProjektId === dialog.record.record_id) setSelectedProjektId(null);
          fetchAll();
          setDialog({ type: 'none' });
        }}
        onClose={() => setDialog({ type: 'none' })}
      />

      {/* Testfall create */}
      <TestfaelleDialog
        open={dialog.type === 'createTestfall'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          await LivingAppsService.createTestfaelleEntry(fields);
          fetchAll();
        }}
        defaultValues={
          dialog.type === 'createTestfall' && dialog.projektId
            ? { projekt: createRecordUrl(APP_IDS.TESTPROJEKTE, dialog.projektId) }
            : undefined
        }
        testprojekteList={testprojekte}
        enablePhotoScan={AI_PHOTO_SCAN['Testfaelle']}
      />

      {/* Testfall edit */}
      <TestfaelleDialog
        open={dialog.type === 'editTestfall'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          if (dialog.type !== 'editTestfall') return;
          await LivingAppsService.updateTestfaelleEntry(dialog.record.record_id, fields);
          fetchAll();
        }}
        defaultValues={dialog.type === 'editTestfall' ? dialog.record.fields : undefined}
        testprojekteList={testprojekte}
        enablePhotoScan={AI_PHOTO_SCAN['Testfaelle']}
      />

      {/* Testfall delete */}
      <ConfirmDialog
        open={dialog.type === 'deleteTestfall'}
        title="Testfall löschen"
        description={`Möchtest du den Testfall "${dialog.type === 'deleteTestfall' ? dialog.record.fields.titel ?? '' : ''}" wirklich löschen?`}
        onConfirm={async () => {
          if (dialog.type !== 'deleteTestfall') return;
          await LivingAppsService.deleteTestfaelleEntry(dialog.record.record_id);
          fetchAll();
          setDialog({ type: 'none' });
        }}
        onClose={() => setDialog({ type: 'none' })}
      />

      {/* Ausführung create */}
      <TestausfuehrungenDialog
        open={dialog.type === 'createAusfuehrung'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          await LivingAppsService.createTestausfuehrungenEntry(fields);
          fetchAll();
        }}
        defaultValues={
          dialog.type === 'createAusfuehrung' && dialog.testfallId
            ? { testfall: createRecordUrl(APP_IDS.TESTFAELLE, dialog.testfallId) }
            : undefined
        }
        testfaelleList={testfaelle}
        enablePhotoScan={AI_PHOTO_SCAN['Testausfuehrungen']}
      />

      {/* Ausführung edit */}
      <TestausfuehrungenDialog
        open={dialog.type === 'editAusfuehrung'}
        onClose={() => setDialog({ type: 'none' })}
        onSubmit={async (fields) => {
          if (dialog.type !== 'editAusfuehrung') return;
          await LivingAppsService.updateTestausfuehrungenEntry(dialog.record.record_id, fields);
          fetchAll();
        }}
        defaultValues={dialog.type === 'editAusfuehrung' ? dialog.record.fields : undefined}
        testfaelleList={testfaelle}
        enablePhotoScan={AI_PHOTO_SCAN['Testausfuehrungen']}
      />

      {/* Ausführung delete */}
      <ConfirmDialog
        open={dialog.type === 'deleteAusfuehrung'}
        title="Ausführung löschen"
        description="Möchtest du diese Testausführung wirklich löschen?"
        onConfirm={async () => {
          if (dialog.type !== 'deleteAusfuehrung') return;
          await LivingAppsService.deleteTestausfuehrungenEntry(dialog.record.record_id);
          fetchAll();
          setDialog({ type: 'none' });
        }}
        onClose={() => setDialog({ type: 'none' })}
      />
    </div>
  );
}

function ProjektStatusBadge({ status, label }: { status: string; label: string }) {
  const cls =
    status === 'in_bearbeitung' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    status === 'abgeschlossen' ? 'bg-green-100 text-green-700 border-green-200' :
    status === 'pausiert' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function PrioritaetBadge({ prio, label }: { prio: string; label: string }) {
  const cls =
    prio === 'kritisch' ? 'bg-red-100 text-red-700 border-red-200' :
    prio === 'hoch' ? 'bg-orange-100 text-orange-700 border-orange-200' :
    prio === 'mittel' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function AusfuehrungStatusBadge({ status, label }: { status: string; label: string }) {
  const cls =
    status === 'bestanden' ? 'bg-green-100 text-green-700 border-green-200' :
    status === 'fehlgeschlagen' ? 'bg-red-100 text-red-700 border-red-200' :
    status === 'blockiert' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
