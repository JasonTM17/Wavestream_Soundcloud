# WaveStream API

[English](./README.md) | [Tiếng Việt](./README.vi.md)

NestJS 11 backend for WaveStream. Serves auth, tracks, playlists, discovery, notifications, analytics, and moderation endpoints.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (modular architecture) |
| Database | PostgreSQL 16 via TypeORM (migrations + seeding) |
| Cache / Queue | Redis 7 + BullMQ (job queues for async processing) |
| Storage | MinIO (S3-compatible object storage) |
| Auth | JWT access token + HttpOnly refresh cookie, Passport strategies |
| Mail | Nodemailer + Mailpit (development), configurable for production SMTP |
| Testing | Jest (unit + integration), Supertest (E2E) |
| API Docs | Swagger / OpenAPI (available at `/api/docs`) |

---

## Quick Start

```bash
# From monorepo root — starts API + all services together
docker compose up --build

# Local development without Docker (requires services running)
pnpm install
pnpm start:dev
```

API runs at `http://localhost:4000`. Health check: `GET /api/health`.

---

## Scripts

```bash
pnpm build           # Compile TypeScript
pnpm start           # Start compiled output
pnpm start:dev       # Development server with hot-reload
pnpm lint            # ESLint
pnpm typecheck       # TypeScript strict check (no emit)
pnpm test            # Jest unit tests
pnpm test:e2e        # Integration and E2E test suite
pnpm migration:run   # Apply pending TypeORM migrations
pnpm migration:revert # Revert last migration
pnpm migration:show  # List migration status
pnpm seed            # Seed demo data (admin, creator, listener accounts + sample tracks)
```

---

## Module Map

```
src/
├── main.ts                  # Nest runtime bootstrap, global middleware, Swagger, CORS
├── app.module.ts            # Root module with database and global config
└── modules/
    ├── auth/                # JWT strategy, refresh cookies, password reset
    ├── users/               # User profiles, follow relationships
    ├── tracks/              # Track CRUD, audio upload, streaming, reactions, comments
    ├── playlists/           # Playlist management and track ordering
    ├── discovery/           # Feed, trending, genre browsing
    ├── search/              # Full-text search across tracks, artists, playlists
    ├── notifications/       # In-app notification delivery
    ├── analytics/           # Creator-facing play and engagement stats
    ├── admin/               # Moderation, report resolution, audit log
    ├── storage/             # MinIO integration for audio and image assets
    └── health/              # Readiness and liveness checks

src/database/
├── config/                  # TypeORM data source configuration
├── entities/                # TypeORM entity definitions
├── migrations/              # Generated migration files
└── seeds/                   # Seed scripts for demo content
```

---

## Environment Variables

| Group | Variables |
|---|---|
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Redis | `REDIS_HOST`, `REDIS_PORT` |
| MinIO | `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET` |
| JWT | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` |
| Admin seed | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| App routing | `FRONTEND_URL`, `INTERNAL_API_URL` |

See root `.env.example` for all values and defaults.

---

## Notes

- Migrations run automatically in Docker via the compose dependency chain — the API container won't start until migrations complete.
- Keep secrets out of source files and version control; always use environment variables.
- API documentation and interactive testing available at `http://localhost:4000/api/docs` when running locally.
