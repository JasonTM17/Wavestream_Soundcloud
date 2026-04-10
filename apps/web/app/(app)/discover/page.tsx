import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { discoveryTags, featuredArtists, featuredPlaylists, trendingTracks } from "@/lib/mock-data";

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,189,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,197,90,0.12),transparent_26%)]" />
          <CardHeader className="relative">
            <Badge variant="soft" className="w-fit">Discovery feed</Badge>
            <CardTitle className="text-3xl">Trending tracks, reposts, and new releases.</CardTitle>
            <CardDescription className="max-w-2xl">
              A premium, responsive start for listeners with curated rails and queue-aware playback state.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-wrap items-center gap-3">
            <Button>
              Start playing
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild>
              <Link href="/creator">Upload your own track</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listening pulse</CardTitle>
            <CardDescription>Demo metrics to keep the shell feeling alive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Tracked plays", 72],
              ["Likes this hour", 46],
              ["Reposts", 35],
            ].map(([label, value]) => (
              <div key={label as string} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{value as number}</span>
                </div>
                <Progress value={value as number} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trending tracks</CardTitle>
            <CardDescription>The top songs are already wired for queue and detail pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingTracks.map((track) => (
              <Link
                key={track.id}
                href={`/track/${track.id}`}
                className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/70 p-3 transition hover:-translate-y-0.5 hover:border-primary/35"
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${track.cover}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {track.artist} · {track.genre}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="soft">{track.duration}</Badge>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured artists</CardTitle>
              <CardDescription>Creators with polished profiles and a strong release cadence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="flex items-start gap-3 rounded-3xl border border-border/70 bg-background/70 p-3 transition hover:border-primary/35"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">{artist.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-sm text-muted-foreground">{artist.bio}</p>
                  </div>
                  <Badge variant="soft">{artist.followers}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genres and moods</CardTitle>
              <CardDescription>Clean tag rail for quick discovery.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {discoveryTags.map((tag) => (
                <Badge key={tag} variant="outline" className="px-4 py-2 text-sm">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Featured playlists</CardTitle>
          <CardDescription>Editorial curation for listeners who want a quick start.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {featuredPlaylists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="rounded-[1.8rem] border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/35"
            >
              <div className={`h-36 rounded-[1.4rem] bg-gradient-to-br ${playlist.cover}`} />
              <p className="mt-4 font-medium">{playlist.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{playlist.description}</p>
              <Badge variant="soft" className="mt-4">
                {playlist.tracks}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
