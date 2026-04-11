"use client";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReportDialog } from "./report-dialog";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ReportDialog", () => {
  it("blocks submission until a short reason is filled in", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ReportDialog
        open
        onOpenChange={vi.fn()}
        entityLabel="track"
        entityName="Night Drive"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(await screen.findByText("Add a short reason so the moderation team knows what to review.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims submitted report details and sends null when details are empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReportDialog
        open
        onOpenChange={vi.fn()}
        entityLabel="playlist"
        entityName="Late Hours"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Reason"), "  Spam and misleading metadata  ");
    await user.type(screen.getByLabelText("Details"), "   ");
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        reason: "Spam and misleading metadata",
        details: null,
      }),
    );
  });
});
