"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthSessionDto, UserDto } from "@wavestream/shared";

import { useAuthActions, useAuthSession } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";
import {
  addTrackToPlaylist,
  buildCreateTrackFormData,
  buildUpdateTrackPayload,
  createPlaylist,
  canIgnoreApiError,
  deletePlaylist,
  getMyPlaylists,
  getCurrentUser,
  getCreatorDashboard,
  getDiscoveryResults,
  getGenres,
  getListeningHistory,
  getMyUploads,
  getNotifications,
  getPlaylist,
  getPlaylists,
  getRelatedTracks,
  getSearchResults,
  getTrack,
  getTrackAnalytics,
  getTrackComments,
  getTracks,
  getUserProfile,
  type CreateTrackInput,
  type AddTrackToPlaylistInput,
  type CreatePlaylistInput,
  type DiscoveryResults,
  type DeleteTrackResult,
  type DeletePlaylistResult,
  type ListeningHistoryItem,
  type NotificationSummary,
  type PlaylistSummary,
  type SearchResults,
  type ReorderPlaylistTracksInput,
  type TrackSummary,
  type UpdateTrackInput,
  type UpdatePlaylistInput,
  type UserSummary,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  updatePlaylist,
} from "@/lib/wavestream-api";
import { apiRequest } from "@/lib/api";

const keepPreviousData = <T,>(data: T) => data;

const toAuthenticatedUser = (user: UserSummary): AuthSessionDto["user"] => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  bio: user.bio ?? null,
  avatarUrl: user.avatarUrl ?? null,
  role: user.role as UserDto["role"],
  isVerified: Boolean(user.isVerified),
  followerCount: user.followerCount ?? 0,
  followingCount: user.followingCount ?? 0,
  trackCount: user.trackCount ?? 0,
  playlistCount: user.playlistCount ?? 0,
  profile: user.profile
    ? {
        id: user.id,
        bio: user.profile.bio ?? null,
        avatarUrl: user.profile.avatarUrl ?? null,
        bannerUrl: user.profile.bannerUrl ?? null,
        websiteUrl: user.profile.websiteUrl ?? null,
        location: user.profile.location ?? null,
      }
    : null,
  createdAt: user.createdAt ?? new Date().toISOString(),
});

export function useCurrentUserQuery() {
  const { accessToken, isAuthenticated } = useAuthSession();
  const { clearSession, setAuthenticatedSession } = useAuthActions();
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => getCurrentUser(),
    staleTime: 60_000,
    retry: false,
    enabled: isAuthenticated,
  });

  React.useEffect(() => {
    if (query.data && accessToken) {
      setAuthenticatedSession({
        tokens: { accessToken },
        user: toAuthenticatedUser(query.data),
      });
    }
  }, [accessToken, query.data, setAuthenticatedSession]);

  React.useEffect(() => {
    if (
      query.error instanceof ApiError &&
      [401, 403].includes(query.error.status)
    ) {
      clearSession();
    }
  }, [clearSession, query.error]);

  return query;
}

export function useNotificationsQuery() {
  const { isAuthenticated } = useAuthSession();

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
    enabled: isAuthenticated,
  });
}

export function useListeningHistoryQuery() {
  const { isAuthenticated } = useAuthSession();

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
    enabled: isAuthenticated,
  });
}

export function useMyUploadsQuery() {
  const { isAuthenticated } = useAuthSession();

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
    enabled: isAuthenticated,
  });
}

export function useDiscoveryQuery() {
  return useQuery({
    queryKey: ["discovery", "home"],
    queryFn: async (): Promise<DiscoveryResults> => getDiscoveryResults(),
    staleTime: 20_000,
  });
}

export function useGenresQuery() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      try {
        return await getGenres();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useTracksQuery(filters: {
  q?: string;
  genre?: string;
  artistUsername?: string;
  limit?: number;
}) {
  const hasFilter =
    Boolean(filters.q?.trim()) ||
    Boolean(filters.genre?.trim()) ||
    Boolean(filters.artistUsername?.trim());

  return useQuery({
    queryKey: ["tracks", filters],
    queryFn: async () => {
      try {
        return await getTracks(filters);
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    enabled: hasFilter,
    staleTime: 20_000,
    retry: false,
  });
}

export function useSearchQuery(query: string) {
  const deferredQuery = React.useDeferredValue(query.trim());

  return useQuery({
    queryKey: ["search", deferredQuery],
    queryFn: async (): Promise<SearchResults> => {
      try {
        return await getSearchResults(deferredQuery);
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return { tracks: [], playlists: [], artists: [], genres: [] };
        }
        throw error;
      }
    },
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

export function useRelatedTracksQuery(idOrSlug: string) {
  return useQuery({
    queryKey: ["track", idOrSlug, "related"],
    queryFn: async () => {
      try {
        return await getRelatedTracks(idOrSlug);
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

export function usePlaylistQuery(idOrSlug: string) {
  return useQuery({
    queryKey: ["playlist", idOrSlug],
    queryFn: async (): Promise<PlaylistSummary> => getPlaylist(idOrSlug),
    staleTime: 30_000,
  });
}

export function usePlaylistsQuery(ownerId?: string) {
  const { isAuthenticated } = useAuthSession();
  const enabled = Boolean(ownerId) && isAuthenticated;

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
    enabled,
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

export function useCreatorDashboardQuery() {
  const { isAuthenticated, user } = useAuthSession();
  const isCreator = user?.role === "creator" || user?.role === "admin";

  return useQuery({
    queryKey: ["me", "dashboard"],
    queryFn: async () => {
      try {
        return await getCreatorDashboard();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 20_000,
    retry: false,
    enabled: isAuthenticated && isCreator,
  });
}

export function useTrackAnalyticsQuery(trackId: string) {
  const { isAuthenticated, user } = useAuthSession();
  const isCreator = user?.role === "creator" || user?.role === "admin";

  return useQuery({
    queryKey: ["me", "tracks", trackId, "analytics"],
    queryFn: async () => {
      try {
        return await getTrackAnalytics(trackId);
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(trackId) && isAuthenticated && isCreator,
    staleTime: 20_000,
    retry: false,
  });
}

export function useMyPlaylistsQuery() {
  const { isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: ["playlists", "me"],
    queryFn: async (): Promise<PlaylistSummary[]> => {
      try {
        return await getMyPlaylists();
      } catch (error) {
        if (canIgnoreApiError(error)) {
          return [];
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 20_000,
    retry: false,
  });
}

const invalidateTrackMutationQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  trackIdOrSlug?: string,
) => {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
    queryClient.invalidateQueries({ queryKey: ["me", "uploads"] }),
    queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["me", "tracks"] }),
    queryClient.invalidateQueries({ queryKey: ["discovery", "home"] }),
    queryClient.invalidateQueries({ queryKey: ["track"] }),
    queryClient.invalidateQueries({ queryKey: ["tracks"] }),
    queryClient.invalidateQueries({ queryKey: ["playlist"] }),
    queryClient.invalidateQueries({ queryKey: ["playlists"] }),
    queryClient.invalidateQueries({ queryKey: ["artist"] }),
  ];

  if (trackIdOrSlug) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["track", trackIdOrSlug] }),
      queryClient.invalidateQueries({
        queryKey: ["me", "tracks", trackIdOrSlug, "analytics"],
      }),
    );
  }

  await Promise.all(invalidations);
};

const invalidatePlaylistMutationQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  playlistIdOrSlug?: string,
  trackIdOrSlug?: string,
) => {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ["playlists"] }),
    queryClient.invalidateQueries({ queryKey: ["playlist"] }),
    queryClient.invalidateQueries({ queryKey: ["discovery", "home"] }),
    queryClient.invalidateQueries({ queryKey: ["artist"] }),
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  ];

  if (playlistIdOrSlug) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistIdOrSlug] }),
    );
  }

  if (trackIdOrSlug) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["track", trackIdOrSlug] }),
      queryClient.invalidateQueries({ queryKey: ["track"] }),
    );
  }

  await Promise.all(invalidations);
};

export function useCreateTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrackInput): Promise<TrackSummary> =>
      apiRequest<TrackSummary>("/api/tracks", {
        method: "POST",
        auth: "required",
        body: buildCreateTrackFormData(input),
      }),
    onSuccess: async (track) => {
      await invalidateTrackMutationQueries(queryClient, track.id);
    },
  });
}

export function useUpdateTrackMutation(trackIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTrackInput): Promise<TrackSummary> =>
      apiRequest<TrackSummary>(`/api/tracks/${encodeURIComponent(trackIdOrSlug)}`, {
        method: "PATCH",
        auth: "required",
        body: buildUpdateTrackPayload(input),
      }),
    onSuccess: async (track) => {
      await invalidateTrackMutationQueries(queryClient, track.id ?? trackIdOrSlug);
    },
  });
}

export function useDeleteTrackMutation(trackIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<DeleteTrackResult> =>
      apiRequest<DeleteTrackResult>(`/api/tracks/${encodeURIComponent(trackIdOrSlug)}`, {
        method: "DELETE",
        auth: "required",
      }),
    onSuccess: async () => {
      await invalidateTrackMutationQueries(queryClient, trackIdOrSlug);
    },
  });
}

export function useCreatePlaylistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlaylistInput): Promise<PlaylistSummary> =>
      createPlaylist(input),
    onSuccess: async (playlist) => {
      await invalidatePlaylistMutationQueries(queryClient, playlist.id);
    },
  });
}

export function useUpdatePlaylistMutation(playlistIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePlaylistInput): Promise<PlaylistSummary> =>
      updatePlaylist(playlistIdOrSlug, input),
    onSuccess: async (playlist) => {
      await invalidatePlaylistMutationQueries(queryClient, playlist.id ?? playlistIdOrSlug);
    },
  });
}

export function useDeletePlaylistMutation(playlistIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<DeletePlaylistResult> =>
      deletePlaylist(playlistIdOrSlug),
    onSuccess: async () => {
      await invalidatePlaylistMutationQueries(queryClient, playlistIdOrSlug);
    },
  });
}

export function useAddTrackToPlaylistMutation(playlistIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTrackToPlaylistInput): Promise<PlaylistSummary> =>
      addTrackToPlaylist(playlistIdOrSlug, input),
    onSuccess: async (playlist, variables) => {
      await invalidatePlaylistMutationQueries(
        queryClient,
        playlist.id ?? playlistIdOrSlug,
        variables.trackId,
      );
    },
  });
}

export function useRemoveTrackFromPlaylistMutation(playlistIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string): Promise<PlaylistSummary> =>
      removeTrackFromPlaylist(playlistIdOrSlug, trackId),
    onSuccess: async (playlist, trackId) => {
      await invalidatePlaylistMutationQueries(
        queryClient,
        playlist.id ?? playlistIdOrSlug,
        trackId,
      );
    },
  });
}

export function useReorderPlaylistTracksMutation(playlistIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReorderPlaylistTracksInput): Promise<PlaylistSummary> =>
      reorderPlaylistTracks(playlistIdOrSlug, input),
    onSuccess: async (playlist) => {
      await invalidatePlaylistMutationQueries(queryClient, playlist.id ?? playlistIdOrSlug);
    },
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
      await queryClient.invalidateQueries({ queryKey: ["artist"] });
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
      await queryClient.invalidateQueries({ queryKey: ["track"] });
      await queryClient.invalidateQueries({ queryKey: ["discovery"] });
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
      await queryClient.invalidateQueries({ queryKey: ["track"] });
    },
  });
}

export function useSafeApiError(error: unknown) {
  return canIgnoreApiError(error) ? null : error;
}
