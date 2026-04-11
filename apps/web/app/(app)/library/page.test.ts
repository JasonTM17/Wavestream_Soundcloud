import { describe, expect, it } from "vitest";

import { buildLibraryStats } from "./page";

describe("buildLibraryStats", () => {
  it("renders live library aggregates without any liked-tracks placeholder copy", () => {
    const stats = buildLibraryStats({
      historyCount: 18,
      followingCount: 7,
      trackCount: 4,
      playlistCount: 5,
    });

    expect(stats).toHaveLength(4);
    expect(stats.map(([label, value]) => [label, value])).toEqual([
      ["Listening history", "18 tracks"],
      ["Following", "7 creators"],
      ["My uploads", "4 tracks"],
      ["Playlists", "5 collections"],
    ]);
  });
});
