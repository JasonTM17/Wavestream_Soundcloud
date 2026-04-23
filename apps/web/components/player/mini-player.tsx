"use client";

import * as React from "react";
import Link from "next/link";
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { WaveformBar } from "@/components/player/waveform-bar";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/lib/player-store";
import { useAuthSession } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";
import { useToggleTrackReactionMutation } from "@/lib/wavestream-queries";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RepostIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

export function MiniPlayer() {
  const router = useRouter();
  const session = useAuthSession();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const error = usePlayerStore((state) => state.error);
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeat = usePlayerStore((state) => state.repeat);
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const queue = usePlayerStore((state) => state.queue);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const previousTrack = usePlayerStore((state) => state.previousTrack);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setRepeat = usePlayerStore((state) => state.setRepeat);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const t = useT("player");
  const tCommon = useT("common");

  const hasTrack = Boolean(currentTrack);
  const [queueOpen, setQueueOpen] = React.useState(false);

  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  React.useEffect(() => {
    setLiked(Boolean(currentTrack?.isLiked));
    setReposted(Boolean(currentTrack?.isReposted));
  }, [currentTrack?.id, currentTrack?.isLiked, currentTrack?.isReposted]);

  const likeMutation = useToggleTrackReactionMutation(currentTrack?.slug ?? "", "like");
  const repostMutation = useToggleTrackReactionMutation(currentTrack?.slug ?? "", "repost");

  const handleLike = React.useCallback(() => {
    if (!hasTrack) return;
    if (!session.isAuthenticated) {
      const next = currentTrack?.slug ? `/track/${currentTrack.slug}` : "/sign-in";
      router.push(`/sign-in?next=${encodeURIComponent(next)}`);
      return;
    }
    const next = !liked;
    setLiked(next);
    likeMutation.mutate(next, { onError: () => setLiked((v) => !v) });
  }, [hasTrack, session.isAuthenticated, currentTrack?.slug, liked, likeMutation, router]);

  const handleRepost = React.useCallback(() => {
    if (!hasTrack) return;
    if (!session.isAuthenticated) {
      const next = currentTrack?.slug ? `/track/${currentTrack.slug}` : "/sign-in";
      router.push(`/sign-in?next=${encodeURIComponent(next)}`);
      return;
    }
    const next = !reposted;
    setReposted(next);
    repostMutation.mutate(next, { onError: () => setReposted((v) => !v) });
  }, [hasTrack, session.isAuthenticated, currentTrack?.slug, reposted, repostMutation, router]);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const statusLabel = error ? t.error : isBuffering ? t.buffering : currentTrack?.genreLabel ?? "";

  return (
    <div className="relative">
      {/* Queue drawer */}
      {queueOpen && (
        <div className="absolute bottom-full left-0 right-0 border-t border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <ListMusic className="h-4 w-4 text-primary" />
              {t.upNext}
              {queue.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">{queue.length}</span>
              )}
            </p>
            <button
              onClick={() => setQueueOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={tCommon.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="h-52">
            {queue.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">{t.queueEmpty}</p>
            ) : (
              <div className="py-2">
                {queue.map((track, i) => {
                  const isActive = track.id === currentTrack?.id;
                  return (
                    <button
                      key={`${track.id}-${i}`}
                      onClick={() => playTrack(track)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/50",
                        isActive && "bg-muted/50",
                      )}
                    >
                      <div
                        className="h-8 w-8 shrink-0 rounded bg-muted"
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
                        <p className={cn("truncate text-xs font-medium", isActive ? "text-primary" : "text-foreground")}>
                          {track.title}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">{track.artistName}</p>
                      </div>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Player bar */}
      <div className="border-t border-border bg-card px-3 py-2">
        <div className="mx-auto grid max-w-[1600px] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(180px,0.6fr)]">
          {/* Track info */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={currentTrack ? `/track/${currentTrack.slug}` : "#"}
              tabIndex={hasTrack ? 0 : -1}
              className="group flex items-center gap-2.5 min-w-0 flex-1"
            >
              <div
                className={cn("h-12 w-12 shrink-0 rounded", !currentTrack?.coverUrl && "bg-muted")}
                style={
                  currentTrack?.coverUrl
                    ? {
                        backgroundImage: `url(${currentTrack.coverUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {currentTrack?.title ?? t.selectTrack}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentTrack?.artistName ?? t.waveStream}
                </p>
              </div>
            </Link>
            {hasTrack && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleLike}
                  aria-label={liked ? t.unlikeTrack : t.likeTrack}
                  className={cn("rounded-full p-1.5 transition-colors", liked ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                </button>
                <button
                  onClick={handleRepost}
                  aria-label={reposted ? t.removeRepost : t.repostTrack}
                  className={cn("rounded-full p-1.5 transition-colors", reposted ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <RepostIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Playback controls + waveform */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleShuffle}
                aria-label={t.toggleShuffle}
                disabled={!hasTrack}
                className={cn("rounded-full p-1.5 transition-colors disabled:opacity-30", shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                onClick={previousTrack}
                aria-label={t.previousTrack}
                disabled={!hasTrack}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? tCommon.pause : tCommon.play}
                disabled={!hasTrack}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:opacity-30",
                  hasTrack ? "bg-primary text-white hover:scale-105 hover:bg-primary/90" : "bg-muted text-muted-foreground",
                )}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                onClick={nextTrack}
                aria-label={t.nextTrack}
                disabled={!hasTrack}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")}
                aria-label={t.cycleRepeat}
                disabled={!hasTrack}
                className={cn("relative rounded-full p-1.5 transition-colors disabled:opacity-30", repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-9 text-right text-[10px] text-muted-foreground tabular-nums">
                {formatTime(hasTrack ? progress : 0)}
              </span>
              <WaveformBar
                progress={progressPercent}
                duration={duration}
                onSeek={setProgress}
                disabled={!hasTrack}
                seed={currentTrack?.slug ?? "default"}
                className="flex-1 h-8"
              />
              <span className="w-9 text-[10px] text-muted-foreground tabular-nums">
                {formatTime(hasTrack ? duration : 0)}
              </span>
            </div>
          </div>

          {/* Volume + status + queue */}
          <div className="hidden items-center justify-end gap-2 lg:flex">
            {statusLabel && (
              <span className="text-[10px] text-muted-foreground shrink-0">{statusLabel}</span>
            )}
            <button
              onClick={() => setQueueOpen((v) => !v)}
              aria-label={t.toggleQueue}
              disabled={!hasTrack}
              className={cn("rounded-full p-1.5 transition-colors disabled:opacity-30", queueOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <ListMusic className="h-4 w-4" />
            </button>
            <button
              onClick={toggleMute}
              aria-label={t.toggleMute}
              disabled={!hasTrack}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : volume < 0.5 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="w-20">
              <Slider
                value={[muted ? 0 : Math.round(volume * 100)]}
                max={100}
                step={1}
                onValueChange={(values) => setVolume((values[0] ?? 0) / 100)}
                disabled={!hasTrack}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
