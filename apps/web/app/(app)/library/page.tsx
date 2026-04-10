import { Clock3, Heart, LibraryBig, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { featuredArtists, featuredPlaylists, trendingTracks } from "@/lib/mock-data";

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Listening history", "124 tracks", Clock3],
          ["Liked tracks", "86 tracks", Heart],
          ["Following", "24 creators", Users],
          ["Playlists", "12 collections", LibraryBig],
        ].map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{value as string}</p>
                <p className="text-sm text-muted-foreground">{label as string}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent listening</CardTitle>
            <CardDescription>Resume where you left off with a persistent queue state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingTracks.map((track, index) => (
              <div key={track.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${track.cover}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{track.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
                  </div>
                  <Badge variant="soft"># {index + 1}</Badge>
                </div>
                <div className="mt-4">
                  <Progress value={40 + index * 15} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved playlists</CardTitle>
              <CardDescription>Collections ready for future add/remove track actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredPlaylists.map((playlist) => (
                <div key={playlist.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="font-medium">{playlist.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{playlist.description}</p>
                  <Badge variant="soft" className="mt-3">{playlist.tracks}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creators you follow</CardTitle>
              <CardDescription>Profiles rendered with avatars and stats.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredArtists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/70 p-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                      {artist.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{artist.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{artist.handle}</p>
                  </div>
                  <Badge variant="outline">{artist.followers}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
