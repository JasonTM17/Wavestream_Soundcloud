# WaveStream Web

[English](./README.md) | [Tiếng Việt](./README.vi.md)

Next.js 16 App Router frontend for WaveStream. Handles the public landing experience, auth flows, app shell, discovery, track & playlist pages, library, creator tools, and the persistent audio player.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| UI Library | React 19, Radix UI, Tailwind CSS 4 |
| State | TanStack Query (server state), Zustand (player/playback) |
| Auth | JWT access token in memory, refresh cookie via HttpOnly |
| i18n | Custom context-based provider — Vietnamese (default) + English |
| Testing | Vitest + Testing Library (unit), Playwright (E2E) |

---

## Quick Start

```bash
# From monorepo root — starts web + API together
pnpm dev

# Or from this directory only
pnpm install
pnpm dev
```

App runs at `http://localhost:3000`. Expects the API and Docker services from the monorepo root.

---

## Scripts

```bash
pnpm dev          # Development server with Fast Refresh
pnpm build        # Production build (Next.js standalone)
pnpm start        # Start production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict check (no emit)
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end (builds first)
```

---

## Directory Map

```
app/
├── (marketing)/    # Landing page — public, server-rendered
├── (auth)/         # Sign in, sign up, forgot/reset password
└── (app)/          # Authenticated app — discover, track, playlist,
                    # artist, library, creator, admin

components/
├── ui/             # Radix-based design system primitives
├── auth/           # Auth provider, forms, guards
├── player/         # Persistent audio player shell + waveform
├── playlists/      # Playlist cards, dialogs, editors
└── ...

lib/
├── api.ts          # HTTP client with JWT refresh logic
├── wavestream-api.ts    # Domain API functions
├── wavestream-queries.ts # TanStack Query hooks
├── auth-store.ts   # Auth session Zustand store
├── player-store.ts # Audio player Zustand store
└── i18n/           # i18n context, dictionaries (vi, en), hooks
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:4000`) |

Additional variables are inherited from the root `.env.example`.

---

## Notes

- The app uses `next-themes` for dark/light mode with system preference detection.
- `pnpm test:e2e` builds the Next.js app before running Playwright — allow 2–3 minutes on first run.
- Shared data contracts come from `@wavestream/shared` — always keep this package in sync when changing API types.
