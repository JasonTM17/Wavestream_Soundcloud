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
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <AuthPageGuard>
        <main className="min-h-screen bg-black px-4 py-6 lg:px-6">
          <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-lg lg:grid-cols-[0.92fr_1.08fr]">
            {/* Left panel — branding & featured */}
            <section className="hidden flex-col gap-8 bg-gradient-to-b from-[#1f1f1f] to-[#121212] p-8 text-white lg:flex">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760]">
                    <Music4 className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">WaveStream</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                      Creator audio platform
                    </p>
                  </div>
                </Link>
                <ThemeToggle />
              </div>

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#282828] px-4 py-2 text-sm text-[#b3b3b3]">
                  <Sparkles className="h-4 w-4 text-[#1ed760]" />
                  Secure auth for listeners, creators, and admins
                </div>
                <div className="max-w-xl space-y-6">
                  <h1 className="text-5xl font-bold tracking-tight text-balance">
                    Sign in, create an account, or reset your password with a polished local flow.
                  </h1>
                  <p className="text-lg leading-8 text-[#b3b3b3]">
                    WaveStream supports creator and listener onboarding, protected access for the
                    right roles, and password reset emails through the local Mailpit setup.
                  </p>
                </div>
                <div
                  data-testid="auth-cta-row"
                  className="flex flex-wrap gap-3 pt-1"
                >
                  <Button asChild size="lg">
                    <Link href="/">
                      <Headphones className="h-4 w-4" />
                      Listen now
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/discover">Preview the feed</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-4">
                <div
                  data-testid="auth-featured-track-card"
                  className="rounded-lg bg-[#282828] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                        Featured track
                      </p>
                      <p className="mt-2 text-xl font-bold">
                        {spotlightTrack?.title ?? "Public feed loading"}
                      </p>
                      <p className="text-sm text-[#b3b3b3]">
                        {spotlightTrack
                          ? `${spotlightTrack.artist.displayName} / ${formatDuration(
                              spotlightTrack.duration,
                            )} / ${formatCompactNumber(spotlightTrack.playCount)} plays`
                          : "Open the landing page to start listening to public seeded tracks."}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Live catalog
                    </Badge>
                  </div>
                </div>

                <div data-testid="auth-credits">
                  <SiteCredits inverted compact />
                </div>
              </div>
            </section>

            {/* Right panel — form */}
            <section className="flex flex-col justify-center bg-[#121212] p-4 sm:p-6 lg:p-10">
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-6 space-y-4 lg:hidden">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760]">
                        <Music4 className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-white">WaveStream</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                          Creator audio platform
                        </p>
                      </div>
                    </Link>
                    <ThemeToggle />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/">Listen now</Link>
                    </Button>
                    <Button asChild size="sm">
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
