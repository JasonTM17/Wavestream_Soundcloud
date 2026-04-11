# WaveStream Demo Walkthrough

English | [Tiếng Việt](./DEMO-WALKTHROUGH.vi.md)

This is a crisp 5 to 10 minute demo script you can use for a portfolio walkthrough.

## Before You Start

- Open the app at `http://localhost:3000`.
- Keep Mailpit open at `http://localhost:8025`.
- Have the seeded accounts ready:
  - Admin: `admin@wavestream.local` / `Admin123!`
  - Creator: `solis@wavestream.demo` / `DemoPass123!`
  - Listener: `ivy@wavestream.demo` / `DemoPass123!`

## Demo Flow

1. Start on the landing page and call out the public discovery rails, featured artists, and playlists.
2. Sign in as the creator account and show that the session persists in the app shell with the sticky player and creator navigation.
3. Open a track page, play audio, and point out the queue, progress bar, like, repost, comment, and add-to-playlist actions.
4. Visit the library page to show the creator dashboard summary, listening history, and owned playlists.
5. Open a playlist and demonstrate edit, reorder, remove-track, and delete controls for the owner.
6. Switch to the listener account and show that public browsing still works while creator-only surfaces stay protected.
7. Sign in as the admin and open the moderation queue to show report previews, target labels, and deep links.
8. Open Mailpit and show the password-reset email flow end to end.

## Suggested Talking Points

- The product is built as a real monorepo, not a front-end mock.
- Audio playback is route-safe and backed by a persistent player state.
- Auth uses refresh-cookie bootstrap so the UI feels like a real app session.
- Uploaded media, playlists, and moderation actions all map to actual backend flows.

## Closing Line

If you want a short wrap-up line, use:

> WaveStream is a production-minded music platform demo with real auth, storage, playback, playlists, moderation, and Docker-first local deployment.
