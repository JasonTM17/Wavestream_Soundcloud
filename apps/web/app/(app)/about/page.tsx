import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Mail, Music4 } from "lucide-react";

import { Button } from "@/components/ui/button";

const TECH_STACK = [
  {
    category: "Frontend",
    items: [
      "Next.js 16 (App Router)",
      "React 19",
      "TypeScript 5",
      "Tailwind CSS 4",
      "Radix UI",
      "TanStack Query",
      "Zustand",
    ],
  },
  {
    category: "Backend",
    items: [
      "NestJS 11",
      "TypeORM",
      "PostgreSQL 16",
      "Redis 7",
      "BullMQ",
      "Socket.IO",
      "JWT / Passport",
    ],
  },
  {
    category: "Hạ tầng",
    items: [
      "MinIO (S3-compatible)",
      "Docker Compose",
      "GitHub Actions CI/CD",
      "GitHub Container Registry",
      "Mailpit (mail dev)",
    ],
  },
];

const FEATURES = [
  {
    title: "Listener Experience",
    desc: "Khám phá, tìm kiếm, phát nhạc, playlist, theo dõi nghệ sĩ, like, repost, bình luận.",
  },
  {
    title: "Creator Tools",
    desc: "Upload nhạc, quản lý bài đăng, xem analytics dashboard.",
  },
  {
    title: "Admin & Moderation",
    desc: "Xem xét báo cáo, ẩn/khôi phục nội dung, audit log.",
  },
  {
    title: "Auth System",
    desc: "Đăng ký, đăng nhập, refresh token tự động, đặt lại mật khẩu qua email.",
  },
  {
    title: "Persistent Player",
    desc: "Thanh phát nhạc luôn hiện diện, queue state, chuyển trang không mất nhạc.",
  },
  {
    title: "CI/CD Pipeline",
    desc: "Lint, typecheck, unit test, E2E Playwright, Docker smoke test trên mỗi PR.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <Button
        variant="ghost"
        asChild
        className="w-fit px-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Quay lại khám phá
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shrink-0">
          <Music4 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">WaveStream</h1>
          <p className="text-muted-foreground text-sm">
            Nền tảng nghe nhạc · Portfolio Project
          </p>
        </div>
      </div>

      {/* About */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Giới thiệu dự án</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          WaveStream là dự án portfolio cá nhân — một bản clone đầy đủ của SoundCloud được xây dựng
          từ đầu nhằm thể hiện khả năng phát triển full-stack ở quy mô production. Dự án bao gồm
          toàn bộ vòng đời sản phẩm: từ thiết kế API, authentication, upload file, phát nhạc
          real-time cho đến CI/CD và container hóa.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Giao diện được thiết kế theo phong cách SoundCloud với hỗ trợ song ngữ Việt–Anh,
          dark/light mode, và responsive layout trên mọi kích thước màn hình.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
            <a
              href="https://github.com/JasonTM17/wavestream_soundcloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-3.5 w-3.5" />
              Source Code
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Tính năng chính</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-xl bg-card border border-border p-4 space-y-1.5"
            >
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Công nghệ sử dụng</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TECH_STACK.map(({ category, items }) => (
            <div
              key={category}
              className="rounded-xl bg-card border border-border p-4 space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {category}
              </p>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Monorepo Architecture */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Kiến trúc Monorepo</h2>
        <div className="space-y-2">
          {[
            {
              path: "apps/web",
              desc: "Next.js frontend — landing, auth, app shell, player runtime",
            },
            {
              path: "apps/api",
              desc: "NestJS API — auth, tracks, playlists, discovery, admin, analytics",
            },
            {
              path: "packages/shared",
              desc: "DTOs, enums, validation helpers dùng chung giữa web và API",
            },
            {
              path: "docker-compose.yml",
              desc: "Orchestration đầy đủ: PostgreSQL, Redis, MinIO, Mailpit, web, API",
            },
          ].map(({ path, desc }) => (
            <div key={path} className="flex gap-3 text-sm">
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary">
                {path}
              </code>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Author */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Tác giả</h2>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">NS</span>
          </div>
          <div>
            <p className="font-bold text-foreground">Nguyễn Sơn</p>
            <p className="text-sm text-muted-foreground">Full-Stack Developer · Ho Chi Minh City</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a
              href="https://github.com/JasonTM17"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href="mailto:jasonbmt06@gmail.com">
              <Mail className="h-4 w-4" />
              jasonbmt06@gmail.com
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dự án được xây dựng vì mục đích học tập và portfolio. Mọi phản hồi, góp ý đều được
          chào đón.
        </p>
      </section>
    </div>
  );
}
