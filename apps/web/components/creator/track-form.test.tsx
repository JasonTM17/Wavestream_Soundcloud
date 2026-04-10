"use client";

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TrackForm } from "./track-form";
import type { TrackSummary } from "@/lib/wavestream-api";

const makeTrack = (overrides: Partial<TrackSummary> = {}): TrackSummary =>
  ({
    id: "track-1",
    slug: "midnight-static",
    title: "Midnight Static",
    description: "Late night synth pulse",
    coverUrl: null,
    duration: 245,
    privacy: "public",
    status: "published",
    allowDownloads: false,
    commentsEnabled: true,
    playCount: 1842,
    likeCount: 120,
    repostCount: 16,
    commentCount: 9,
    artist: {
      id: "artist-1",
      username: "solis-kim",
      displayName: "Solis Kim",
      role: "creator",
    },
    genre: {
      id: "genre-1",
      name: "Electronic",
      slug: "electronic",
    },
    file: {
      id: "file-1",
      streamUrl: "/api/tracks/track-1/stream",
    },
    tags: [{ id: "tag-1", name: "night", slug: "night" }],
    ...overrides,
  }) as TrackSummary;

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:mock"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TrackForm", () => {
  it("blocks create submission when no audio file is selected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { container } = render(<TrackForm mode="create" onSubmit={onSubmit} />);
    const formScope = within(container);

    await user.type(formScope.getByLabelText("Title"), "Integration Test Pulse");
    await user.click(formScope.getByRole("button", { name: "Publish track" }));

    expect(await screen.findByText("Audio file is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a normalized create payload with audio, artwork, and tags", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<TrackForm mode="create" onSubmit={onSubmit} />);
    const formScope = within(container);

    const fileInputs = container.querySelectorAll('input[type="file"]');
    const audioInput = fileInputs[0] as HTMLInputElement | undefined;
    const coverInput = fileInputs[1] as HTMLInputElement | undefined;
    const audioFile = new File(["audio"], "integration.wav", { type: "audio/wav" });
    const coverFile = new File(["cover"], "integration.png", { type: "image/png" });

    expect(audioInput).toBeDefined();
    expect(coverInput).toBeDefined();

    await user.type(formScope.getByLabelText("Title"), "Integration Test Pulse");
    await user.type(
      formScope.getByLabelText("Description"),
      "Demo upload for creator dashboard coverage.",
    );
    await user.type(formScope.getByLabelText("Tags"), "night, synth , demo");
    fireEvent.change(audioInput!, { target: { files: [audioFile] } });
    fireEvent.change(coverInput!, { target: { files: [coverFile] } });

    await user.click(formScope.getByRole("button", { name: "Publish track" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        audioFile,
        coverImage: coverFile,
        title: "Integration Test Pulse",
        description: "Demo upload for creator dashboard coverage.",
        tags: ["night", "synth", "demo"],
        privacy: "public",
        status: "published",
        allowDownloads: false,
        commentsEnabled: true,
      }),
    );
  });

  it("submits metadata-only updates in edit mode", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <TrackForm mode="edit" initialTrack={makeTrack()} onSubmit={onSubmit} />,
    );
    const formScope = within(container);

    const titleField = formScope.getByLabelText("Title");
    await user.clear(titleField);
    await user.type(titleField, "Midnight Static Revised");
    await user.clear(formScope.getByLabelText("Tags"));
    await user.type(formScope.getByLabelText("Tags"), "late-night, revised");
    await user.click(formScope.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Midnight Static Revised",
        description: "Late night synth pulse",
        genre: "Electronic",
        tags: ["late-night", "revised"],
        privacy: "public",
        status: "published",
        allowDownloads: false,
        commentsEnabled: true,
      }),
    );
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("audioFile");
  });
});
