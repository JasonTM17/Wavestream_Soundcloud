"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  canIgnoreApiError,
  getCurrentUser,
  getDiscoveryResults,
  getListeningHistory,
  getMyUploads,
  getNotifications,
  getPlaylist,
  getPlaylists,
  getSearchResults,
  getTrack,
  getTrackComments,
  getUserProfile,
  type DiscoveryResults,
  type ListeningHistoryItem,
  type NotificationSummary,
  type PlaylistSummary,
  type SearchResults,
  type TrackSummary,
  type UserSummary,
} from "@/lib/wavestream-api";
import { apiRequest } from "@/lib/api";

const keepPreviousData = <T,>(data: T) => data;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => getCurrentUser(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationSummary[]> => {
      try {
        return await getNotifications();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useListeningHistoryQuery() {
  return useQuery({
    queryKey: ["me", "history"],
    queryFn: async (): Promise<ListeningHistoryItem[]> => {
      try {
        return await getListeningHistory();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useMyUploadsQuery() {
  return useQuery({
    queryKey: ["me", "uploads"],
    queryFn: async (): Promise<TrackSummary[]> => {
      try {
        return await getMyUploads();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 15_000,
    retry: false,
  });
}

export function useDiscoveryQuery() {
  return useQuery({
    queryKey: ["discovery", "home"],
    queryFn: async (): Promise<DiscoveryResults> => getDiscoveryResults(),
    staleTime: 20_000,
  });
}

export function useSearchQuery(query: string) {
  const deferredQuery = React.useDeferredValue(query.trim());

  return useQuery({
    queryKey: ["search", deferredQuery],
    queryFn: async (): Promise<SearchResults> => getSearchResults(deferredQuery),
    enabled: deferredQuery.length > 0,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });
}

export function useTrackQuery(idOrSlug: string) {
  return useQuery({
    queryKey: ["track", idOrSlug],
    queryFn: async (): Promise<TrackSummary> => getTrack(idOrSlug),
    staleTime: 30_000,
  });
}

export function useTrackCommentsQuery(idOrSlug: string) {
  return useQuery({
    queryKey: ["track", idOrSlug, "comments"],
    queryFn: async () => getTrackComments(idOrSlug),
    staleTime: 10_000,
    retry: false,
  });
}

export function usePlaylistQuery(idOrSlug: string) {
  return useQuery({
    queryKey: ["playlist", idOrSlug],
    queryFn: async (): Promise<PlaylistSummary> => getPlaylist(idOrSlug),
    staleTime: 30_000,
  });
}

export function usePlaylistsQuery(ownerId?: string) {
  return useQuery({
    queryKey: ["playlists", ownerId ?? "all"],
    queryFn: async (): Promise<PlaylistSummary[]> => {
      try {
        return await getPlaylists(ownerId ? { ownerId } : {});
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 20_000,
    retry: false,
  });
}

export function useArtistProfileQuery(username: string) {
  return useQuery({
    queryKey: ["artist", username],
    queryFn: async (): Promise<{ user: UserSummary; isFollowing?: boolean }> =>
      getUserProfile(username),
    staleTime: 20_000,
  });
}

export function useToggleFollowMutation(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shouldFollow: boolean) =>
      apiRequest<{ following: boolean }>(
        `/api/users/${encodeURIComponent(targetUserId)}/follow`,
        {
          method: shouldFollow ? "POST" : "DELETE",
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["artist", targetUserId] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useToggleTrackReactionMutation(trackId: string, reaction: "like" | "repost") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (active: boolean) =>
      apiRequest<Record<string, unknown>>(
        `/api/tracks/${encodeURIComponent(trackId)}/${reaction}`,
        {
          method: active ? "POST" : "DELETE",
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["track", trackId] });
      await queryClient.invalidateQueries({ queryKey: ["discovery", "home"] });
    },
  });
}

export function useCreateCommentMutation(trackId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { body: string; timestampSeconds?: number | null }) =>
      apiRequest<Record<string, unknown>>(
        `/api/tracks/${encodeURIComponent(trackId)}/comments`,
        {
          method: "POST",
          body,
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["track", trackId, "comments"] });
      await queryClient.invalidateQueries({ queryKey: ["track", trackId] });
    },
  });
}

export function useSafeApiError(error: unknown) {
  return canIgnoreApiError(error) ? null : error;
}
