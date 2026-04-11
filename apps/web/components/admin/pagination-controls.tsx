"use client";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  isPending?: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  hasPrev = false,
  hasNext = false,
  isPending = false,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">Page {page}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasPrev || isPending}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasNext || isPending}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
