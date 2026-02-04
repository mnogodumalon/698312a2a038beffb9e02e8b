import { useState, useEffect, useMemo } from 'react';
import type { Testprojekte, Testfaelle, Testausfuehrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistance, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, ClipboardCheck, AlertCircle, CheckCircle2, Ban, Calendar, User } from 'lucide-react';

// Status labels mapping
const STATUS_LABELS: Record<string, string> = {
  bestanden: 'Bestanden',
  fehlgeschlagen: 'Fehlgeschlagen',
  blockiert: 'Blockiert',
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  geplant: 'Geplant',
  in_bearbeitung: 'In Bearbeitung',
  abgeschlossen: 'Abgeschlossen',
  pausiert: 'Pausiert',
};

// Progress Ring Component
function ProgressRing({
  percentage,
  size = 200,
  strokeWidth = 10
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 90) return 'hsl(152 60% 40%)';
    if (percentage >= 70) return 'hsl(80 60% 45%)';
    return 'hsl(38 90% 50%)';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring with dashed pattern */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(214 20% 90%)"
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-800 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.3))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground">
          {percentage.toFixed(1)}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">Erfolgsrate</span>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'bestanden':
        return 'bg-status-passed/10 text-status-passed border-status-passed/20';
      case 'fehlgeschlagen':
        return 'bg-status-failed/10 text-status-failed border-status-failed/20';
      case 'blockiert':
        return 'bg-status-blocked/10 text-status-blocked border-status-blocked/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'bestanden':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'fehlgeschlagen':
        return <AlertCircle className="w-3 h-3" />;
      case 'blockiert':
        return <Ban className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyle()} gap-1 rounded-full px-2 py-0.5`}>
      {getIcon()}
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

// Project Status Badge
function ProjectStatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'in_bearbeitung':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'abgeschlossen':
        return 'bg-status-passed/10 text-status-passed border-status-passed/20';
      case 'pausiert':
        return 'bg-status-blocked/10 text-status-blocked border-status-blocked/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyle()} rounded-full text-xs`}>
      {PROJECT_STATUS_LABELS[status] || status}
    </Badge>
  );
}

// Status Card Component
function StatusCard({
  label,
  count,
  color,
  isActive,
  onClick
}: {
  label: string;
  count: number;
  color: 'passed' | 'failed' | 'blocked';
  isActive: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    passed: 'border-l-status-passed',
    failed: 'border-l-status-failed',
    blocked: 'border-l-status-blocked',
  };

  const textColorClasses = {
    passed: 'text-status-passed',
    failed: 'text-status-failed',
    blocked: 'text-status-blocked',
  };

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-[100px] md:w-auto bg-card rounded-xl border-l-4 ${colorClasses[color]} p-3 md:p-4 text-left transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary bg-accent' : ''}`}
    >
      <div className={`text-2xl md:text-3xl font-bold ${textColorClasses[color]}`}>
        {count}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </button>
  );
}

// Project Card Component
function ProjectCard({
  project,
  testCaseCount
}: {
  project: Testprojekte;
  testCaseCount: number;
}) {
  return (
    <Card className="flex-shrink-0 w-[140px] md:w-auto hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm truncate mb-2">
          {project.fields.projektname || 'Unbenannt'}
        </h3>
        <ProjectStatusBadge status={project.fields.status || 'geplant'} />
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <ClipboardCheck className="w-3 h-3" />
            {testCaseCount} Testfälle
          </div>
          {project.fields.startdatum && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(project.fields.startdatum), 'dd.MM.yyyy')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Execution Item Component
function ExecutionItem({
  execution,
  testCase,
  project
}: {
  execution: Testausfuehrungen;
  testCase?: Testfaelle;
  project?: Testprojekte;
}) {
  const testerName = [execution.fields.tester_vorname, execution.fields.tester_nachname]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="p-3 md:p-4 rounded-xl bg-card border hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {testCase?.fields.titel || 'Unbekannter Testfall'}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {project?.fields.projektname || 'Unbekanntes Projekt'}
          </p>
        </div>
        <StatusBadge status={execution.fields.status || ''} />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        {testerName && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {testerName}
          </div>
        )}
        <span>
          {execution.fields.ausfuehrungszeitpunkt
            ? formatDistance(parseISO(execution.fields.ausfuehrungszeitpunkt), new Date(), {
                addSuffix: true,
                locale: de,
              })
            : 'Unbekannt'}
        </span>
      </div>
    </div>
  );
}

// Add Execution Form
function AddExecutionForm({
  testCases,
  onSuccess,
  onClose
}: {
  testCases: Testfaelle[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    testfall: '',
    status: 'bestanden',
    tatsaechliches_ergebnis: '',
    anmerkungen: '',
    tester_vorname: '',
    tester_nachname: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testfall) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const ausfuehrungszeitpunkt = format(now, "yyyy-MM-dd'T'HH:mm");

      await LivingAppsService.createTestausfuehrungenEntry({
        testfall: createRecordUrl(APP_IDS.TESTFAELLE, formData.testfall),
        status: formData.status,
        tatsaechliches_ergebnis: formData.tatsaechliches_ergebnis || undefined,
        anmerkungen: formData.anmerkungen || undefined,
        tester_vorname: formData.tester_vorname || undefined,
        tester_nachname: formData.tester_nachname || undefined,
        ausfuehrungszeitpunkt,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create execution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testfall">Testfall *</Label>
        <Select
          value={formData.testfall}
          onValueChange={(value) => setFormData({ ...formData, testfall: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Testfall auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {testCases.map((tc) => (
              <SelectItem key={tc.record_id} value={tc.record_id}>
                {tc.fields.titel || 'Unbenannt'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status *</Label>
        <RadioGroup
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bestanden" id="bestanden" />
            <Label htmlFor="bestanden" className="text-status-passed font-medium cursor-pointer">
              Bestanden
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fehlgeschlagen" id="fehlgeschlagen" />
            <Label htmlFor="fehlgeschlagen" className="text-status-failed font-medium cursor-pointer">
              Fehlgeschlagen
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="blockiert" id="blockiert" />
            <Label htmlFor="blockiert" className="text-status-blocked font-medium cursor-pointer">
              Blockiert
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tatsaechliches_ergebnis">Tatsächliches Ergebnis</Label>
        <Textarea
          id="tatsaechliches_ergebnis"
          value={formData.tatsaechliches_ergebnis}
          onChange={(e) => setFormData({ ...formData, tatsaechliches_ergebnis: e.target.value })}
          placeholder="Was ist tatsächlich passiert?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="anmerkungen">Anmerkungen</Label>
        <Textarea
          id="anmerkungen"
          value={formData.anmerkungen}
          onChange={(e) => setFormData({ ...formData, anmerkungen: e.target.value })}
          placeholder="Zusätzliche Notizen..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tester_vorname">Vorname</Label>
          <Input
            id="tester_vorname"
            value={formData.tester_vorname}
            onChange={(e) => setFormData({ ...formData, tester_vorname: e.target.value })}
            placeholder="Vorname"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tester_nachname">Nachname</Label>
          <Input
            id="tester_nachname"
            value={formData.tester_nachname}
            onChange={(e) => setFormData({ ...formData, tester_nachname: e.target.value })}
            placeholder="Nachname"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={submitting || !formData.testfall} className="flex-1">
          {submitting ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="flex justify-center py-12">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddFirst }: { onAddFirst: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ClipboardCheck className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Noch keine Testausführungen</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Starten Sie mit der Erfassung Ihrer ersten Testausführung, um den Überblick über Ihre Testqualität zu behalten.
      </p>
      <Button onClick={onAddFirst}>
        <Plus className="w-4 h-4 mr-2" />
        Erste Testausführung erfassen
      </Button>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [projects, setProjects] = useState<Testprojekte[]>([]);
  const [testCases, setTestCases] = useState<Testfaelle[]>([]);
  const [executions, setExecutions] = useState<Testausfuehrungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, testCasesData, executionsData] = await Promise.all([
        LivingAppsService.getTestprojekte(),
        LivingAppsService.getTestfaelle(),
        LivingAppsService.getTestausfuehrungen(),
      ]);
      setProjects(projectsData);
      setTestCases(testCasesData);
      setExecutions(executionsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create lookup maps
  const testCaseMap = useMemo(() => {
    const map = new Map<string, Testfaelle>();
    testCases.forEach((tc) => map.set(tc.record_id, tc));
    return map;
  }, [testCases]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Testprojekte>();
    projects.forEach((p) => map.set(p.record_id, p));
    return map;
  }, [projects]);

  // Calculate test case counts per project
  const testCaseCountByProject = useMemo(() => {
    const counts = new Map<string, number>();
    testCases.forEach((tc) => {
      const projectId = extractRecordId(tc.fields.projekt);
      if (projectId) {
        counts.set(projectId, (counts.get(projectId) || 0) + 1);
      }
    });
    return counts;
  }, [testCases]);

  // Calculate stats
  const stats = useMemo(() => {
    const passed = executions.filter((e) => e.fields.status === 'bestanden').length;
    const failed = executions.filter((e) => e.fields.status === 'fehlgeschlagen').length;
    const blocked = executions.filter((e) => e.fields.status === 'blockiert').length;
    const total = executions.length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return { passed, failed, blocked, total, passRate };
  }, [executions]);

  // Calculate trend data (pass rate over time)
  const trendData = useMemo(() => {
    // Group executions by date
    const byDate = new Map<string, { passed: number; total: number }>();

    executions.forEach((e) => {
      if (!e.fields.ausfuehrungszeitpunkt) return;
      const date = e.fields.ausfuehrungszeitpunkt.split('T')[0];
      const current = byDate.get(date) || { passed: 0, total: 0 };
      current.total++;
      if (e.fields.status === 'bestanden') {
        current.passed++;
      }
      byDate.set(date, current);
    });

    // Convert to array and calculate cumulative pass rate
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // Last 30 days
      .map(([date, data]) => ({
        date: format(parseISO(date), 'dd.MM'),
        passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
      }));
  }, [executions]);

  // Filter executions
  const filteredExecutions = useMemo(() => {
    let filtered = [...executions];
    if (statusFilter) {
      filtered = filtered.filter((e) => e.fields.status === statusFilter);
    }
    // Sort by date descending
    return filtered.sort((a, b) => {
      const dateA = a.fields.ausfuehrungszeitpunkt || '';
      const dateB = b.fields.ausfuehrungszeitpunkt || '';
      return dateB.localeCompare(dateA);
    });
  }, [executions, statusFilter]);

  // Active projects (not completed)
  const activeProjects = useMemo(() => {
    return projects
      .filter((p) => p.fields.status !== 'abgeschlossen')
      .sort((a, b) => {
        // In Bearbeitung first
        if (a.fields.status === 'in_bearbeitung' && b.fields.status !== 'in_bearbeitung') return -1;
        if (b.fields.status === 'in_bearbeitung' && a.fields.status !== 'in_bearbeitung') return 1;
        return 0;
      });
  }, [projects]);

  // Get test case and project for an execution
  const getExecutionDetails = (execution: Testausfuehrungen) => {
    const testCaseId = extractRecordId(execution.fields.testfall);
    const testCase = testCaseId ? testCaseMap.get(testCaseId) : undefined;
    const projectId = testCase ? extractRecordId(testCase.fields.projekt) : undefined;
    const project = projectId ? projectMap.get(projectId) : undefined;
    return { testCase, project };
  };

  const handleSuccess = () => {
    fetchData();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={fetchData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16">
          <h1 className="text-lg md:text-2xl font-semibold">Test-Management Dashboard</h1>

          {/* Desktop Action Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hidden md:flex gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Testausführung erfassen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Testausführung</DialogTitle>
              </DialogHeader>
              <AddExecutionForm
                testCases={testCases}
                onSuccess={handleSuccess}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Mobile Action Button (header) */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="md:hidden">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </header>

      {executions.length === 0 ? (
        <EmptyState onAddFirst={() => setDialogOpen(true)} />
      ) : (
        <>
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-[2fr_1fr] gap-8 p-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Hero Card */}
              <Card className="p-6">
                <div className="flex items-center gap-8">
                  {/* Progress Ring */}
                  <ProgressRing percentage={stats.passRate} size={240} strokeWidth={10} />

                  {/* Status Counts */}
                  <div className="flex-1 space-y-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {stats.passed} von {stats.total} Tests bestanden
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <StatusCard
                        label="Bestanden"
                        count={stats.passed}
                        color="passed"
                        isActive={statusFilter === 'bestanden'}
                        onClick={() => setStatusFilter(statusFilter === 'bestanden' ? null : 'bestanden')}
                      />
                      <StatusCard
                        label="Fehlgeschlagen"
                        count={stats.failed}
                        color="failed"
                        isActive={statusFilter === 'fehlgeschlagen'}
                        onClick={() => setStatusFilter(statusFilter === 'fehlgeschlagen' ? null : 'fehlgeschlagen')}
                      />
                      <StatusCard
                        label="Blockiert"
                        count={stats.blocked}
                        color="blocked"
                        isActive={statusFilter === 'blockiert'}
                        onClick={() => setStatusFilter(statusFilter === 'blockiert' ? null : 'blockiert')}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Projects Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Projekte</h2>
                  <Badge variant="secondary">{activeProjects.length} aktiv</Badge>
                </div>
                {activeProjects.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {activeProjects.map((project) => (
                      <ProjectCard
                        key={project.record_id}
                        project={project}
                        testCaseCount={testCaseCountByProject.get(project.record_id) || 0}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    Keine aktiven Projekte
                  </Card>
                )}
              </div>

              {/* Trend Chart */}
              {trendData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Erfolgsrate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(215 70% 45%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(215 70% 45%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            stroke="hsl(215 15% 50%)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            stroke="hsl(215 15% 50%)"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(0 0% 100%)',
                              border: '1px solid hsl(214 20% 90%)',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value}%`, 'Erfolgsrate']}
                          />
                          <Area
                            type="monotone"
                            dataKey="passRate"
                            stroke="hsl(215 70% 45%)"
                            strokeWidth={2}
                            fill="url(#passRateGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Recent Executions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Letzte Testläufe</h2>
                {statusFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-3 pr-4">
                  {filteredExecutions.slice(0, 20).map((execution) => {
                    const { testCase, project } = getExecutionDetails(execution);
                    return (
                      <ExecutionItem
                        key={execution.record_id}
                        execution={execution}
                        testCase={testCase}
                        project={project}
                      />
                    );
                  })}
                  {filteredExecutions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Keine Testläufe gefunden
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden p-4 pb-24 space-y-6">
            {/* Hero Section */}
            <div className="flex justify-center py-4">
              <ProgressRing percentage={stats.passRate} size={200} strokeWidth={10} />
            </div>
            <div className="text-center text-sm text-muted-foreground mb-4">
              {stats.passed} von {stats.total} Tests bestanden
            </div>

            {/* Status Summary (Horizontal scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <StatusCard
                label="Bestanden"
                count={stats.passed}
                color="passed"
                isActive={statusFilter === 'bestanden'}
                onClick={() => setStatusFilter(statusFilter === 'bestanden' ? null : 'bestanden')}
              />
              <StatusCard
                label="Fehlgeschlagen"
                count={stats.failed}
                color="failed"
                isActive={statusFilter === 'fehlgeschlagen'}
                onClick={() => setStatusFilter(statusFilter === 'fehlgeschlagen' ? null : 'fehlgeschlagen')}
              />
              <StatusCard
                label="Blockiert"
                count={stats.blocked}
                color="blocked"
                isActive={statusFilter === 'blockiert'}
                onClick={() => setStatusFilter(statusFilter === 'blockiert' ? null : 'blockiert')}
              />
            </div>

            {/* Active Projects (Horizontal scroll) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Aktive Projekte</h2>
                <Badge variant="secondary" className="text-xs">{activeProjects.length}</Badge>
              </div>
              {activeProjects.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {activeProjects.map((project) => (
                    <ProjectCard
                      key={project.record_id}
                      project={project}
                      testCaseCount={testCaseCountByProject.get(project.record_id) || 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Keine aktiven Projekte</div>
              )}
            </div>

            {/* Recent Executions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Letzte Testläufe</h2>
                {statusFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>
                    Zurücksetzen
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {filteredExecutions.slice(0, 10).map((execution) => {
                  const { testCase, project } = getExecutionDetails(execution);
                  return (
                    <ExecutionItem
                      key={execution.record_id}
                      execution={execution}
                      testCase={testCase}
                      project={project}
                    />
                  );
                })}
                {filteredExecutions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Keine Testläufe gefunden
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Fixed Bottom Button */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Testausführung erfassen
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
}
