import { ArrowLeft, Heart, Play, Repeat, Share2 } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { trendingTracks } from "@/lib/mock-data";

type TrackPageProps = {
  params: { slug: string };
};

export default function TrackPage({ params }: TrackPageProps) {
  const track = trendingTracks.find((item) => item.id === params.slug) ?? trendingTracks[0];

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="w-fit px-0">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">{track.genre}</Badge>
              <Badge variant="outline">{track.duration}</Badge>
              <Badge variant="outline">{track.plays} plays</Badge>
            </div>
            <CardTitle className="text-4xl">{track.title}</CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Track detail shell with waveform-ready spacing, timestamped comments, and safe
              action hooks for likes, reposts, and sharing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className={`aspect-square rounded-[2rem] bg-gradient-to-br ${track.cover} shadow-2xl`} />
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Creator</p>
                  <p className="mt-2 text-2xl font-semibold">{track.artist}</p>
                </div>
                <div className="rounded-[1.8rem] border border-border/70 bg-background/70 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Progress</span>
                    <span>2:14 / {track.duration}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <Progress value={52} />
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 18 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-12 rounded-full bg-gradient-to-b from-primary/70 via-primary/20 to-primary/5"
                          style={{ opacity: index % 3 === 0 ? 1 : 0.55 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Play className="h-4 w-4" />
                    Play
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4" />
                    Like
                  </Button>
                  <Button variant="outline">
                    <Repeat className="h-4 w-4" />
                    Repost
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comments timeline</h3>
              {[
                ["0:24", "The transition here is unbelievably smooth."],
                ["1:38", "This drop is the exact reason I saved the track."],
                ["2:55", "Great layering on the upper synths."],
              ].map(([time, body]) => (
                <div key={time} className="flex gap-3 rounded-3xl border border-border/70 bg-background/70 p-4">
                  <Badge variant="soft" className="h-fit">
                    {time}
                  </Badge>
                  <p className="text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Track stats</CardTitle>
              <CardDescription>Creator-friendly performance snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Likes", "28K"],
                ["Reposts", "11K"],
                ["Comments", "4.8K"],
                ["Queue adds", "19K"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artist</CardTitle>
              <CardDescription>Profile card ready for follow/unfollow flows.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                  {track.artist.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{track.artist}</p>
                <p className="text-sm text-muted-foreground">@{track.artist.toLowerCase().replace(/\s+/g, "")}</p>
              </div>
              <Button variant="outline">Follow</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
