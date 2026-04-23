# WaveStream Web

[English](./README.md) | Tiếng Việt

Frontend Next.js 16 App Router của WaveStream. Xử lý trang landing công khai, luồng auth, app shell, discovery, trang track & playlist, thư viện, công cụ creator và trình phát nhạc cố định.

---

## Stack

| Layer | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| UI Library | React 19, Radix UI, Tailwind CSS 4 |
| State | TanStack Query (server state), Zustand (player/playback) |
| Auth | JWT access token trong bộ nhớ, refresh cookie qua HttpOnly |
| i18n | Custom context-based provider — Tiếng Việt (mặc định) + Tiếng Anh |
| Testing | Vitest + Testing Library (unit), Playwright (E2E) |

---

## Khởi động nhanh

```bash
# Từ thư mục gốc monorepo — khởi động cả web + API
pnpm dev

# Hoặc từ thư mục này
pnpm install
pnpm dev
```

App chạy tại `http://localhost:3000`. Yêu cầu API và Docker services từ thư mục gốc monorepo.

---

## Scripts

```bash
pnpm dev          # Development server với Fast Refresh
pnpm build        # Production build (Next.js standalone)
pnpm start        # Khởi động production build
pnpm lint         # ESLint
pnpm typecheck    # Kiểm tra TypeScript strict (no emit)
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end (build trước)
```

---

## Cấu trúc thư mục

```
app/
├── (marketing)/    # Landing page — public, server-rendered
├── (auth)/         # Đăng nhập, đăng ký, quên/đặt lại mật khẩu
└── (app)/          # App đã xác thực — discover, track, playlist,
                    # artist, library, creator, admin

components/
├── ui/             # Design system primitives dựa trên Radix
├── auth/           # Auth provider, forms, guards
├── player/         # Persistent audio player shell + waveform
├── playlists/      # Playlist cards, dialogs, editors
└── ...

lib/
├── api.ts          # HTTP client với JWT refresh logic
├── wavestream-api.ts    # Các hàm API theo domain
├── wavestream-queries.ts # TanStack Query hooks
├── auth-store.ts   # Auth session Zustand store
├── player-store.ts # Audio player Zustand store
└── i18n/           # i18n context, dictionaries (vi, en), hooks
```

---

## Biến môi trường

| Biến | Mô tả |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL của API backend (mặc định: `http://localhost:4000`) |

Các biến bổ sung được kế thừa từ `.env.example` ở thư mục gốc.

---

## Lưu ý

- App sử dụng `next-themes` cho dark/light mode với tính năng nhận diện system preference.
- `pnpm test:e2e` build ứng dụng Next.js trước khi chạy Playwright — lần đầu chờ 2–3 phút.
- Các data contract dùng chung từ `@wavestream/shared` — luôn đồng bộ package này khi thay đổi API types.
