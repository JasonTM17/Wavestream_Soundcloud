"use client";

import * as React from "react";
import Link from "next/link";
import { Clock3, Heart, LibraryBig, PencilLine, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/playlists/confirm-delete-dialog";
import {
  PlaylistEditorDialog,
  type PlaylistEditorValues,
} from "@/components/playlists/playlist-editor-dialog";
import { ProtectedRoute } from "@/components/protected-route";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth-store";
import { toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import {
  useCreatePlaylistMutation,
  useCurrentUserQuery,
  useDeletePlaylistMutation,
  useListeningHistoryQuery,
  useMyPlaylistsQuery,
  useUpdatePlaylistMutation,
} from "@/lib/wavestream-queries";

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[2rem]" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-[2rem]" />
    </div>
  );
}

const toPlaylistMutationPayload = (values: PlaylistEditorValues) => ({
  title: values.title,
  description: values.description.trim() ? values.description.trim() : null,
  isPublic: values.visibility === "public",
});

export default function LibraryPage() {
  const session = useAuthSession();
  const currentUserQuery = useCurrentUserQuery();
  const historyQuery = useListeningHistoryQuery();
  const myPlaylistsQuery = useMyPlaylistsQuery();
  const user = currentUserQuery.data ?? session.user;
  const history = historyQuery.data ?? [];
  const playlists = React.useMemo(
    () => (myPlaylistsQuery.data ?? []).map(toPlaylistCard),
    [myPlaylistsQuery.data],
  );

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = React.useState<string | null>(null);
  const [pendingDeletePlaylistId, setPendingDeletePlaylistId] = React.useState<string | null>(null);

  const editingPlaylist =
    (myPlaylistsQuery.data ?? []).find((playlist) => playlist.id === editingPlaylistId) ?? null;
  const pendingDeletePlaylist =
    (myPlaylistsQuery.data ?? []).find((playlist) => playlist.id === pendingDeletePlaylistId) ?? null;

  const createPlaylistMutation = useCreatePlaylistMutation();
  const updatePlaylistMutation = useUpdatePlaylistMutation(editingPlaylist?.id ?? "");
  const deletePlaylistMutation = useDeletePlaylistMutation(pendingDeletePlaylist?.id ?? "");

  const handleCreatePlaylist = async (values: PlaylistEditorValues) => {
    const createdPlaylist = await createPlaylistMutation.mutateAsync(
      toPlaylistMutationPayload(values),
    );
    setIsCreateOpen(false);
    toast.success(`Created "${createdPlaylist.title}".`);
  };

  const handleUpdatePlaylist = async (values: PlaylistEditorValues) => {
    if (!editingPlaylist) {
      return;
    }

    const updatedPlaylist = await updatePlaylistMutation.mutateAsync(
      toPlaylistMutationPayload(values),
    );
    setEditingPlaylistId(null);
    toast.success(`Updated "${updatedPlaylist.title}".`);
  };

  const handleDeletePlaylist = async () => {
    if (!pendingDeletePlaylist) {
      return;
    }

    const deletedTitle = pendingDeletePlaylist.title;
    await deletePlaylistMutation.mutateAsync();
    setPendingDeletePlaylistId(null);
    toast.success(`Deleted "${deletedTitle}".`);
  };

  if (session.isBooting || (currentUserQuery.isLoading && !user)) {
    return <LibrarySkeleton />;
  }

  const playlistTotal = playlists.length;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Listening history", `${history.length} tracks`, Clock3],
            ["Liked tracks", `${user?.trackCount ?? 0} tracks`, Heart],
            ["Following", `${user?.followingCount ?? 0} creators`, Users],
            ["Playlists", `${playlistTotal} collections`, LibraryBig],
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

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent listening</CardTitle>
              <CardDescription>
                Resume where you left off with live listening history data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-3xl" />
                ))
              ) : history.length ? (
                history.map((entry, index) => {
                  const track = toTrackCard(entry.track);
                  return (
                    <Link
                      key={`${entry.track.id}-${entry.playedAt}`}
                      href={`/track/${track.slug}`}
                      className="rounded-3xl border border-border/70 bg-background/70 p-4 transition hover:border-primary/35"
                    >
                      <div className="flex items-center gap-4">
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
                            {track.artistName}
                          </p>
                        </div>
                        <Badge variant="soft">#{index + 1}</Badge>
                      </div>
                      <div className="mt-4">
                        <Progress value={40 + index * 15} />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <Card className="border-dashed bg-background/60">
                  <CardContent className="space-y-2 p-6">
                    <p className="font-medium">Listening history is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Playback events will appear here after you start listening on a signed-in
                      session.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Your playlists</CardTitle>
                  <CardDescription>
                    Create, rename, hide, and delete playlists from the same signed-in library.
                  </CardDescription>
                </div>
                <Button type="button" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New playlist
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {myPlaylistsQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-3xl" />
                  ))
                ) : myPlaylistsQuery.isError ? (
                  <Card className="border-dashed bg-background/60">
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-2">
                        <p className="font-medium">Could not load your playlists</p>
                        <p className="text-sm text-muted-foreground">
                          The library is signed-in and ready, but the playlist feed did not return.
                        </p>
                      </div>
                      <Button type="button" variant="outline" onClick={() => void myPlaylistsQuery.refetch()}>
                        Retry
                      </Button>
                    </CardContent>
                  </Card>
                ) : playlists.length ? (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="rounded-3xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Link
                          href={`/playlist/${playlist.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-4 transition hover:text-primary"
                        >
                          <div
                            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700"
                            style={
                              playlist.coverUrl
                                ? {
                                    backgroundImage: `linear-gradient(180deg, rgba(7, 11, 24, 0.18), rgba(7, 11, 24, 0.45)), url(${playlist.coverUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium">{playlist.title}</p>
                              <Badge variant={playlist.isPublic ? "soft" : "outline"}>
                                {playlist.isPublic ? "Public" : "Private"}
                              </Badge>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {playlist.description || "No description yet."}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {playlist.trackCount} tracks | {playlist.totalDurationLabel}
                            </p>
                          </div>
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlaylistId(playlist.id)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingDeletePlaylistId(playlist.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Card className="border-dashed bg-background/60">
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-2">
                        <p className="font-medium">No playlists yet</p>
                        <p className="text-sm text-muted-foreground">
                          Start a collection for favorite discoveries, private listening queues, or
                          your next shareable set.
                        </p>
                      </div>
                      <Button type="button" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create your first playlist
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile summary</CardTitle>
                <CardDescription>Creator, listener, and playlist overview.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/70 p-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                      {(user?.displayName ?? "WS").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{user?.displayName ?? "WaveStream member"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      @{user?.username ?? "member"}
                    </p>
                  </div>
                  <Badge variant="outline">{user?.role ?? "listener"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Library data stays aligned with your live session, so playlist changes here update
                  discovery, track actions, and artist surfaces without extra refresh steps.
                </p>
                <Progress value={Math.min(100, playlistTotal * 14 + 24)} />
              </CardContent>
            </Card>
          </div>
        </section>

        <PlaylistEditorDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          mode="create"
          isPending={createPlaylistMutation.isPending}
          onSubmit={handleCreatePlaylist}
        />

        <PlaylistEditorDialog
          open={Boolean(editingPlaylistId)}
          onOpenChange={(open) => !open && setEditingPlaylistId(null)}
          mode="edit"
          initialValues={
            editingPlaylist
              ? {
                  title: editingPlaylist.title,
                  description: editingPlaylist.description ?? "",
                  visibility: editingPlaylist.isPublic ? "public" : "private",
                }
              : undefined
          }
          isPending={updatePlaylistMutation.isPending}
          onSubmit={handleUpdatePlaylist}
        />

        <ConfirmDeleteDialog
          open={Boolean(pendingDeletePlaylistId)}
          onOpenChange={(open) => !open && setPendingDeletePlaylistId(null)}
          entityName={pendingDeletePlaylist?.title}
          entityLabel="playlist"
          dialogDescription="This removes the playlist from your library, discovery surfaces, and any signed-in owner views."
          confirmLabel="Delete playlist"
          isPending={deletePlaylistMutation.isPending}
          onConfirm={handleDeletePlaylist}
        />
      </div>
    </ProtectedRoute>
  );
}
