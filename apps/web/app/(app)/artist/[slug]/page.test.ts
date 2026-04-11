import { describe, expect, it } from "vitest";

import { buildArtistStats } from "./page";

describe("buildArtistStats", () => {
  it("derives artist summary cards from loaded track and playlist data", () => {
    const stats = buildArtistStats({
      followerCount: 12800,
      trackCount: 12,
      playlistCount: 4,
      totalPlays: 84321,
      totalLikes: 6021,
    });

    expect(stats).toEqual([
      ["Followers", expect.any(String)],
      ["Uploaded tracks", expect.any(String)],
      ["Public playlists", expect.any(String)],
      ["Total plays", expect.any(String)],
      ["Total likes", expect.any(String)],
    ]);
    expect(stats[0]?.[1]).toBe("13K");
    expect(stats[3]?.[1]).toBe("84K");
  });
});
