import { render, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PlayerProvider } from "./player-provider";
import { usePlayerStore } from "@/lib/player-store";

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
  resetPlayerState();
});

describe("PlayerProvider", () => {
  it("maps keyboard shortcuts onto player actions", () => {
    const { unmount } = render(
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

    unmount();
  });

  it("ignores shortcuts when a modifier key is pressed", () => {
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
});
