"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ReportableType } from "@wavestream/shared";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  PencilLine,
  Play,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ReportDialog } from "@/components/reports/report-dialog";
import { ConfirmDeleteDialog } from "@/components/playlists/confirm-delete-dialog";
import {
  PlaylistEditorDialog,
  type PlaylistEditorValues,
} from "@/components/playlists/playlist-editor-dialog";
import { ShareActionButton } from "@/components/playlists/share-action-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth-store";
import { usePlayerStore } from "@/lib/player-store";
import { toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import {
  useCreateReportMutation,
  useDeletePlaylistMutation,
  usePlaylistQuery,
  useRemoveTrackFromPlaylistMutation,
  useReorderPlaylistTracksMutation,
  useUpdatePlaylistMutation,
} from "@/lib/wavestream-queries";

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

const toPlaylistPayload = (values: PlaylistEditorValues) => ({
  title: values.title,
  description: values.description.trim() ? values.description.trim() : null,
  isPublic: values.visibility === "public",
});

export default function PlaylistPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const session = useAuthSession();
  const playlistSlug = typeof params.slug === "string" ? params.slug : "";
  const playlistQuery = usePlaylistQuery(playlistSlug);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [pendingRemoveTrackId, setPendingRemoveTrackId] = React.useState<string | null>(null);

  const playlistData = playlistQuery.data;
  const playlist = playlistData ? toPlaylistCard(playlistData) : null;
  const playlistEntries = playlistData?.tracks ?? [];

  const updatePlaylistMutation = useUpdatePlaylistMutation(playlistData?.id ?? playlistSlug);
  const deletePlaylistMutation = useDeletePlaylistMutation(playlistData?.id ?? playlistSlug);
  const removeTrackMutation = useRemoveTrackFromPlaylistMutation(playlistData?.id ?? playlistSlug);
  const reorderPlaylistMutation = useReorderPlaylistTracksMutation(playlistData?.id ?? playlistSlug);
  const createReportMutation = useCreateReportMutation();

  const isOwner =
    Boolean(session.user) &&
    Boolean(playlist) &&
    (session.user?.id === playlist?.owner.id || session.user?.role === "admin");

  const pendingRemoveTrack =
    playlistEntries.find((entry) => entry.track.id === pendingRemoveTrackId)?.track ?? null;

  if (!playlistSlug) {
    return <PlaylistSkeleton />;
  }

  if (playlistQuery.isLoading) {
    return <PlaylistSkeleton />;
  }

  if (playlistQuery.isError || !playlistData || !playlist) {
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

  const playAll = () => {
    if (!playlist.tracks.length) {
      return;
    }

    setQueue(playlist.tracks);
    playTrack(playlist.tracks[0]);
  };

  const moveTrack = async (trackId: string, direction: "up" | "down") => {
    const currentOrder = playlistEntries.map((entry) => entry.track.id);
    const currentIndex = currentOrder.indexOf(trackId);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) {
      return;
    }

    const nextOrder = [...currentOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];

    await reorderPlaylistMutation.mutateAsync({ trackIds: nextOrder });
    toast.success("Playlist order updated.");
  };

  const handleUpdatePlaylist = async (values: PlaylistEditorValues) => {
    const updatedPlaylist = await updatePlaylistMutation.mutateAsync(toPlaylistPayload(values));
    setIsEditOpen(false);
    toast.success(`Updated "${updatedPlaylist.title}".`);
  };

  const handleDeletePlaylist = async () => {
    const deletedTitle = playlist.title;
    await deletePlaylistMutation.mutateAsync();
    setIsDeleteOpen(false);
    toast.success(`Deleted "${deletedTitle}".`);
    router.push("/library");
  };

  const handleRemoveTrack = async () => {
    if (!pendingRemoveTrackId || !pendingRemoveTrack) {
      return;
    }

    await removeTrackMutation.mutateAsync(pendingRemoveTrackId);
    setPendingRemoveTrackId(null);
    toast.success(`Removed "${pendingRemoveTrack.title}" from "${playlist.title}".`);
  };

  const openReportDialog = () => {
    if (session.isBooting) {
      toast("Checking your session...");
      return;
    }

    if (!session.isAuthenticated) {
      router.push(`/sign-in?next=${encodeURIComponent(`/playlist/${playlistSlug}`)}`);
      return;
    }

    setIsReportOpen(true);
  };

  const handleCreateReport = async (values: { reason: string; details?: string | null }) => {
    await createReportMutation.mutateAsync({
      reportableType: ReportableType.PLAYLIST,
      reportableId: playlist.id,
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
            <Badge variant="outline">{playlist.isPublic ? "Public" : "Private"}</Badge>
          </div>
          <CardTitle className="text-4xl">{playlist.title}</CardTitle>
          <CardDescription className="max-w-2xl text-base">{playlist.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={playAll} disabled={!playlist.tracks.length}>
            <Play className="h-4 w-4" />
            Play all
          </Button>
          <ShareActionButton
            title={playlist.title}
            text={`Listen to the playlist ${playlist.title} on WaveStream.`}
            onSuccess={(method) => {
              toast.success(
                method === "native"
                  ? "Share sheet opened."
                  : "Playlist link copied to clipboard.",
              );
            }}
            onError={(error) => {
              toast.error(error.message);
            }}
          >
            Share
          </ShareActionButton>
          {!isOwner ? (
            <Button type="button" variant="outline" onClick={openReportDialog}>
              <ShieldAlert className="h-4 w-4" />
              Report
            </Button>
          ) : null}
          {isOwner ? (
            <>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
                <PencilLine className="h-4 w-4" />
                Edit playlist
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete playlist
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tracks in this playlist</CardTitle>
            <CardDescription>
              Queue the whole collection, or manage ordering and membership if you own it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playlistEntries.length ? (
              playlistEntries.map((entry, index) => {
                const track = toTrackCard(entry.track);
                const isFirst = index === 0;
                const isLast = index === playlistEntries.length - 1;

                return (
                  <div
                    key={track.id}
                    className="rounded-3xl border border-border/70 bg-background/70 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setQueue(playlist.tracks);
                          playTrack(track);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
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
                            Position {index + 1}
                          </p>
                        </div>
                      </button>

                      {isOwner ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isFirst || reorderPlaylistMutation.isPending}
                            onClick={() => void moveTrack(track.id, "up")}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                            Up
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isLast || reorderPlaylistMutation.isPending}
                            onClick={() => void moveTrack(track.id, "down")}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                            Down
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={removeTrackMutation.isPending}
                            onClick={() => setPendingRemoveTrackId(track.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <Card className="border-dashed bg-background/60">
                <CardContent className="space-y-2 p-6">
                  <p className="font-medium">Playlist is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Tracks will appear here after the owner adds them.
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
              <CardDescription>Owner signals and collection size at a glance.</CardDescription>
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

      <PlaylistEditorDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        initialValues={{
          title: playlist.title,
          description: playlist.description,
          visibility: playlist.isPublic ? "public" : "private",
        }}
        isPending={updatePlaylistMutation.isPending}
        onSubmit={handleUpdatePlaylist}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName={playlist.title}
        entityLabel="playlist"
        dialogDescription="Deleting this playlist removes the collection from your library and any public discovery placements."
        confirmLabel="Delete playlist"
        isPending={deletePlaylistMutation.isPending}
        onConfirm={handleDeletePlaylist}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingRemoveTrackId)}
        onOpenChange={(open) => !open && setPendingRemoveTrackId(null)}
        entityName={pendingRemoveTrack?.title}
        entityLabel="track"
        dialogTitle="Remove track from playlist"
        dialogDescription="This only removes the track from the current playlist. The original track remains live everywhere else it is allowed to appear."
        confirmLabel="Remove track"
        isPending={removeTrackMutation.isPending}
        onConfirm={handleRemoveTrack}
      />

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        entityLabel="playlist"
        entityName={playlist.title}
        isPending={createReportMutation.isPending}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
