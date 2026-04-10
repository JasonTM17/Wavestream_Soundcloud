"use client";

import Link from "next/link";
import { ArrowLeft, Play, Share2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/lib/player-store";
import { toPlaylistCard } from "@/lib/wavestream-api";
import { usePlaylistQuery } from "@/lib/wavestream-queries";

type PlaylistPageProps = {
  params: { slug: string };
};

function PlaylistSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-52 w-full rounded-none" />
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </CardHeader>
      </Card>
      <Skeleton className="h-80 w-full rounded-[2rem]" />
    </div>
  );
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const playlistQuery = usePlaylistQuery(params.slug);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);

  if (playlistQuery.isLoading) {
    return <PlaylistSkeleton />;
  }

  if (playlistQuery.isError || !playlistQuery.data) {
    return (
      <Card className="border-dashed">
        <CardContent className="space-y-3 p-8">
          <p className="text-lg font-semibold">Playlist not available</p>
          <p className="text-sm text-muted-foreground">
            The playlist may be private, missing, or the API response shape may still be evolving.
          </p>
          <Button asChild variant="outline">
            <Link href="/discover">
              <ArrowLeft className="h-4 w-4" />
              Back to discovery
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const playlist = toPlaylistCard(playlistQuery.data);

  const playAll = () => {
    if (!playlist.tracks.length) {
      return;
    }

    setQueue(playlist.tracks);
    playTrack(playlist.tracks[0]);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="w-fit px-0">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div
          className="h-52 bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700"
          style={
            playlist.coverUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.15), rgba(7, 11, 24, 0.5)), url(${playlist.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="soft">Playlist</Badge>
            <Badge variant="outline">{playlist.trackCount} tracks</Badge>
            <Badge variant="outline">{playlist.totalDurationLabel}</Badge>
          </div>
          <CardTitle className="text-4xl">{playlist.title}</CardTitle>
          <CardDescription className="max-w-2xl text-base">{playlist.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={playAll} disabled={!playlist.tracks.length}>
            <Play className="h-4 w-4" />
            Play all
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tracks in this playlist</CardTitle>
            <CardDescription>
              Tracks are sourced from the live playlist endpoint and can be queued in one click.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playlist.tracks.length ? (
              playlist.tracks.map((track, index) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setQueue(playlist.tracks);
                    playTrack(track);
                  }}
                  className="flex w-full items-center gap-4 rounded-3xl border border-border/70 bg-background/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35"
                >
                  <Badge variant="soft">#{index + 1}</Badge>
                  <div
                    className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500"
                    style={
                      track.coverUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.18), rgba(7, 11, 24, 0.48)), url(${track.coverUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{track.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artistName} | {track.genreLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{track.durationLabel}</Badge>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      #{index + 1}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <Card className="border-dashed bg-background/60">
                <CardContent className="space-y-2 p-6">
                  <p className="font-medium">Playlist is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Tracks will appear here after the creator adds them.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Playlist owner</CardTitle>
              <CardDescription>Live profile data from the backend.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                  {playlist.owner.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{playlist.owner.displayName}</p>
                <p className="text-sm text-muted-foreground">@{playlist.owner.username}</p>
              </div>
              <Badge variant="soft">{playlist.isPublic ? "Public" : "Private"}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Playlist stats</CardTitle>
              <CardDescription>Useful when the backend exposes richer playlist analytics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Tracks", playlist.trackCount],
                ["Duration", playlist.totalDurationLabel],
                ["Followers", playlist.owner.followerCount ?? 0],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{label as string}</span>
                  <span className="font-medium">{value as string | number}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
