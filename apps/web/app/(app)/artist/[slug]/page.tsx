"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReportableType } from "@wavestream/shared";
import { ArrowLeft, CirclePlus, UserPlus2 } from "lucide-react";
import { toast } from "sonner";

import { ReportDialog } from "@/components/reports/report-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth-store";
import { usePlayerStore } from "@/lib/player-store";
import { formatCompactNumber, toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import {
  useArtistProfileQuery,
  useCreateReportMutation,
  usePlaylistsQuery,
  useToggleFollowMutation,
  useTracksQuery,
} from "@/lib/wavestream-queries";

type ArtistPageProps = {
  params: { slug: string };
};

function ArtistSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Skeleton className="h-96 w-full rounded-[2rem]" />
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      </div>
    </div>
  );
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const router = useRouter();
  const session = useAuthSession();
  const profile = useArtistProfileQuery(params.slug);
  const artist = profile.data?.user;
  const tracksQuery = useTracksQuery({ artistUsername: params.slug, limit: 12 });
  const playlistsQuery = usePlaylistsQuery(artist?.id);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [following, setFollowing] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const followMutation = useToggleFollowMutation(artist?.id ?? "");
  const createReportMutation = useCreateReportMutation();

  React.useEffect(() => {
    setFollowing(Boolean(profile.data?.isFollowing));
  }, [profile.data?.isFollowing]);

  if (profile.isLoading) {
    return <ArtistSkeleton />;
  }

  if (profile.isError || !artist) {
    return (
      <Card className="border-dashed">
        <CardContent className="space-y-3 p-8">
          <p className="text-lg font-semibold">Artist not found</p>
          <p className="text-sm text-muted-foreground">
            The creator profile may still be private, unseeded, or unavailable from the backend.
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

  const trackCards = (tracksQuery.data ?? []).map(toTrackCard);
  const playlistCards = (playlistsQuery.data ?? []).map(toPlaylistCard);

  const playAll = () => {
    if (!trackCards.length) {
      return;
    }

    setQueue(trackCards);
    playTrack(trackCards[0]);
  };

  const openReportDialog = () => {
    if (session.isBooting) {
      toast("Checking your session...");
      return;
    }

    if (!session.isAuthenticated) {
      router.push(`/sign-in?next=${encodeURIComponent(`/artist/${params.slug}`)}`);
      return;
    }

    setIsReportOpen(true);
  };

  const handleCreateReport = async (values: { reason: string; details?: string | null }) => {
    await createReportMutation.mutateAsync({
      reportableType: ReportableType.USER,
      reportableId: artist.id,
      reason: values.reason,
      details: values.details,
    });
    setIsReportOpen(false);
    toast.success("Report submitted to the moderation queue.");
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
        <div className="h-44 bg-[radial-gradient(circle_at_top_left,_rgba(38,189,255,0.18),transparent_30%),linear-gradient(135deg,rgba(7,11,24,0.95),rgba(18,32,58,0.92))]" />
        <CardContent className="-mt-20 grid gap-6 lg:grid-cols-[auto_1fr_auto]">
          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-2xl text-white">
              {artist.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-3 pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">Creator profile</Badge>
              <Badge variant="outline">{formatCompactNumber(artist.followerCount)} followers</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{artist.displayName}</h1>
            <p className="max-w-2xl text-muted-foreground">
              {artist.bio ?? "Creator profile data is streamed live from the backend."}
            </p>
          </div>
          <div className="flex items-start gap-3 pt-8">
            <Button
              variant="outline"
              onClick={() => {
                setFollowing((value) => !value);
                followMutation.mutate(!following, {
                  onError: (error) => {
                    setFollowing((value) => !value);
                    toast.error(error instanceof Error ? error.message : "Failed to update follow.");
                  },
                });
              }}
            >
              <UserPlus2 className="h-4 w-4" />
              {following ? "Following" : "Follow"}
            </Button>
            <Button onClick={playAll} disabled={!trackCards.length}>
              <CirclePlus className="h-4 w-4" />
              Add to queue
            </Button>
            {session.user?.id !== artist.id ? (
              <Button variant="outline" onClick={openReportDialog}>
                Report
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded tracks</CardTitle>
            <CardDescription>
              This list is backed by the live tracks endpoint and remains empty if the API has not
              been seeded yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tracksQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-3xl" />
              ))
            ) : trackCards.length ? (
              trackCards.map((track, index) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setQueue(trackCards);
                    playTrack(track);
                  }}
                  className="flex w-full items-center gap-4 rounded-3xl border border-border/70 bg-background/70 p-4 text-left transition hover:border-primary/35"
                >
                  <Badge variant="soft">#{index + 1}</Badge>
                  <div
                    className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500"
                    style={
                      track.coverUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.18), rgba(7, 11, 24, 0.45)), url(${track.coverUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{track.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.genreLabel} | {track.playsLabel} plays
                    </p>
                  </div>
                  <Badge variant="outline">{track.durationLabel}</Badge>
                </button>
              ))
            ) : (
              <Card className="border-dashed bg-background/60">
                <CardContent className="space-y-2 p-6">
                  <p className="font-medium">No tracks yet</p>
                  <p className="text-sm text-muted-foreground">
                    Creator uploads will show up here once the backend has demo content or live
                    publishes.
                  </p>
                </CardContent>
              </Card>
            )}
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
                    <span>{label as string}</span>
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
              <CardDescription>Public playlists owned by this creator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {playlistsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full rounded-3xl" />
                ))
              ) : playlistCards.length ? (
                playlistCards.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlist/${playlist.slug}`}
                    className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/35"
                  >
                    <div>
                      <p className="font-medium">{playlist.title}</p>
                      <p className="text-sm text-muted-foreground">{playlist.description}</p>
                    </div>
                    <Badge variant="soft">{playlist.trackCount} tracks</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No playlists were returned for this creator.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        entityLabel="artist profile"
        entityName={artist.displayName}
        isPending={createReportMutation.isPending}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
