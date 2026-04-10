import { ArrowLeft, CirclePlus, UserPlus2 } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { featuredArtists, trendingTracks } from "@/lib/mock-data";

type ArtistPageProps = {
  params: { slug: string };
};

export default function ArtistPage({ params }: ArtistPageProps) {
  const artist = featuredArtists.find((item) => item.id === params.slug) ?? featuredArtists[0];

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="w-fit px-0">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="h-44 bg-[radial-gradient(circle_at_top_left,_rgba(38,189,255,0.18),transparent_30%),linear-gradient(135deg,rgba(7,11,24,0.95),rgba(18,32,58,0.92))]" />
        <CardContent className="-mt-20 grid gap-6 lg:grid-cols-[auto_1fr_auto]">
          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-2xl text-white">
              {artist.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-3 pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">Creator profile</Badge>
              <Badge variant="outline">{artist.followers} followers</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{artist.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{artist.bio}</p>
          </div>
          <div className="flex items-start gap-3 pt-8">
            <Button variant="outline">
              <UserPlus2 className="h-4 w-4" />
              Follow
            </Button>
            <Button>
              <CirclePlus className="h-4 w-4" />
              Add to queue
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded tracks</CardTitle>
            <CardDescription>Placeholder detail list for future creator uploads and reposts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingTracks.map((track, index) => (
              <div key={track.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-4">
                  <Badge variant="soft">#{index + 1}</Badge>
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${track.cover}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{track.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{track.genre} · {track.plays} plays</p>
                  </div>
                  <Badge variant="outline">{track.duration}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile stats</CardTitle>
              <CardDescription>Listener, repost, and activity summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Profile completion", 88],
                ["Weekly growth", 74],
                ["Engagement", 66],
              ].map(([label, value]) => (
                <div key={label as string} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{value as number}%</span>
                  </div>
                  <Progress value={value as number} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Playlists and reposts</CardTitle>
              <CardDescription>Future home for collaborative curation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Midnight Loop", "24 tracks"],
                ["Signal Boost", "18 tracks"],
                ["Soft Focus", "31 tracks"],
              ].map(([name, tracks]) => (
                <div key={name} className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3">
                  <span className="font-medium">{name}</span>
                  <Badge variant="soft">{tracks}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
