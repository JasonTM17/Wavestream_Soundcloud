import { ArrowLeft, Play, Share2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { featuredPlaylists, trendingTracks } from "@/lib/mock-data";

type PlaylistPageProps = {
  params: { slug: string };
};

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const playlist = featuredPlaylists.find((item) => item.id === params.slug) ?? featuredPlaylists[0];

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="w-fit px-0">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className={`h-52 bg-gradient-to-br ${playlist.cover}`} />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="soft">Playlist</Badge>
            <Badge variant="outline">{playlist.tracks}</Badge>
          </div>
          <CardTitle className="text-4xl">{playlist.title}</CardTitle>
          <CardDescription className="max-w-2xl text-base">{playlist.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <Play className="h-4 w-4" />
            Play all
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracks in this playlist</CardTitle>
          <CardDescription>Ready for add/remove and reorder flows later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTracks.map((track, index) => (
            <div key={track.id} className="flex items-center gap-4 rounded-3xl border border-border/70 bg-background/70 p-4">
              <Badge variant="soft">#{index + 1}</Badge>
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${track.cover}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{track.title}</p>
                <p className="truncate text-sm text-muted-foreground">{track.artist} · {track.duration}</p>
              </div>
              <Badge variant="outline">{track.genre}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
