"use client";

import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/lib/player-store";
import {
  formatCompactNumber,
  toPlaylistCard,
  toTrackCard,
} from "@/lib/wavestream-api";
import { useDiscoveryQuery, useGenresQuery } from "@/lib/wavestream-queries";

function getTrackTint(index: number) {
  const palettes = [
    "from-cyan-500 via-sky-500 to-indigo-500",
    "from-emerald-500 via-teal-500 to-sky-500",
    "from-amber-400 via-orange-400 to-rose-400",
    "from-slate-500 via-slate-700 to-slate-900",
  ];

  return palettes[index % palettes.length];
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const discovery = useDiscoveryQuery();
  const genres = useGenresQuery();
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const trendingTracks = discovery.data?.trendingTracks ?? [];
  const featuredArtists = discovery.data?.featuredArtists ?? [];
  const featuredPlaylists = discovery.data?.featuredPlaylists ?? [];
  const genreItems = genres.data ?? discovery.data?.genres ?? [];

  const startPlaying = () => {
    if (!trendingTracks.length) {
      return;
    }

    const queue = trendingTracks.map(toTrackCard);
    setQueue(queue);
    playTrack(queue[0]);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,189,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,197,90,0.12),transparent_26%)]" />
          <CardHeader className="relative space-y-4">
            <Badge variant="soft" className="w-fit">
              Discovery feed
            </Badge>
            <CardTitle className="text-3xl">
              Trending tracks, creator reposts, and fresh releases.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              WaveStream now reads from the live discovery API, so the feed reflects actual plays,
              uploads, and public playlists instead of placeholder content.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-wrap items-center gap-3">
            <Button onClick={startPlaying} disabled={!trendingTracks.length}>
              Start playing
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild>
              <Link href="/creator">Open creator dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listening pulse</CardTitle>
            <CardDescription>Live discovery metrics from the backend feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Trending tracks", trendingTracks.length],
              ["Featured playlists", featuredPlaylists.length],
              ["Featured artists", featuredArtists.length],
            ].map(([label, value], index) => (
              <div key={label as string} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{label as string}</span>
                  <span className="text-muted-foreground">{formatCompactNumber(value as number)}</span>
                </div>
                <Progress value={Math.min(100, ((value as number) + 1) * 20 + index * 7)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trending tracks</CardTitle>
            <CardDescription>
              Ranked by plays and recent activity from the discovery endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {discovery.isLoading ? (
              <SectionSkeleton />
            ) : trendingTracks.length ? (
              trendingTracks.map((track, index) => {
                const card = toTrackCard(track);
                return (
                  <Link
                    key={card.id}
                    href={`/track/${card.slug}`}
                    className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/70 p-3 transition hover:-translate-y-0.5 hover:border-primary/35"
                  >
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getTrackTint(index)}`}
                      style={
                        card.coverUrl
                          ? {
                              backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.18), rgba(7, 11, 24, 0.42)), url(${card.coverUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{card.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {card.artistName} | {card.genreLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="soft">{card.durationLabel}</Badge>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <Card className="border-dashed bg-background/60">
                <CardContent className="space-y-2 p-6">
                  <p className="font-medium">No trending tracks yet</p>
                  <p className="text-sm text-muted-foreground">
                    When the backend has seeded plays, the trending rail will populate here.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured artists</CardTitle>
              <CardDescription>Creators surfaced from live discovery data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {discovery.isLoading ? (
                <SectionSkeleton />
              ) : featuredArtists.length ? (
                featuredArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.username}`}
                    className="flex items-start gap-3 rounded-3xl border border-border/70 bg-background/70 p-3 transition hover:border-primary/35"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                        {artist.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{artist.displayName}</p>
                      <p className="text-sm text-muted-foreground">{artist.bio ?? "Creator profile"}</p>
                    </div>
                    <Badge variant="soft">{formatCompactNumber(artist.followerCount)}</Badge>
                  </Link>
                ))
              ) : (
                <Card className="border-dashed bg-background/60">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No featured artists yet. Once creators publish or gain followers, their profiles
                    will appear here.
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genres and moods</CardTitle>
              <CardDescription>Pulled from `/api/genres` with a graceful fallback.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {genres.isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-24 rounded-full" />
                ))
              ) : genreItems.length ? (
                genreItems.map((genre) => (
                  <Badge key={genre.id} variant="outline" className="px-4 py-2 text-sm">
                    {genre.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No genre taxonomy has been seeded yet, so discovery filters stay hidden for now.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Featured playlists</CardTitle>
          <CardDescription>Public editorial or creator playlists from the live API.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {discovery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-36 w-full rounded-none" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : featuredPlaylists.length ? (
            featuredPlaylists.map((playlist) => {
              const card = toPlaylistCard(playlist);
              return (
                <Link
                  key={card.id}
                  href={`/playlist/${card.slug}`}
                  className="rounded-[1.8rem] border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/35"
                >
                  <div
                    className="h-36 rounded-[1.4rem] bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700"
                    style={
                      card.coverUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.18), rgba(7, 11, 24, 0.48)), url(${card.coverUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <p className="mt-4 font-medium">{card.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="soft">{card.trackCount} tracks</Badge>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {card.totalDurationLabel}
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <Card className="col-span-full border-dashed bg-background/60">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No public playlists are available yet.
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
