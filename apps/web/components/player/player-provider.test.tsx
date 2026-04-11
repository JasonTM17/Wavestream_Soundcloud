import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlayerProvider } from "./player-provider";
import { recordTrackPlay } from "@/lib/wavestream-api";
import { usePlayerStore } from "@/lib/player-store";

vi.mock("@/lib/wavestream-api", () => ({
  recordTrackPlay: vi.fn(),
}));

const queue = [
  {
    id: "track-1",
    slug: "midnight-drive",
    title: "Midnight Drive",
    description: "Late night synth pulse",
    coverUrl: null,
    durationLabel: "4:05",
    playsLabel: "1.8K",
    artistName: "Luna Echo",
    artistHandle: "@luna",
    artist: {
      id: "artist-1",
      username: "luna",
      displayName: "Luna Echo",
      role: "creator" as const,
    },
    genreLabel: "Synthwave",
    streamUrl: "/api/tracks/track-1/stream",
    downloadUrl: null,
    likeCount: 120,
    repostCount: 16,
    commentCount: 9,
    isLiked: false,
    isReposted: false,
    isFollowingArtist: false,
    tags: ["night"],
  },
  {
    id: "track-2",
    slug: "afterglow",
    title: "Afterglow",
    description: "Neon after hours",
    coverUrl: null,
    durationLabel: "3:12",
    playsLabel: "956",
    artistName: "Mira Pulse",
    artistHandle: "@mira",
    artist: {
      id: "artist-2",
      username: "mira",
      displayName: "Mira Pulse",
      role: "creator" as const,
    },
    genreLabel: "Ambient",
    streamUrl: "/api/tracks/track-2/stream",
    downloadUrl: null,
    likeCount: 87,
    repostCount: 9,
    commentCount: 4,
    isLiked: false,
    isReposted: false,
    isFollowingArtist: false,
    tags: ["dawn"],
  },
];

const mockMediaElementMethods = () => ({
  play: vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined as never),
  pause: vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined),
  load: vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined),
});

const resetPlayerState = () =>
  usePlayerStore.setState({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    volume: 0.8,
    muted: false,
    playbackRate: 1,
    shuffle: false,
    repeat: "off",
    progress: 18,
    duration: 218,
  });

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetPlayerState();
});

describe("PlayerProvider", () => {
  it("maps keyboard shortcuts onto player actions", () => {
    mockMediaElementMethods();

    render(
      <PlayerProvider>
        <div>WaveStream</div>
      </PlayerProvider>,
    );

    usePlayerStore.getState().setQueue(queue);

    fireEvent.keyDown(window, { code: "Space" });
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    fireEvent.keyDown(window, { code: "ArrowRight" });
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");

    fireEvent.keyDown(window, { code: "ArrowLeft" });
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");

    fireEvent.keyDown(window, { key: "m" });
    expect(usePlayerStore.getState().muted).toBe(true);

    fireEvent.keyDown(window, { key: "s" });
    expect(usePlayerStore.getState().shuffle).toBe(true);
  });

  it("ignores shortcuts when a modifier key is pressed", () => {
    mockMediaElementMethods();

    render(
      <PlayerProvider>
        <div>WaveStream</div>
      </PlayerProvider>,
    );

    usePlayerStore.getState().setQueue(queue);

    fireEvent.keyDown(window, { code: "Space", ctrlKey: true });
    fireEvent.keyDown(window, { code: "ArrowRight", metaKey: true });
    fireEvent.keyDown(window, { key: "m", altKey: true });

    expect(usePlayerStore.getState().isPlaying).toBe(false);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");
    expect(usePlayerStore.getState().muted).toBe(false);
  });

  it("syncs the hidden audio element with playback state, seek targets, and play recording", async () => {
    const { play, pause, load } = mockMediaElementMethods();
    const recordTrackPlayMock = vi.mocked(recordTrackPlay);
    recordTrackPlayMock.mockResolvedValue({ playCount: 1 });

    const { container } = render(
      <PlayerProvider>
        <div>WaveStream</div>
      </PlayerProvider>,
    );

    const queueWithDuration = queue.map((track, index) => ({
      ...track,
      durationSeconds: index === 0 ? 240 : 180,
    }));
    const audio = container.querySelector("audio") as HTMLAudioElement;

    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(audio, "duration", {
      configurable: true,
      writable: true,
      value: 240,
    });
    Object.defineProperty(audio, "ended", {
      configurable: true,
      writable: true,
      value: false,
    });

    usePlayerStore.getState().setQueue(queueWithDuration);
    usePlayerStore.getState().playTrack(queueWithDuration[0]);

    await waitFor(() => expect(load).toHaveBeenCalled());
    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(audio.getAttribute("src")).toBe("/api/tracks/track-1/stream");

    audio.dispatchEvent(new Event("waiting"));
    expect(usePlayerStore.getState().isBuffering).toBe(true);

    audio.dispatchEvent(new Event("canplay"));
    expect(usePlayerStore.getState().isBuffering).toBe(false);

    audio.currentTime = 18.9;
    audio.dispatchEvent(new Event("timeupdate"));

    await waitFor(() =>
      expect(recordTrackPlayMock).toHaveBeenCalledWith("track-1", {
        durationListened: 18,
        source: "player",
      }),
    );
    expect(usePlayerStore.getState().progress).toBe(18.9);

    usePlayerStore.getState().setProgress(67);
    await waitFor(() => expect(audio.currentTime).toBe(67));
    expect(usePlayerStore.getState().seekTarget).toBe(null);

    usePlayerStore.getState().setVolume(0.4);
    usePlayerStore.getState().setPlaybackRate(1.5);
    await waitFor(() => expect(audio.volume).toBe(0.4));
    await waitFor(() => expect(audio.playbackRate).toBe(1.5));

    usePlayerStore.getState().togglePlay();
    await waitFor(() => expect(pause).toHaveBeenCalled());
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it("advances to the next queued track when playback ends", async () => {
    mockMediaElementMethods();

    const { container } = render(
      <PlayerProvider>
        <div>WaveStream</div>
      </PlayerProvider>,
    );

    const audio = container.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(audio, "duration", {
      configurable: true,
      writable: true,
      value: 240,
    });
    Object.defineProperty(audio, "ended", {
      configurable: true,
      writable: true,
      value: true,
    });

    usePlayerStore.getState().setQueue([
      { ...queue[0], durationSeconds: 240 },
      { ...queue[1], durationSeconds: 180 },
    ]);
    usePlayerStore.getState().playTrack({ ...queue[0], durationSeconds: 240 });

    audio.currentTime = 20;
    audio.dispatchEvent(new Event("timeupdate"));
    audio.dispatchEvent(new Event("ended"));

    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(usePlayerStore.getState().isBuffering).toBe(true);
    expect(usePlayerStore.getState().progress).toBe(0);
  });
});
