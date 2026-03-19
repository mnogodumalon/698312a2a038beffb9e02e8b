import type { Testausfuehrungen, Testfaelle } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface TestausfuehrungenViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Testausfuehrungen | null;
  onEdit: (record: Testausfuehrungen) => void;
  testfaelleList: Testfaelle[];
}

export function TestausfuehrungenViewDialog({ open, onClose, record, onEdit, testfaelleList }: TestausfuehrungenViewDialogProps) {
  function getTestfaelleDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return testfaelleList.find(r => r.record_id === id)?.fields.titel ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testausführungen anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Testfall</Label>
            <p className="text-sm">{getTestfaelleDisplayName(record.fields.testfall)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ausführungsdatum und -zeit</Label>
            <p className="text-sm">{formatDate(record.fields.ausfuehrungszeitpunkt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Vorname des Testers</Label>
            <p className="text-sm">{record.fields.tester_vorname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nachname des Testers</Label>
            <p className="text-sm">{record.fields.tester_nachname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tatsächliches Ergebnis</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.tatsaechliches_ergebnis ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Badge variant="secondary">{record.fields.status?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Anmerkungen</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.anmerkungen ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Screenshot oder Anhang</Label>
            {record.fields.anhang ? (
              <div className="relative w-full rounded-lg bg-muted overflow-hidden border">
                <img src={record.fields.anhang} alt="" className="w-full h-auto object-contain" />
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}