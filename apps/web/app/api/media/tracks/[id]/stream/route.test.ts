import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type RouteModule = typeof import("./route");

let routeModule: RouteModule;

const getHeaderValue = (headers: unknown, name: string) => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (typeof headers === "object") {
    const record = headers as Record<string, unknown>;
    const directValue = record[name] ?? record[name.toLowerCase()] ?? record[name.toUpperCase()];
    if (typeof directValue === "string") {
      return directValue;
    }

    const entries = (headers as { entries?: () => Iterable<[string, string]> }).entries?.();
    if (entries) {
      const match = Array.from(entries).find(
        ([key]) => key.toLowerCase() === name.toLowerCase(),
      );
      return match?.[1] ?? null;
    }
  }

  return null;
};

const createRequest = (refreshToken?: string, range?: string) =>
  (() => {
    const request = new Request(
      "https://www.wavestream.test/api/media/tracks/track-1/stream",
      {
        headers: range ? { range } : undefined,
      },
    );

    Object.defineProperty(request, "cookies", {
      configurable: true,
      value: {
        get: vi.fn((name: string) =>
          name === "wavestream_refresh_token" && refreshToken
            ? { value: refreshToken }
            : undefined,
        ),
      },
    });

    return request as never;
  })();

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.wavestream.test");
  routeModule = await import("./route");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET /api/media/tracks/[id]/stream", () => {
  it("forwards range requests and preserves media headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("chunked-audio", {
        status: 206,
        headers: {
          "content-type": "audio/mpeg",
          "content-length": "13",
          "content-range": "bytes 0-12/13",
          "accept-ranges": "bytes",
          etag: '"track-1"',
          "last-modified": "Sat, 11 Apr 2026 00:00:00 GMT",
        },
      }),
    );

    const response = await routeModule.GET(
      createRequest(undefined, "bytes=0-12"),
      { params: { id: "track-1" } },
    );

    expect(response.status).toBe(206);
    expect(await response.text()).toBe("chunked-audio");
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("content-length")).toBe("13");
    expect(response.headers.get("content-range")).toBe("bytes 0-12/13");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("etag")).toBe('"track-1"');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.wavestream.test/api/tracks/track-1/stream");
    expect(init?.method).toBe("GET");
    expect(getHeaderValue(init?.headers, "range")).toBe("bytes=0-12");
    expect(getHeaderValue(init?.headers, "authorization")).toBeNull();
  });

  it("retries once through refresh cookies and forwards the rotated cookie", async () => {
    let streamCalls = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tracks/track-1/stream") && method === "GET" && streamCalls++ === 0) {
        return new Response(null, { status: 403 });
      }

      if (url.endsWith("/api/auth/refresh") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              tokens: {
                accessToken: "fresh-access-token",
              },
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "set-cookie":
                "wavestream_refresh_token=rotated-refresh; Path=/; HttpOnly; SameSite=Lax",
            },
          },
        );
      }

      if (url.endsWith("/api/tracks/track-1/stream") && method === "GET") {
        expect(getHeaderValue(init?.headers, "authorization")).toBe(
          "Bearer fresh-access-token",
        );
        expect(getHeaderValue(init?.headers, "range")).toBe("bytes=0-12");

        return new Response("retry-stream", {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "content-length": "12",
          },
        });
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });

    const response = await routeModule.GET(
      createRequest("initial-refresh", "bytes=0-12"),
      { params: { id: "track-1" } },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("retry-stream");
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("content-length")).toBe("12");
    expect(response.headers.get("set-cookie")).toContain("wavestream_refresh_token=rotated-refresh");
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const [, refreshInit] = fetchSpy.mock.calls[1];
    expect(refreshInit?.method).toBe("POST");
    expect(getHeaderValue(refreshInit?.headers, "cookie")).toBe(
      "wavestream_refresh_token=initial-refresh",
    );
  });

  it("returns a media-safe error without retrying when refresh is unavailable", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    const response = await routeModule.GET(createRequest(), {
      params: { id: "track-1" },
    });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
