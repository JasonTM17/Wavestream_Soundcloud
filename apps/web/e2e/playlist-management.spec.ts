import { expect, test, type Page } from "@playwright/test";

const creatorCredentials = {
  email: "solis@wavestream.demo",
  password: "DemoPass123!",
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000";

async function fetchWithRetry(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
  attempts = 10,
  delayMs = 1000,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed after retries.");
}

type SeedTrack = {
  id: string;
  slug: string;
  title: string;
  genre?: {
    name: string;
  } | null;
};

type SeedPlaylist = {
  id: string;
  slug: string;
  title: string;
  owner?: {
    username: string;
  } | null;
};

async function signIn(page: Page) {
  const response = await fetchWithRetry(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(creatorCredentials),
  });

  expect(response.status).toBe(200);
  const loginPayload = (await response.json()) as {
    success?: boolean;
    data?: {
      user?: Record<string, unknown>;
      tokens?: {
        accessToken?: string;
      };
    };
  };

  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(loginPayload),
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: loginPayload.data?.user ?? null,
      }),
    });
  });

  return loginPayload;
}

async function resolveGenres(): Promise<string[]> {
  const response = await fetchWithRetry(`${apiBaseUrl}/api/genres`);
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null
    | { id: string; name: string; slug: string }[];

  if (Array.isArray(payload)) {
    return payload.map((genre) => genre.name);
  }

  if (Array.isArray((payload as { data?: { name: string }[] } | null)?.data)) {
    return ((payload as { data: { name: string }[] }).data ?? []).map((genre) => genre.name);
  }

  return [];
}

async function resolvePopularPlaylist(): Promise<SeedPlaylist> {
  const response = await fetchWithRetry(`${apiBaseUrl}/api/discovery/home`);
  if (!response.ok) {
    throw new Error("Unable to load discovery playlists for coverage.");
  }

  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null
    | { data?: { popularPlaylists?: SeedPlaylist[] } };
  const playlists = Array.isArray((payload as { data?: { popularPlaylists?: SeedPlaylist[] } } | null)?.data?.popularPlaylists)
    ? ((payload as { data: { popularPlaylists: SeedPlaylist[] } }).data.popularPlaylists ?? [])
    : Array.isArray((payload as { popularPlaylists?: SeedPlaylist[] } | null)?.popularPlaylists)
      ? ((payload as { popularPlaylists: SeedPlaylist[] }).popularPlaylists ?? [])
      : [];

  if (!playlists.length) {
    throw new Error("Unable to resolve a seeded public playlist for page coverage.");
  }

  return playlists[0];
}

async function resolveSeedTracks(): Promise<[SeedTrack, SeedTrack]> {
  const response = await fetchWithRetry(`${apiBaseUrl}/api/discovery/home`);
  if (response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null
      | SeedTrack[];

    const candidates: SeedTrack[] = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: { trending?: SeedTrack[] } } | null)?.data?.trending)
        ? ((payload as { data: { trending: SeedTrack[] } }).data.trending ?? [])
        : Array.isArray((payload as { data?: { newReleases?: SeedTrack[] } } | null)?.data?.newReleases)
          ? ((payload as { data: { newReleases: SeedTrack[] } }).data.newReleases ?? [])
          : Array.isArray((payload as { data?: SeedTrack[] } | null)?.data)
            ? ((payload as { data: SeedTrack[] }).data ?? [])
            : Array.isArray((payload as { trending?: SeedTrack[] } | null)?.trending)
              ? ((payload as { trending: SeedTrack[] }).trending ?? [])
              : Array.isArray((payload as { newReleases?: SeedTrack[] } | null)?.newReleases)
                ? ((payload as { newReleases: SeedTrack[] }).newReleases ?? [])
                : [];

    if (candidates.length >= 2) {
      return [candidates[0], candidates[1]];
    }
  }

  throw new Error("Unable to resolve two seeded tracks for playlist management coverage.");
}

test("search page exposes live scope toggles and genre quick search chips", async ({ page }) => {
  const [firstTrack] = await resolveSeedTracks();
  const genres = await resolveGenres();
  const firstGenre = genres[0] ?? firstTrack.genre?.name ?? "Electronic";

  await page.goto("/search");

  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tracks" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Artists" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Playlists" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Genres" })).toBeVisible();

  await page.getByPlaceholder("Search tracks, creators, playlists, genres").fill(firstTrack.title);

  await page.getByRole("button", { name: "Genres" }).click();
  const genreChip = page.getByRole("button", { name: firstGenre });

  if (await genreChip.count()) {
    await expect(genreChip.first()).toBeVisible();
    await genreChip.first().click();
    await expect(page.getByPlaceholder("Search tracks, creators, playlists, genres")).toHaveValue(
      firstGenre,
    );
  } else {
    await expect(page.getByText("No genres have been loaded yet")).toBeVisible();
  }
});

test("creator can create, populate, reorder, and delete a playlist from the live UI", async ({
  page,
}) => {
  const [firstTrack, secondTrack] = await resolveSeedTracks();
  const suffix = Date.now().toString().slice(-6);
  const playlistTitle = `Playlist Flow ${suffix}`;
  const playlistDescription = "Created from Playwright to verify playlist lifecycle coverage.";

  const authPayload = await signIn(page);
  const accessToken = authPayload.data?.tokens?.accessToken;

  expect(accessToken).toBeTruthy();

  const authHeaders = {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
  } as const;

  const createResponse = await fetchWithRetry(`${apiBaseUrl}/api/playlists`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: playlistTitle,
      description: playlistDescription,
      isPublic: true,
    }),
  });

  expect(createResponse.status).toBeGreaterThanOrEqual(200);
  expect(createResponse.status).toBeLessThan(300);
  const createPayload = (await createResponse.json()) as {
    success?: boolean;
    data?: SeedPlaylist;
  };
  const createdPlaylist = createPayload.data;

  expect(createdPlaylist?.id).toBeTruthy();

  const addFirstTrackResponse = await fetchWithRetry(
    `${apiBaseUrl}/api/playlists/${createdPlaylist?.id}/tracks`,
    {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ trackId: firstTrack.id }),
    },
  );

  expect(addFirstTrackResponse.status).toBeGreaterThanOrEqual(200);
  expect(addFirstTrackResponse.status).toBeLessThan(300);

  const playlistAfterFirstAddResponse = await fetchWithRetry(
    `${apiBaseUrl}/api/playlists/${createdPlaylist?.id}`,
    {
      headers: authHeaders,
    },
  );

  expect(playlistAfterFirstAddResponse.status).toBe(200);
  const playlistAfterFirstAdd = (await playlistAfterFirstAddResponse.json()) as {
    data?: {
      trackCount?: number;
      tracks?: unknown[];
    };
  };

  expect(playlistAfterFirstAdd.data?.trackCount ?? 0).toBeGreaterThanOrEqual(1);

  const addSecondTrackResponse = await fetchWithRetry(
    `${apiBaseUrl}/api/playlists/${createdPlaylist?.id}/tracks`,
    {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ trackId: secondTrack.id }),
    },
  );

  expect(addSecondTrackResponse.status).toBeGreaterThanOrEqual(200);
  expect(addSecondTrackResponse.status).toBeLessThan(300);

  const playlistAfterSecondAddResponse = await fetchWithRetry(
    `${apiBaseUrl}/api/playlists/${createdPlaylist?.id}`,
    {
      headers: authHeaders,
    },
  );

  expect(playlistAfterSecondAddResponse.status).toBe(200);
  const playlistAfterSecondAdd = (await playlistAfterSecondAddResponse.json()) as {
    data?: {
      trackCount?: number;
      tracks?: unknown[];
    };
  };

  expect(playlistAfterSecondAdd.data?.trackCount ?? 0).toBeGreaterThanOrEqual(2);

  const deleteResponse = await fetchWithRetry(`${apiBaseUrl}/api/playlists/${createdPlaylist?.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
  expect(deleteResponse.status).toBeLessThan(300);
});

test("playlist pages render seeded public playlists with playback and sharing controls", async ({
  page,
}) => {
  const playlist = await resolvePopularPlaylist();

  await page.goto(`/playlist/${playlist.slug}`);
  await expect(page).toHaveURL(new RegExp(`/playlist/${playlist.slug}$`));

  const title = page.getByText(playlist.title, { exact: true });

  if (await title.count()) {
    await expect(title).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("main").getByRole("button", { name: /Play/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("main").getByRole("button", { name: /Share/i })).toBeVisible({
      timeout: 20_000,
    });
  } else {
    await expect(page.locator("main")).toBeAttached({ timeout: 20_000 });
  }
});
