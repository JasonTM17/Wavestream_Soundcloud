import { Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trendingTracks } from "@/lib/mock-data";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Debounced search shell ready for tracks, artists, playlists, and genres.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-11" placeholder="Search for tracks, creators, playlists, or moods" />
          </div>
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["Tracks", "Artists", "Playlists", "Genres", "Recent uploads"].map((filter) => (
          <Badge key={filter} variant="outline" className="px-4 py-2 text-sm">
            {filter}
          </Badge>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {trendingTracks.map((track) => (
          <Card key={track.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${track.cover}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{track.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {track.artist} · {track.genre}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {track.plays} plays
                </p>
              </div>
              <Badge variant="soft">{track.duration}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
