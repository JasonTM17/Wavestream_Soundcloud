import { expect, test, type Page } from "@playwright/test";

const adminCredentials = {
  email: "admin@wavestream.local",
  password: "Admin123!",
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

async function signInAsAdmin(page: Page) {
  const response = await fetchWithRetry(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(adminCredentials),
  });

  expect(response.status).toBe(200);

  const loginPayload = (await response.json()) as {
    success?: boolean;
    data?: {
      user?: {
        id?: string;
        email?: string;
        username?: string;
        displayName?: string;
        role?: string;
      };
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

function paginatedBody<T>(data: T[]) {
  return {
    success: true,
    data: {
      data,
      meta: {
        page: 1,
        limit: data.length || 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };
}

async function mockAdminModerationFeeds(page: Page) {
  await page.route("**/api/admin/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          userCount: 42,
          trackCount: 128,
          playlistCount: 19,
          reportCount: 3,
          flaggedCommentCount: 5,
        },
      }),
    });
  });

  await page.route("**/api/admin/users*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "user-admin-1",
            email: "admin@wavestream.local",
            username: "admin",
            displayName: "Wave Admin",
            role: "admin",
            followerCount: 18,
            followingCount: 4,
            trackCount: 3,
            playlistCount: 2,
            deletedAt: null,
            createdAt: "2026-04-10T00:00:00.000Z",
          },
        ]),
      ),
    });
  });

  await page.route("**/api/admin/tracks*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "track-admin-1",
            title: "Late Shift",
            artistId: "artist-1",
            artistName: "Luna Echo",
            status: "published",
            privacy: "public",
            playCount: 2401,
            likeCount: 311,
            repostCount: 42,
            commentCount: 18,
            hiddenReason: null,
            deletedAt: null,
            updatedAt: "2026-04-10T00:00:00.000Z",
          },
        ]),
      ),
    });
  });

  await page.route("**/api/admin/playlists*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "playlist-admin-1",
            title: "Midnight Moderation",
            ownerId: "user-admin-1",
            ownerName: "Wave Admin",
            isPublic: true,
            trackCount: 4,
            totalDuration: 1260,
            deletedAt: null,
            updatedAt: "2026-04-10T00:00:00.000Z",
          },
        ]),
      ),
    });
  });

  await page.route("**/api/admin/comments*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "comment-admin-1",
            body: "This upload looks suspicious.",
            userId: "user-listener-1",
            username: "ivy",
            trackId: "track-admin-1",
            trackTitle: "Late Shift",
            isHidden: false,
            deletedAt: null,
            createdAt: "2026-04-10T00:00:00.000Z",
          },
        ]),
      ),
    });
  });

  await page.route("**/api/admin/reports*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "report-admin-1",
            reportableType: "track",
            reportableId: "track-admin-1",
            reason: "Spam",
            details: "Looks like repeated promotional uploads.",
            status: "pending",
            reporter: "ivy",
            resolvedBy: null,
            createdAt: "2026-04-10T00:00:00.000Z",
            resolvedAt: null,
          },
        ]),
      ),
    });
  });

  await page.route("**/api/admin/audit-logs*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        paginatedBody([
          {
            id: "audit-admin-1",
            admin: "admin",
            action: "REPORT_RESOLVED",
            entityType: "report",
            entityId: "report-admin-1",
            details: { note: "Reviewed by QA smoke test." },
            createdAt: "2026-04-10T00:00:00.000Z",
          },
        ]),
      ),
    });
  });
}

test("admin can reach the moderation hub and inspect the core surfaces", async ({ page }) => {
  await signInAsAdmin(page);
  await mockAdminModerationFeeds(page);

  page.on("pageerror", (error) => {
    console.log(`PAGEERROR: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log(`CONSOLEERROR: ${message.text()}`);
    }
  });

  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Admin-only surface")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Reports" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Tracks" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Comments" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Playlists" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Audit logs" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Reports queue" })).toBeVisible();

  await page.getByRole("tab", { name: "Tracks" }).click();
  await expect(page.getByRole("heading", { name: "Track moderation" })).toBeVisible();

  await page.getByRole("tab", { name: "Comments" }).click();
  await expect(page.getByRole("heading", { name: "Comment moderation" })).toBeVisible();

  await page.getByRole("tab", { name: "Playlists" }).click();
  await expect(page.getByRole("heading", { name: "Playlist moderation" })).toBeVisible();

  await page.getByRole("tab", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "User roles" })).toBeVisible();

  await page.getByRole("tab", { name: "Audit logs" }).click();
  await expect(page.getByRole("heading", { name: "Audit logs" })).toBeVisible();
});
