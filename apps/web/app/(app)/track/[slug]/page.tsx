"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ReportableType } from "@wavestream/shared";
import {
  ArrowLeft,
  Heart,
  ListPlus,
  MessageSquare,
  Play,
  Pause,
  Repeat,
  ShieldAlert,
  UserPlus2,
} from "lucide-react";
import { toast } from "sonner";

import { ReportDialog } from "@/components/reports/report-dialog";
import { AddToPlaylistDialog } from "@/components/playlists/add-to-playlist-dialog";
import {
  PlaylistEditorDialog,
  type PlaylistEditorValues,
} from "@/components/playlists/playlist-editor-dialog";
import { ShareActionButton } from "@/components/playlists/share-action-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/lib/auth-store";
import { usePlayerStore } from "@/lib/player-store";
import {
  formatCompactNumber,
  formatDuration,
  toPlaylistCard,
  toTrackCard,
} from "@/lib/wavestream-api";
import {
  useAddTrackToPlaylistMutation,
  useCreateCommentMutation,
  useCreatePlaylistMutation,
  useMyPlaylistsQuery,
  useRelatedTracksQuery,
  useCreateReportMutation,
  useToggleFollowMutation,
  useToggleTrackReactionMutation,
  useTrackCommentsQuery,
  useTrackQuery,
} from "@/lib/wavestream-queries";

function TrackSkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Skeleton className="aspect-square rounded-md" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-11 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-md" />
        <Skeleton className="h-44 w-full rounded-md" />
      </div>
    </section>
  );
}

const toPlaylistPayload = (values: PlaylistEditorValues) => ({
  title: values.title,
  description: values.description.trim() ? values.description.trim() : null,
  isPublic: values.visibility === "public",
});

export default function TrackPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const session = useAuthSession();
  const trackSlug = typeof params.slug === "string" ? params.slug : "";
  const trackQuery = useTrackQuery(trackSlug);
  const commentsQuery = useTrackCommentsQuery(trackSlug);
  const relatedQuery = useRelatedTracksQuery(trackSlug);
  const myPlaylistsQuery = useMyPlaylistsQuery();
  const playerCurrentTrack = usePlayerStore((state) => state.currentTrack);
  const playerIsPlaying = usePlayerStore((state) => state.isPlaying);
  const playerIsBuffering = usePlayerStore((state) => state.isBuffering);
  const playerProgress = usePlayerStore((state) => state.progress);
  const playerDuration = usePlayerStore((state) => state.duration);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [following, setFollowing] = React.useState(false);
  const [commentBody, setCommentBody] = React.useState("");
  const [timestamp, setTimestamp] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState<string>("");

  const currentTrack = trackQuery.data;
  const relatedTracks = relatedQuery.data ?? [];
  const comments = commentsQuery.data ?? [];
  const ownerId = currentTrack?.artist.id ?? "";

  const playlistOptions = React.useMemo(
    () =>
      (myPlaylistsQuery.data ?? []).map((playlist) => {
        const card = toPlaylistCard(playlist);
        return {
          id: card.id,
          title: card.title,
          description: card.description,
          trackCount: card.trackCount,
          totalDurationLabel: card.totalDurationLabel,
          isPublic: card.isPublic,
          coverUrl: card.coverUrl,
        };
      }),
    [myPlaylistsQuery.data],
  );

  const likeMutation = useToggleTrackReactionMutation(trackSlug, "like");
  const repostMutation = useToggleTrackReactionMutation(trackSlug, "repost");
  const followMutation = useToggleFollowMutation(ownerId);
  const commentMutation = useCreateCommentMutation(trackSlug);
  const createPlaylistMutation = useCreatePlaylistMutation();
  const addTrackToPlaylistMutation = useAddTrackToPlaylistMutation(selectedPlaylistId);
  const createReportMutation = useCreateReportMutation();

  React.useEffect(() => {
    setLiked(Boolean(currentTrack?.isLiked));
    setReposted(Boolean(currentTrack?.isReposted));
    setFollowing(Boolean(currentTrack?.isFollowingArtist));
  }, [currentTrack?.isFollowingArtist, currentTrack?.isLiked, currentTrack?.isReposted]);

  React.useEffect(() => {
    if (!selectedPlaylistId && playlistOptions[0]?.id) {
      setSelectedPlaylistId(playlistOptions[0].id);
    }
  }, [playlistOptions, selectedPlaylistId]);

  if (!trackSlug) {
    return <TrackSkeleton />;
  }

  if (trackQuery.isLoading) {
    return <TrackSkeleton />;
  }

  if (trackQuery.isError || !currentTrack) {
    return (
      <Card className="border-0 bg-[#181818]">
        <CardContent className="space-y-3 p-8">
          <p className="text-lg font-bold text-white">Track not available</p>
          <p className="text-sm text-[#b3b3b3]">
            The track may not exist yet or may be private.
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

  const card = toTrackCard(currentTrack);
  const queue = [card, ...relatedTracks.filter((track) => track.id !== card.id).map(toTrackCard)];
  const isOwner = session.user?.id === currentTrack.artist.id;
  const isActiveTrack = playerCurrentTrack?.id === card.id;
  const activeProgress = isActiveTrack ? playerProgress : 0;
  const activeDuration = isActiveTrack ? playerDuration : (card.durationSeconds ?? currentTrack.duration);
  const progressPercent =
    activeDuration > 0 ? Math.min((activeProgress / activeDuration) * 100, 100) : 0;
  const playbackStatus = isActiveTrack
    ? playerIsBuffering
      ? "Buffering"
      : playerIsPlaying
        ? "Now playing"
        : "Paused"
    : "Ready to play";

  const playNow = () => {
    if (isActiveTrack) {
      togglePlay();
      return;
    }

    setQueue(queue);
    playTrack(card);
  };

  const submitComment = () => {
    if (!commentBody.trim()) {
      toast.error("Add a comment before posting.");
      return;
    }

    const parsedTimestamp = Number(timestamp);
    const timestampSeconds =
      timestamp.trim() && !Number.isNaN(parsedTimestamp) ? parsedTimestamp : undefined;

    commentMutation.mutate(
      {
        body: commentBody,
        timestampSeconds,
      },
      {
        onSuccess: () => {
          toast.success("Comment posted.");
          setCommentBody("");
          setTimestamp("");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to post comment.");
        },
      },
    );
  };

  const openPlaylistDialog = () => {
    if (session.isBooting) {
      toast("Checking your session...");
      return;
    }

    if (!session.isAuthenticated) {
      router.push(`/sign-in?next=${encodeURIComponent(`/track/${trackSlug}`)}`);
      return;
    }

    if (!selectedPlaylistId && playlistOptions[0]?.id) {
      setSelectedPlaylistId(playlistOptions[0].id);
    }
    setIsAddDialogOpen(true);
  };

  const handleCreatePlaylist = async (values: PlaylistEditorValues) => {
    const createdPlaylist = await createPlaylistMutation.mutateAsync(toPlaylistPayload(values));
    setSelectedPlaylistId(createdPlaylist.id);
    setIsCreatePlaylistOpen(false);
    setIsAddDialogOpen(true);
    toast.success(`Created "${createdPlaylist.title}".`);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    const playlist = playlistOptions.find((item) => item.id === playlistId);
    await addTrackToPlaylistMutation.mutateAsync({ trackId: currentTrack.id });
    setSelectedPlaylistId(playlistId);
    setIsAddDialogOpen(false);
    toast.success(
      playlist
        ? `Added "${card.title}" to "${playlist.title}".`
        : `Added "${card.title}" to your playlist.`,
    );
  };

  const openReportDialog = () => {
    if (session.isBooting) {
      toast("Checking your session...");
      return;
    }

    if (!session.isAuthenticated) {
      router.push(`/sign-in?next=${encodeURIComponent(`/track/${trackSlug}`)}`);
      return;
    }

    setIsReportOpen(true);
  };

  const handleCreateReport = async (values: { reason: string; details?: string | null }) => {
    await createReportMutation.mutateAsync({
      reportableType: ReportableType.TRACK,
      reportableId: currentTrack.id,
      reason: values.reason,
      details: values.details,
    });
    setIsReportOpen(false);
    toast.success("Report submitted to the moderation queue.");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="w-fit px-0 text-[#b3b3b3] hover:text-white hover:bg-transparent">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden bg-[#181818] border-none shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">{card.genreLabel}</Badge>
              <Badge variant="outline">{card.durationLabel}</Badge>
              <Badge variant="outline">{formatCompactNumber(currentTrack.playCount)} plays</Badge>
            </div>
            <CardTitle className="text-4xl text-white">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div
                className="aspect-square rounded-md bg-gradient-to-br from-[#1ed760] to-[#169c46] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                style={
                  card.coverUrl
                    ? {
                        backgroundImage: `url(${card.coverUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                    Creator
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{card.artistName}</p>
                </div>
                <div className="rounded-md bg-[#1f1f1f] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                    <span>Live playback</span>
                    <span>{playbackStatus}</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isActiveTrack ? "Synced to player" : "Ready"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {formatDuration(activeProgress)} / {formatDuration(activeDuration)}
                        </p>
                      </div>
                    </div>
                    <Progress value={progressPercent} aria-label="Track playback progress" />
                    <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                      {Array.from({ length: 18 }).map((_, index) => {
                        const barHeight = 28 + ((index * 7) % 28);
                        const isAheadOfProgress = index / 17 <= progressPercent / 100;

                        return (
                          <div
                            key={index}
                            className="rounded-full bg-[#1ed760] transition-all"
                            style={{
                              height: `${barHeight}px`,
                              opacity: isAheadOfProgress ? 1 : 0.2,
                              transform: isActiveTrack && playerIsPlaying ? "scaleY(1)" : "scaleY(0.5)",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={playNow}>
                    {isActiveTrack && playerIsPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isActiveTrack && playerIsPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextLiked = !liked;
                      setLiked(nextLiked);
                      likeMutation.mutate(nextLiked, {
                         onError: (error) => {
                          setLiked((value) => !value);
                          toast.error(error instanceof Error ? error.message : "Failed to update like.");
                        },
                      });
                    }}
                    className={liked ? "text-[#1ed760] border-[#1ed760]" : ""}
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                    {liked ? "Liked" : "Like"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextReposted = !reposted;
                      setReposted(nextReposted);
                      repostMutation.mutate(nextReposted, {
                        onError: (error) => {
                          setReposted((value) => !value);
                          toast.error(
                            error instanceof Error ? error.message : "Failed to update repost.",
                          );
                        },
                      });
                    }}
                    className={reposted ? "text-[#1ed760] border-[#1ed760]" : ""}
                  >
                    <Repeat className="h-4 w-4" />
                    {reposted ? "Reposted" : "Repost"}
                  </Button>
                  <Button variant="outline" onClick={openPlaylistDialog}>
                    <ListPlus className="h-4 w-4" />
                    Add
                  </Button>
                  <ShareActionButton
                    title={card.title}
                    text={`Listen to ${card.title} by ${card.artistName} on WaveStream.`}
                    successLabel="Shared"
                    onSuccess={(method) => {
                      toast.success(
                        method === "native"
                          ? "Share sheet opened."
                          : "Track link copied.",
                      );
                    }}
                    onError={(error) => {
                      toast.error(error.message);
                    }}
                  >
                    Share
                  </ShareActionButton>
                  {!isOwner ? (
                    <Button variant="outline" onClick={openReportDialog}>
                      <ShieldAlert className="h-4 w-4" />
                      Report
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator className="bg-[#282828]" />

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white">Comments</h3>
              <div className="space-y-3">
                {commentsQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-md" />
                  ))
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 rounded-md bg-[#1f1f1f] p-4"
                    >
                      <Badge variant="soft" className="h-fit">
                        {comment.timestampSeconds ? formatDuration(comment.timestampSeconds) : "Note"}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{comment.user.displayName}</p>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
                            @{comment.user.username}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#b3b3b3]">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-[#1f1f1f] p-6 text-sm text-[#b3b3b3]">
                    No comments yet. Add yours below.
                  </div>
                )}
              </div>
            </section>

            <Card className="bg-[#1f1f1f]">
              <CardHeader>
                <CardTitle>Add a comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment-body">Comment</Label>
                  <Textarea
                    id="comment-body"
                    placeholder="Leave a note..."
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="timestamp">Timestamp (sec)</Label>
                    <Input
                      id="timestamp"
                      inputMode="numeric"
                      placeholder="e.g. 24"
                      value={timestamp}
                      onChange={(event) => setTimestamp(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <Button onClick={submitComment} disabled={commentMutation.isPending}>
                      <MessageSquare className="h-4 w-4" />
                      {commentMutation.isPending ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Track stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Likes", currentTrack.likeCount],
                ["Reposts", currentTrack.repostCount],
                ["Comments", currentTrack.commentCount],
                ["Plays", currentTrack.playCount],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between rounded-md bg-[#1f1f1f] px-4 py-3"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">{label as string}</span>
                  <span className="font-bold text-white">{formatCompactNumber(value as number)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-[#1ed760] text-black text-sm font-bold">
                    {card.artistName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{card.artistName}</p>
                  <p className="text-xs text-[#b3b3b3]">
                    {card.artistHandle} •{" "}
                    {formatCompactNumber(currentTrack.artist.followerCount)} followers
                  </p>
                </div>
                <Button
                  variant={following ? "secondary" : "outline"}
                  onClick={() => {
                    const nextFollowing = !following;
                    setFollowing(nextFollowing);
                    followMutation.mutate(nextFollowing, {
                      onError: (error) => {
                        setFollowing((value) => !value);
                        toast.error(
                          error instanceof Error ? error.message : "Failed to update follow.",
                        );
                      },
                    });
                  }}
                >
                  <UserPlus2 className="h-4 w-4" />
                  {following ? "Following" : "Follow"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related tracks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-md" />
                ))
              ) : relatedTracks.length ? (
                relatedTracks.map((track) => {
                  const related = toTrackCard(track);
                  return (
                    <Link
                      key={related.id}
                      href={`/track/${related.slug}`}
                      className="group flex items-center gap-3 rounded-md bg-[#1f1f1f] p-2 transition-colors hover:bg-[#282828]"
                    >
                      <div
                        className="h-10 w-10 shrink-0 rounded-md bg-[#282828]"
                        style={
                          related.coverUrl
                            ? {
                                backgroundImage: `url(${related.coverUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white group-hover:text-[#1ed760] transition-colors">{related.title}</p>
                        <p className="truncate text-xs text-[#b3b3b3]">
                          {related.artistName}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-md bg-[#1f1f1f] p-4 text-xs text-[#b3b3b3]">
                  No related tracks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <AddToPlaylistDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        trackTitle={card.title}
        trackArtistName={card.artistName}
        trackDescription={card.description}
        playlists={playlistOptions}
        selectedPlaylistId={selectedPlaylistId}
        onSelectedPlaylistIdChange={setSelectedPlaylistId}
        isPending={addTrackToPlaylistMutation.isPending}
        emptyStateDescription="Create a playlist first, then add this track without leaving the current page."
        onConfirm={handleAddToPlaylist}
        onCreatePlaylist={() => {
          setIsAddDialogOpen(false);
          setIsCreatePlaylistOpen(true);
        }}
      />

      <PlaylistEditorDialog
        open={isCreatePlaylistOpen}
        onOpenChange={(open) => {
          setIsCreatePlaylistOpen(open);
          if (!open) {
            setIsAddDialogOpen(false);
          }
        }}
        mode="create"
        isPending={createPlaylistMutation.isPending}
        onSubmit={handleCreatePlaylist}
      />

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        entityLabel="track"
        entityName={card.title}
        isPending={createReportMutation.isPending}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
