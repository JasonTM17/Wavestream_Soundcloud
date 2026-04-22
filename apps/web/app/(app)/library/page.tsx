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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth-store";
import { toPlaylistCard, toTrackCard } from "@/lib/wavestream-api";
import {
  useCreatePlaylistMutation,
  useCurrentUserQuery,
  useDeletePlaylistMutation,
  useListeningHistoryQuery,
  useMyReportsQuery,
  useMyPlaylistsQuery,
  useUpdatePlaylistMutation,
} from "@/lib/wavestream-queries";

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-md" />
    </div>
  );
}

const toPlaylistMutationPayload = (values: PlaylistEditorValues) => ({
  title: values.title,
  description: values.description.trim() ? values.description.trim() : null,
  isPublic: values.visibility === "public",
});

export function buildLibraryStats(input: {
  historyCount: number;
  followingCount: number;
  trackCount: number;
  playlistCount: number;
}) {
  return [
    ["Listening history", `${input.historyCount} tracks`, Clock3],
    ["Following", `${input.followingCount} creators`, Users],
    ["My uploads", `${input.trackCount} tracks`, Heart],
    ["Playlists", `${input.playlistCount} collections`, LibraryBig],
  ] as const;
}

export default function LibraryPage() {
  const session = useAuthSession();
  const currentUserQuery = useCurrentUserQuery();
  const historyQuery = useListeningHistoryQuery();
  const myPlaylistsQuery = useMyPlaylistsQuery();
  const myReportsQuery = useMyReportsQuery({ limit: 3 });
  const user = currentUserQuery.data ?? session.user;
  const history = historyQuery.data ?? [];
  const playlists = React.useMemo(
    () => (myPlaylistsQuery.data ?? []).map(toPlaylistCard),
    [myPlaylistsQuery.data],
  );
  const reports = myReportsQuery.data?.data ?? [];

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

  const libraryStats = buildLibraryStats({
    historyCount: history.length,
    followingCount: user?.followingCount ?? 0,
    trackCount: user?.trackCount ?? 0,
    playlistCount: playlists.length,
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          {libraryStats.map(([label, value, Icon]) => (
            <Card key={label as string}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{value as string}</p>
                  <p className="text-sm text-[#b3b3b3]">{label as string}</p>
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
            <CardContent className="space-y-2">
              {historyQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-md" />
                ))
              ) : history.length ? (
                history.map((entry, index) => {
                  const track = toTrackCard(entry.track);
                  return (
                    <Link
                      key={`${entry.track.id}-${entry.playedAt}`}
                      href={`/track/${track.slug}`}
                      className="group flex items-center gap-4 rounded-md bg-[#1f1f1f] p-3 transition-colors hover:bg-[#282828]"
                    >
                      <div
                        className="h-12 w-12 shrink-0 rounded-md bg-gradient-to-br from-[#1ed760] to-[#169c46]"
                        style={
                          track.coverUrl
                            ? {
                                backgroundImage: `url(${track.coverUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white group-hover:text-[#1ed760] transition-colors">{track.title}</p>
                        <p className="truncate text-xs text-[#b3b3b3]">
                          {track.artistName}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="soft">#{index + 1}</Badge>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#b3b3b3]">
                          {new Date(entry.playedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-md bg-[#1f1f1f] p-6">
                  <p className="font-bold text-white">Listening history is empty</p>
                  <p className="text-sm text-[#b3b3b3]">
                    Playback events will appear here after you start listening.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Your playlists</CardTitle>
                  <CardDescription>
                    Create, edit, and delete playlists from your library.
                  </CardDescription>
                </div>
                <Button type="button" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New playlist
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {myPlaylistsQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-md" />
                  ))
                ) : myPlaylistsQuery.isError ? (
                  <div className="rounded-md bg-[#1f1f1f] p-6">
                    <p className="font-bold text-white">Could not load your playlists</p>
                    <Button type="button" variant="outline" className="mt-4" onClick={() => void myPlaylistsQuery.refetch()}>
                      Retry
                    </Button>
                  </div>
                ) : playlists.length ? (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="group flex flex-col gap-4 rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828] md:flex-row md:items-center"
                    >
                      <Link
                        href={`/playlist/${playlist.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-4"
                      >
                        <div
                          className="h-14 w-14 shrink-0 rounded-md bg-[#282828]"
                          style={
                            playlist.coverUrl
                              ? {
                                  backgroundImage: `url(${playlist.coverUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-bold text-white group-hover:text-white transition-colors">{playlist.title}</p>
                            <Badge variant={playlist.isPublic ? "soft" : "outline"}>
                              {playlist.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-[#b3b3b3]">
                            {playlist.description || "No description."}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#b3b3b3]">
                            {playlist.trackCount} tracks • {playlist.totalDurationLabel}
                          </p>
                        </div>
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
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
                  ))
                ) : (
                  <div className="rounded-md bg-[#1f1f1f] p-6">
                    <p className="font-bold text-white mb-4">No playlists yet</p>
                    <Button type="button" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Create your first playlist
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-md bg-[#1f1f1f] p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#1ed760] text-black text-sm font-bold">
                      {(user?.displayName ?? "WS").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{user?.displayName ?? "WaveStream member"}</p>
                    <p className="truncate text-sm text-[#b3b3b3]">
                      @{user?.username ?? "member"}
                    </p>
                  </div>
                  <Badge variant="outline">{user?.role ?? "listener"}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["History", `${history.length} plays`],
                    ["Uploads", `${user?.trackCount ?? 0} tracks`],
                    ["Following", `${user?.followingCount ?? 0} creators`],
                    ["Playlists", `${playlists.length} collections`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md bg-[#1f1f1f] p-4"
                    >
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#b3b3b3]">
                        {label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myReportsQuery.isLoading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-md" />
                  ))
                ) : reports.length ? (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-md bg-[#1f1f1f] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="soft">{report.reportableType}</Badge>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>
                      <p className="mt-2 font-medium text-white">{report.reason}</p>
                      <p className="mt-1 text-xs text-[#b3b3b3]">
                        Created {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-[#1f1f1f] p-4 text-sm text-[#b3b3b3]">
                    No recent reports.
                  </div>
                )}
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
          dialogDescription="This removes the playlist from your library forever."
          confirmLabel="Delete playlist"
          isPending={deletePlaylistMutation.isPending}
          onConfirm={handleDeletePlaylist}
        />
      </div>
    </ProtectedRoute>
  );
}
