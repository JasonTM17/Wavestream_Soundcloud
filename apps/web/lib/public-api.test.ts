import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PublicApiModule = typeof import("./public-api");

let publicApi: PublicApiModule;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.wavestream.test");
  publicApi = await import("./public-api");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("public-api", () => {
  it("loads discovery and genres from public endpoints without auth headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith("/api/discovery/home")) {
        return new Response(
          JSON.stringify({
            trending: [
              {
                id: "track-1",
                slug: "midnight-drive",
                title: "Midnight Drive",
                duration: 245,
                playCount: 1842,
                likeCount: 120,
                repostCount: 16,
                commentCount: 9,
                artist: {
                  id: "artist-1",
                  username: "luna",
                  displayName: "Luna Echo",
                  role: "creator",
                },
              },
            ],
            recentUploads: [],
            popularPlaylists: [],
            featuredArtists: [],
            genres: [],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      if (url.endsWith("/api/genres")) {
        return new Response(JSON.stringify([{ id: "genre-1", name: "Synthwave", slug: "synthwave" }]), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await publicApi.getPublicLandingData();

    expect(result.trendingTracks).toHaveLength(1);
    expect(result.genres).toHaveLength(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const [firstCall] = fetchSpy.mock.calls;
    const headers = new Headers(firstCall[1]?.headers);
    expect(headers.get("authorization")).toBeNull();
    expect(headers.get("accept")).toBe("application/json");
  });

  it("falls back to public track and playlist feeds when discovery is unavailable", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith("/api/discovery/home")) {
        return new Response("unavailable", { status: 503 });
      }

      if (url.endsWith("/api/tracks?limit=12")) {
        return new Response(
          JSON.stringify([
            {
              id: "track-1",
              slug: "midnight-drive",
              title: "Midnight Drive",
              duration: 245,
              playCount: 1842,
              likeCount: 120,
              repostCount: 16,
              commentCount: 9,
              artist: {
                id: "artist-1",
                username: "luna",
                displayName: "Luna Echo",
                role: "creator",
              },
            },
          ]),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      if (url.endsWith("/api/playlists?limit=6")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      if (url.endsWith("/api/genres")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await publicApi.getPublicLandingData();

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(result.trendingTracks).toHaveLength(1);
    expect(result.featuredArtists).toHaveLength(1);
  });

  it("normalizes backend discovery keys into landing rails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith("/api/discovery/home")) {
        return new Response(
          JSON.stringify({
            data: {
              trending: [
                {
                  id: "track-2",
                  slug: "afterglow",
                  title: "Afterglow",
                  duration: 198,
                  playCount: 956,
                  likeCount: 88,
                  repostCount: 12,
                  commentCount: 4,
                  artist: {
                    id: "artist-2",
                    username: "solis",
                    displayName: "Solis Kim",
                    role: "creator",
                  },
                },
              ],
              recentUploads: [
                {
                  id: "track-3",
                  slug: "coastal-static",
                  title: "Coastal Static",
                  duration: 221,
                  playCount: 402,
                  likeCount: 33,
                  repostCount: 4,
                  commentCount: 2,
                  artist: {
                    id: "artist-3",
                    username: "north",
                    displayName: "North Glass",
                    role: "creator",
                  },
                },
              ],
              popularPlaylists: [
                {
                  id: "playlist-1",
                  slug: "night-sets",
                  title: "Night Sets",
                  description: "Curated late-hour tracks",
                  isPublic: true,
                  trackCount: 6,
                  totalDuration: 1440,
                  owner: {
                    id: "artist-2",
                    username: "solis",
                    displayName: "Solis Kim",
                    role: "creator",
                  },
                  tracks: [],
                },
              ],
              genres: [],
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      if (url.endsWith("/api/genres")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await publicApi.getPublicLandingData();

    expect(result.trendingTracks).toHaveLength(1);
    expect(result.newReleases).toHaveLength(1);
    expect(result.featuredPlaylists).toHaveLength(1);
    expect(result.featuredArtists).toHaveLength(2);
    expect(result.featuredArtists.map((artist) => artist.username)).toEqual(
      expect.arrayContaining(["solis", "north"]),
    );
  });
});
