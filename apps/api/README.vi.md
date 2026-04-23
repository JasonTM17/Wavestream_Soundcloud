# WaveStream API

[English](./README.md) | Tiếng Việt

Backend NestJS 11 của WaveStream. Cung cấp các endpoint cho auth, tracks, playlists, discovery, notifications, analytics và kiểm duyệt nội dung.

---

## Stack

| Layer | Công nghệ |
|---|---|
| Framework | NestJS 11 (kiến trúc module) |
| Database | PostgreSQL 16 qua TypeORM (migrations + seeding) |
| Cache / Queue | Redis 7 + BullMQ (job queues cho xử lý bất đồng bộ) |
| Storage | MinIO (S3-compatible object storage) |
| Auth | JWT access token + HttpOnly refresh cookie, Passport strategies |
| Mail | Nodemailer + Mailpit (development), cấu hình cho SMTP production |
| Testing | Jest (unit + integration), Supertest (E2E) |
| API Docs | Swagger / OpenAPI (tại `/api/docs`) |

---

## Khởi động nhanh

```bash
# Từ thư mục gốc monorepo — khởi động API + tất cả services
docker compose up --build

# Phát triển local không có Docker (yêu cầu các services đang chạy)
pnpm install
pnpm start:dev
```

API chạy tại `http://localhost:4000`. Health check: `GET /api/health`.

---

## Scripts

```bash
pnpm build           # Biên dịch TypeScript
pnpm start           # Khởi động từ output đã biên dịch
pnpm start:dev       # Development server với hot-reload
pnpm lint            # ESLint
pnpm typecheck       # Kiểm tra TypeScript strict (no emit)
pnpm test            # Jest unit tests
pnpm test:e2e        # Integration và E2E test suite
pnpm migration:run   # Áp dụng TypeORM migrations còn pending
pnpm migration:revert # Hoàn tác migration cuối
pnpm migration:show  # Hiển thị trạng thái migrations
pnpm seed            # Seed dữ liệu demo (tài khoản admin, creator, listener + sample tracks)
```

---

## Cấu trúc Module

```
src/
├── main.ts                  # Bootstrap Nest runtime, global middleware, Swagger, CORS
├── app.module.ts            # Root module với database và global config
└── modules/
    ├── auth/                # JWT strategy, refresh cookies, đặt lại mật khẩu
    ├── users/               # User profiles, quan hệ follow
    ├── tracks/              # CRUD track, upload audio, streaming, reactions, comments
    ├── playlists/           # Quản lý playlist và sắp xếp track
    ├── discovery/           # Feed, trending, duyệt theo thể loại
    ├── search/              # Full-text search tracks, artists, playlists
    ├── notifications/       # Giao nhận thông báo in-app
    ├── analytics/           # Thống kê lượt nghe và tương tác cho creator
    ├── admin/               # Kiểm duyệt, xử lý báo cáo, audit log
    ├── storage/             # Tích hợp MinIO cho audio và image assets
    └── health/              # Readiness và liveness checks

src/database/
├── config/                  # Cấu hình TypeORM data source
├── entities/                # TypeORM entity definitions
├── migrations/              # Các file migration được tạo tự động
└── seeds/                   # Scripts seed dữ liệu demo
```

---

## Biến môi trường

| Nhóm | Biến |
|---|---|
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Redis | `REDIS_HOST`, `REDIS_PORT` |
| MinIO | `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET` |
| JWT | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` |
| Admin seed | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| App routing | `FRONTEND_URL`, `INTERNAL_API_URL` |

Xem `.env.example` ở thư mục gốc để biết tất cả các giá trị và mặc định.

---

## Lưu ý

- Migrations chạy tự động trong Docker qua dependency chain của compose — container API sẽ không khởi động cho đến khi migrations hoàn tất.
- Không để secrets trong source code và version control; luôn dùng biến môi trường.
- API documentation và interactive testing có tại `http://localhost:4000/api/docs` khi chạy local.
