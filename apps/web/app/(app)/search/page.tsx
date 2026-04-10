"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Play } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/lib/player-store";
import { formatCompactNumber, toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import { useGenresQuery, useSearchQuery } from "@/lib/wavestream-queries";

const suggestionPills = ["Tracks", "Artists", "Playlists", "Genres", "Recent uploads"];

function ResultSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const search = useSearchQuery(query);
  const genres = useGenresQuery();
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const firstTrack = search.data?.tracks?.[0];
  const playFirstResult = () => {
    if (!firstTrack) {
      return;
    }

    const queue = search.data?.tracks?.map(toTrackCard) ?? [];
    setQueue(queue);
    playTrack(queue[0]);
  };

  const hasQuery = query.trim().length > 0;
  const tracks = search.data?.tracks ?? [];
  const artists = search.data?.artists ?? [];
  const playlists = search.data?.playlists ?? [];
  const genresResults = search.data?.genres ?? genres.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Live search covers tracks, artists, playlists, and genres. If a backend endpoint is
            missing, the page stays readable and empty rather than falling back to fake content.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-11"
              placeholder="Search tracks, creators, playlists, genres"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="outline" disabled>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {suggestionPills.map((filter) => (
          <Badge key={filter} variant="outline" className="px-4 py-2 text-sm">
            {filter}
          </Badge>
        ))}
      </div>

      {!hasQuery ? (
        <Card className="border-dashed">
          <CardContent className="space-y-2 p-6">
            <p className="font-medium">Start typing to search the catalog</p>
            <p className="text-sm text-muted-foreground">
              Search is wired to the live API and will surface real results as soon as you type a
              query.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasQuery ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {search.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <ResultSkeleton key={index} />)
          ) : tracks.length || artists.length || playlists.length || genresResults.length ? (
            <>
              {tracks.length ? (
                <Card className="xl:col-span-2">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tracks</CardTitle>
                      <CardDescription>
                        {formatCompactNumber(tracks.length)} matching track
                        {tracks.length === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={playFirstResult} disabled={!firstTrack}>
                      <Play className="h-4 w-4" />
                      Play first result
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {tracks.map((track, index) => {
                      const card = toTrackCard(track);
                      return (
                        <Link
                          key={card.id}
                          href={`/track/${card.slug}`}
                          className="flex items-center gap-4 rounded-3xl border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/35"
                        >
                          <div
                            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500"
                            style={
                              card.coverUrl
                                ? {
                                    backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.2), rgba(7, 11, 24, 0.45)), url(${card.coverUrl})`,
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
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {card.playsLabel} plays
                            </p>
                          </div>
                          <Badge variant="soft">#{index + 1}</Badge>
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              ) : (
                <Card className="xl:col-span-2 border-dashed">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No tracks matched this query.
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Artists</CardTitle>
                  <CardDescription>Creator profiles surfaced by the search API.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {artists.length ? (
                    artists.map((artist) => (
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
                          <p className="text-sm text-muted-foreground">
                            @{artist.username} | {artist.bio ?? "Creator profile"}
                          </p>
                        </div>
                        <Badge variant="soft">
                          {formatCompactNumber(artist.followerCount ?? 0)}
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No artist matches.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Playlists and genres</CardTitle>
                  <CardDescription>Supporting catalog results from the same query.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playlists.length ? (
                    <div className="space-y-3">
                      {playlists.map((playlist) => {
                        const card = toPlaylistCard(playlist);
                        return (
                          <Link
                            key={card.id}
                            href={`/playlist/${card.slug}`}
                            className="flex items-center gap-4 rounded-3xl border border-border/70 bg-background/70 p-3 transition hover:border-primary/35"
                          >
                            <div
                              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700"
                              style={
                                card.coverUrl
                                  ? {
                                      backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.2), rgba(7, 11, 24, 0.45)), url(${card.coverUrl})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }
                                  : undefined
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{card.title}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                {card.ownerName} | {card.description}
                              </p>
                            </div>
                            <Badge variant="soft">{card.trackCount}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}

                  {genresResults.length ? (
                    <div className="flex flex-wrap gap-2">
                      {genresResults.map((genre) => (
                        <Badge key={genre.id} variant="outline" className="px-4 py-2 text-sm">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {!playlists.length && !genresResults.length ? (
                    <p className="text-sm text-muted-foreground">No playlist or genre matches.</p>
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="xl:col-span-2 border-dashed">
              <CardContent className="space-y-2 p-6">
                <p className="font-medium">No results found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different query or wait for more seeded content to be added.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Genres</CardTitle>
          <CardDescription>Rendered from `/api/genres`, with an empty-state fallback.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(genres.data ?? []).length ? (
            (genres.data ?? []).map((genre) => (
              <Badge key={genre.id} variant="outline" className="px-4 py-2 text-sm">
                {genre.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No genres have been loaded yet. Search still works against tracks, artists, and
              playlists.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

