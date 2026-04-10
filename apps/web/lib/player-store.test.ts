import { afterEach, describe, expect, it } from "vitest";

import { usePlayerStore } from "./player-store";

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

describe("player store", () => {
  it("loads a queue and advances through tracks with wraparound", () => {
    const store = usePlayerStore.getState();

    store.setQueue(queue);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");
    expect(usePlayerStore.getState().progress).toBe(0);

    store.nextTrack();
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    expect(usePlayerStore.getState().progress).toBe(0);

    store.nextTrack();
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");

    store.previousTrack();
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
  });

  it("toggles playback controls and preserves the selected track", () => {
    const store = usePlayerStore.getState();

    store.setQueue(queue);
    store.playTrack(queue[1]);
    store.togglePlay();
    store.setVolume(0.5);
    store.toggleMute();
    store.setPlaybackRate(1.25);
    store.toggleShuffle();
    store.setRepeat("all");
    store.setProgress(83);

    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    expect(usePlayerStore.getState().volume).toBe(0.5);
    expect(usePlayerStore.getState().muted).toBe(true);
    expect(usePlayerStore.getState().playbackRate).toBe(1.25);
    expect(usePlayerStore.getState().shuffle).toBe(true);
    expect(usePlayerStore.getState().repeat).toBe("all");
    expect(usePlayerStore.getState().progress).toBe(83);
  });
});
