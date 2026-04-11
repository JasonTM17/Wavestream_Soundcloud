"use client";

import * as React from "react";
import { ReportStatus } from "@wavestream/shared";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ResolveReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportLabel?: string | null;
  isPending?: boolean;
  onConfirm: (values: { status: ReportStatus.REVIEWED | ReportStatus.RESOLVED | ReportStatus.DISMISSED; note?: string | null }) => Promise<void> | void;
};

const resolutionLabels: Record<ReportStatus.REVIEWED | ReportStatus.RESOLVED | ReportStatus.DISMISSED, string> = {
  [ReportStatus.REVIEWED]: "Reviewed",
  [ReportStatus.RESOLVED]: "Resolved",
  [ReportStatus.DISMISSED]: "Dismissed",
};

export function ResolveReportDialog({
  open,
  onOpenChange,
  reportLabel,
  isPending = false,
  onConfirm,
}: ResolveReportDialogProps) {
  const [status, setStatus] = React.useState<ReportStatus.REVIEWED | ReportStatus.RESOLVED | ReportStatus.DISMISSED>(ReportStatus.REVIEWED);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setStatus(ReportStatus.REVIEWED);
      setNote("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,32rem)]">
        <DialogHeader>
          <DialogTitle>Resolve report</DialogTitle>
          <DialogDescription>
            Update {reportLabel ? reportLabel : "this report"} and record an admin note in the audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-status">Outcome</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ReportStatus.REVIEWED | ReportStatus.RESOLVED | ReportStatus.DISMISSED)
              }
            >
              <SelectTrigger id="report-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(resolutionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-note">Admin note</Label>
            <Textarea
              id="report-note"
              className="min-h-28 rounded-[1.5rem]"
              placeholder="Optional context for why this report was reviewed, resolved, or dismissed."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() =>
                void onConfirm({
                  status,
                  note: note.trim() ? note.trim() : null,
                })
              }
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save decision"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
