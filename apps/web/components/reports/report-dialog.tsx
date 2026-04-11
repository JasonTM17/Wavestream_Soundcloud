"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  entityName?: string | null;
  isPending?: boolean;
  onSubmit: (values: { reason: string; details?: string | null }) => Promise<void> | void;
};

export function ReportDialog({
  open,
  onOpenChange,
  entityLabel,
  entityName,
  isPending = false,
  onSubmit,
}: ReportDialogProps) {
  const [reason, setReason] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setReason("");
      setDetails("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    const trimmedDetails = details.trim();

    if (trimmedReason.length < 3) {
      setError("Add a short reason so the moderation team knows what to review.");
      return;
    }

    setError(null);
    await onSubmit({
      reason: trimmedReason,
      details: trimmedDetails ? trimmedDetails : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,32rem)]">
        <DialogHeader>
          <DialogTitle>Report {entityLabel}</DialogTitle>
          <DialogDescription>
            Flag {entityName ? `"${entityName}"` : `this ${entityLabel}`} for review. Reports go
            to the admin moderation queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason</Label>
            <Input
              id="report-reason"
              placeholder="Spam, harassment, misleading metadata..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Details</Label>
            <Textarea
              id="report-details"
              className="min-h-28 rounded-[1.5rem]"
              placeholder="Add context that will help an admin review this report."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={isPending}>
              {isPending ? "Submitting..." : "Submit report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
