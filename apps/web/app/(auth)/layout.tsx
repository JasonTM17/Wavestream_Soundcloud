import { Suspense } from "react";
import Link from "next/link";
import { Headphones, Music4, Sparkles } from "lucide-react";

import { AuthPageGuard } from "@/components/protected-route";
import { SiteCredits } from "@/components/site-credits";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
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
        <main className="min-h-screen px-4 py-6 lg:px-6">
          <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-border/85 bg-card/92 shadow-[0_30px_80px_-35px_rgba(10,13,25,0.42)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
            <section className="hidden flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(38,189,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(239,197,90,0.14),transparent_30%),linear-gradient(180deg,rgba(7,11,24,0.97),rgba(14,22,40,0.92))] p-8 text-white lg:flex">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                    <Music4 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight">WaveStream</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/65">
                      Creator audio platform
                    </p>
                  </div>
                </Link>
                <ThemeToggle
                  className="border-white/18 bg-white/10 text-white shadow-sm hover:border-white/22 hover:bg-white/16 hover:text-white"
                />
              </div>

              <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/88 shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  Secure auth for listeners, creators, and admins
                </div>
                <h1 className="text-5xl font-semibold tracking-tight text-balance">
                  Sign in, create an account, or reset your password with a polished local flow.
                </h1>
                <p className="text-lg leading-8 text-white/76">
                  WaveStream supports creator and listener onboarding, protected access for the
                  right roles, and password reset emails through the local Mailpit setup.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary" className="rounded-full">
                    <Link href="/">
                      <Headphones className="h-4 w-4" />
                      Listen now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/18 bg-white/8 text-white shadow-sm hover:bg-white/14 hover:text-white"
                  >
                    <Link href="/discover">Preview the feed</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/58">
                        Featured track
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {spotlightTrack?.title ?? "Public feed loading"}
                      </p>
                      <p className="text-sm text-white/72">
                        {spotlightTrack
                          ? `${spotlightTrack.artist.displayName} / ${formatDuration(
                              spotlightTrack.duration,
                            )} / ${formatCompactNumber(spotlightTrack.playCount)} plays`
                          : "Open the landing page to start listening to public seeded tracks."}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/8 text-white/88"
                    >
                      Live catalog
                    </Badge>
                  </div>
                </div>

                <SiteCredits inverted />
              </div>
            </section>

            <section className="flex flex-col justify-center p-4 sm:p-6 lg:p-10">
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-6 space-y-4 lg:hidden">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-400 text-white">
                        <Music4 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold tracking-tight">WaveStream</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          Creator audio platform
                        </p>
                      </div>
                    </Link>
                    <ThemeToggle />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/">Listen now</Link>
                    </Button>
                    <Button asChild variant="secondary" className="rounded-full">
                      <Link href="/discover">Preview the feed</Link>
                    </Button>
                  </div>
                </div>
                {children}
                <SiteCredits className="mt-6 lg:hidden" />
              </div>
            </section>
          </div>
        </main>
      </AuthPageGuard>
    </Suspense>
  );
}
