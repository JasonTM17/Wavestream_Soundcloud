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
            trendingTracks: [
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
            newReleases: [],
            featuredPlaylists: [],
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
});
