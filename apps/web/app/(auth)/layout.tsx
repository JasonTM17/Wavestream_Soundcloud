import { Suspense } from "react";
import Link from "next/link";
import { Headphones, Music4 } from "lucide-react";

import { AuthPageGuard } from "@/components/protected-route";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getPublicLandingData } from "@/lib/public-api";
import { formatCompactNumber, formatDuration } from "@/lib/wavestream-api";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { trendingTracks, newReleases } = await getPublicLandingData();
  const spotlightTrack = trendingTracks[0] ?? newReleases[0] ?? null;

  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <AuthPageGuard>
        <main className="min-h-screen bg-background px-4 py-6 lg:px-6">
          <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-lg lg:grid-cols-[0.92fr_1.08fr]">
            {/* Left panel — branding & featured */}
            <section className="hidden flex-col gap-8 bg-gradient-to-b from-card to-background p-8 text-foreground lg:flex border-r border-border">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Music4 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">WaveStream</p>
                    <p className="text-xs text-muted-foreground">Nền tảng âm nhạc</p>
                  </div>
                </Link>
                <ThemeToggle />
              </div>

              <div className="space-y-6">
                <div className="max-w-xl space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Âm nhạc không giới hạn
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Khám phá âm nhạc từ các nghệ sĩ trên toàn cầu. Đăng ký miễn phí.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/">
                      <Headphones className="h-4 w-4" />
                      Nghe ngay
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/discover">Khám phá</Link>
                  </Button>
                </div>
              </div>

              {spotlightTrack && (
                <div className="mt-auto rounded-xl bg-card border border-border p-5" data-testid="auth-featured-track-card">
                  <p className="text-xs text-muted-foreground mb-2">Đang thịnh hành</p>
                  <p className="text-lg font-bold text-foreground">{spotlightTrack.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {spotlightTrack.artist.displayName} · {formatDuration(spotlightTrack.duration)} · {formatCompactNumber(spotlightTrack.playCount)} lượt nghe
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground" data-testid="auth-credits">
                <Link href="/about" className="hover:text-primary transition-colors">
                  Giới thiệu
                </Link>
                {" · "}
                <span>Portfolio · Nguyễn Sơn</span>
              </div>
            </section>

            {/* Right panel — form */}
            <section className="flex flex-col justify-center bg-card p-4 sm:p-6 lg:p-10">
              <div className="mx-auto w-full max-w-lg">
                {/* Mobile logo */}
                <div className="mb-6 flex items-center justify-between lg:hidden">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                      <Music4 className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-bold text-foreground">WaveStream</p>
                  </Link>
                  <ThemeToggle />
                </div>
                {children}
                <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
                  <Link href="/about" className="hover:text-primary transition-colors">Giới thiệu</Link>
                  {" · "}Portfolio · Nguyễn Sơn
                </p>
              </div>
            </section>
          </div>
        </main>
      </AuthPageGuard>
    </Suspense>
  );
}
