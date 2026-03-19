import type { Testfaelle, Testprojekte } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';

interface TestfaelleViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Testfaelle | null;
  onEdit: (record: Testfaelle) => void;
  testprojekteList: Testprojekte[];
}

export function TestfaelleViewDialog({ open, onClose, record, onEdit, testprojekteList }: TestfaelleViewDialogProps) {
  function getTestprojekteDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return testprojekteList.find(r => r.record_id === id)?.fields.projektname ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testfälle anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projekt</Label>
            <p className="text-sm">{getTestprojekteDisplayName(record.fields.projekt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Testfall-Titel</Label>
            <p className="text-sm">{record.fields.titel ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Priorität</Label>
            <Badge variant="secondary">{record.fields.prioritaet?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Erwartetes Ergebnis</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.erwartetes_ergebnis ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}