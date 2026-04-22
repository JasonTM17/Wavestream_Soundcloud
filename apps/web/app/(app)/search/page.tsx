"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/lib/player-store";
import { formatCompactNumber, toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import { useGenresQuery, useSearchQuery } from "@/lib/wavestream-queries";

type SearchScope = "all" | "tracks" | "artists" | "playlists" | "genres";

const scopes: Array<{ value: SearchScope; label: string }> = [
  { value: "all", label: "All" },
  { value: "tracks", label: "Tracks" },
  { value: "artists", label: "Artists" },
  { value: "playlists", label: "Playlists" },
  { value: "genres", label: "Genres" },
];

function ResultSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-16 w-16 rounded-md" />
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
  const [scope, setScope] = React.useState<SearchScope>("all");
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

  const showTracks = scope === "all" || scope === "tracks";
  const showArtists = scope === "all" || scope === "artists";
  const showPlaylists = scope === "all" || scope === "playlists";
  const showGenres = scope === "all" || scope === "genres";

  const hasVisibleResults =
    (showTracks && tracks.length > 0) ||
    (showArtists && artists.length > 0) ||
    (showPlaylists && playlists.length > 0) ||
    (showGenres && genresResults.length > 0);

  const applyQuickSearch = (value: string) => {
    setScope("all");
    setQuery(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Live search covers tracks, artists, playlists, and genres.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search catalog"
              className="pl-11"
              placeholder="Search tracks, creators, playlists, genres"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {scopes.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={scope === item.value ? "default" : "outline"}
                onClick={() => setScope(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!hasQuery ? (
        <Card className="border-0 bg-[#181818]">
          <CardContent className="space-y-2 p-6">
            <p className="font-bold text-white">Start typing to search the catalog</p>
            <p className="text-sm text-[#b3b3b3]">
              Search is wired to the live API and will surface real results as soon as you type.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasQuery ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {search.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <ResultSkeleton key={index} />)
          ) : hasVisibleResults ? (
            <>
              {showTracks ? (
                <Card className="xl:col-span-2">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tracks</CardTitle>
                      <CardDescription>
                        {formatCompactNumber(tracks.length)} matching track
                        {tracks.length === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playFirstResult}
                      disabled={!firstTrack}
                    >
                      <Play className="h-4 w-4" />
                      Play first result
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-2 md:grid-cols-2">
                    {tracks.length ? (
                      tracks.map((track, index) => {
                        const card = toTrackCard(track);
                        return (
                          <Link
                            key={card.id}
                            href={`/track/${card.slug}`}
                            className="group flex items-center gap-4 rounded-md bg-[#1f1f1f] p-3 transition-colors hover:bg-[#282828]"
                          >
                            <div
                              className="h-14 w-14 rounded-md bg-gradient-to-br from-[#1ed760] to-[#169c46]"
                              style={
                                card.coverUrl
                                  ? {
                                      backgroundImage: `url(${card.coverUrl})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }
                                  : undefined
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-white group-hover:text-[#1ed760] transition-colors">{card.title}</p>
                              <p className="truncate text-sm text-[#b3b3b3]">
                                {card.artistName} • {card.genreLabel}
                              </p>
                            </div>
                            <div className="text-right text-xs text-[#b3b3b3]">
                              <p>{card.playsLabel} plays</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="rounded-md bg-[#1f1f1f] p-6 text-sm text-[#b3b3b3] md:col-span-2">
                        No tracks matched this query.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {showArtists ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Artists</CardTitle>
                    <CardDescription>Creator profiles surfaced by the search API.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {artists.length ? (
                      artists.map((artist) => (
                        <Link
                          key={artist.id}
                          href={`/artist/${artist.username}`}
                          className="group flex items-center gap-3 rounded-md bg-[#1f1f1f] p-3 transition-colors hover:bg-[#282828]"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#1ed760] text-black text-sm font-bold">
                              {artist.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white">{artist.displayName}</p>
                            <p className="text-sm text-[#b3b3b3]">
                              @{artist.username} • {artist.bio ?? "Creator profile"}
                            </p>
                          </div>
                          <Badge variant="soft">
                            {formatCompactNumber(artist.followerCount ?? 0)} followers
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-md bg-[#1f1f1f] p-4 text-sm text-[#b3b3b3]">No artist matches.</div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {showPlaylists ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Playlists</CardTitle>
                    <CardDescription>Collections returned by the same live query.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {playlists.length ? (
                      playlists.map((playlist) => {
                        const card = toPlaylistCard(playlist);
                        return (
                          <Link
                            key={card.id}
                            href={`/playlist/${card.slug}`}
                            className="group flex items-center gap-4 rounded-md bg-[#1f1f1f] p-3 transition-colors hover:bg-[#282828]"
                          >
                            <div
                              className="h-14 w-14 rounded-md bg-[#282828]"
                              style={
                                card.coverUrl
                                  ? {
                                      backgroundImage: `url(${card.coverUrl})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }
                                  : undefined
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-white">{card.title}</p>
                              <p className="truncate text-sm text-[#b3b3b3]">
                                {card.ownerName} • {card.description || "No description"}
                              </p>
                            </div>
                            <Badge variant="soft">{card.trackCount} tracks</Badge>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="rounded-md bg-[#1f1f1f] p-4 text-sm text-[#b3b3b3]">No playlist matches.</div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {showGenres ? (
                <Card className={scope === "genres" ? "xl:col-span-2" : undefined}>
                  <CardHeader>
                    <CardTitle>Genres</CardTitle>
                    <CardDescription>
                      Click a genre chip to reuse it as the current query instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {genresResults.length ? (
                      genresResults.map((genre) => (
                        <Button
                          key={genre.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applyQuickSearch(genre.name)}
                        >
                          {genre.name}
                        </Button>
                      ))
                    ) : (
                      <div className="w-full rounded-md bg-[#1f1f1f] p-4 text-sm text-[#b3b3b3]">No genre matches.</div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <Card className="xl:col-span-2 border-0 bg-[#181818]">
              <CardContent className="space-y-2 p-6">
                <p className="font-bold text-white">No results found</p>
                <p className="text-sm text-[#b3b3b3]">
                  Try a different query or switch back to <span className="font-medium text-white">All</span> to broaden the current search.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Browse Genres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(genres.data ?? []).length ? (
            (genres.data ?? []).map((genre) => (
              <Button
                key={genre.id}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyQuickSearch(genre.name)}
              >
                {genre.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-[#b3b3b3]">
              No genres have been loaded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
