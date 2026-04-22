"use client";

import * as React from "react";
import { ReportStatus, TrackStatus, UserRole } from "@wavestream/shared";
import { ShieldAlert, Users, Waves, MessageSquareWarning, ListMusic } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ModerationNoteDialog } from "@/components/admin/moderation-note-dialog";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { ResolveReportDialog } from "@/components/admin/resolve-report-dialog";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatCompactNumber,
  formatDuration,
  type AdminAuditLogSummary,
  type AdminCommentSummary,
  type AdminPlaylistSummary,
  type AdminReportSummary,
  type AdminTrackSummary,
  type AdminUserSummary,
} from "@/lib/wavestream-api";
import {
  useAdminAuditLogsQuery,
  useAdminCommentsQuery,
  useAdminOverviewQuery,
  useAdminPlaylistsQuery,
  useAdminReportsQuery,
  useAdminTracksQuery,
  useAdminUsersQuery,
  useDeleteAdminPlaylistMutation,
  useHideAdminCommentMutation,
  useHideAdminTrackMutation,
  useResolveAdminReportMutation,
  useRestoreAdminCommentMutation,
  useRestoreAdminTrackMutation,
  useUpdateAdminUserRoleMutation,
} from "@/lib/wavestream-queries";

const PAGE_SIZE = 8;

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-[42rem] rounded-md" />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md bg-[#1f1f1f] p-6 text-sm text-[#b3b3b3]">
      <p className="font-bold text-white mb-2">{title}</p>
      {description}
    </div>
  );
}

function QueryErrorState({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="rounded-md bg-[#1f1f1f] p-6">
      <div className="space-y-2 mb-4 text-[#b3b3b3] text-sm">
        <p className="font-bold text-white">Could not load {label}</p>
        <p>The admin session is valid, but this moderation feed did not return.</p>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function statusBadgeVariant(status: ReportStatus | TrackStatus | "deleted" | "active") {
  switch (status) {
    case ReportStatus.RESOLVED:
    case TrackStatus.PUBLISHED:
    case "active":
      return "success";
    case ReportStatus.DISMISSED:
    case TrackStatus.HIDDEN:
    case "deleted":
      return "outline";
    default:
      return "soft";
  }
}

function targetStatusBadgeVariant(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
    case "public":
      return "success";
    case "deleted":
    case "hidden":
    case "private":
      return "outline";
    default:
      return "soft";
  }
}

function AdminUserCard({ user }: { user: AdminUserSummary }) {
  const [draftRole, setDraftRole] = React.useState<UserRole>(user.role);
  const updateRoleMutation = useUpdateAdminUserRoleMutation(user.id);

  React.useEffect(() => {
    setDraftRole(user.role);
  }, [user.role]);

  const roleChanged = draftRole !== user.role;

  return (
    <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-white">{user.displayName}</p>
            <Badge variant="soft">@{user.username}</Badge>
            <Badge variant={statusBadgeVariant(user.deletedAt ? "deleted" : "active")}>
              {user.deletedAt ? "Deleted" : user.role}
            </Badge>
          </div>
          <p className="text-sm text-[#b3b3b3]">{user.email}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
            {formatCompactNumber(user.followerCount)} followers • {user.trackCount} tracks • {user.playlistCount} playlists
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={draftRole} onValueChange={(value) => setDraftRole(value as UserRole)}>
            <SelectTrigger className="w-40 border-[#b3b3b3] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.LISTENER}>Listener</SelectItem>
              <SelectItem value={UserRole.CREATOR}>Creator</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={!roleChanged || updateRoleMutation.isPending}
            onClick={() =>
              updateRoleMutation.mutate(
                { role: draftRole },
                {
                  onSuccess: () => toast.success(`Updated role for ${user.displayName}.`),
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "Failed to update role."),
                },
              )
            }
          >
            {updateRoleMutation.isPending ? "Saving..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminTrackCard({ track }: { track: AdminTrackSummary }) {
  const [isHideOpen, setIsHideOpen] = React.useState(false);
  const hideMutation = useHideAdminTrackMutation(track.id);
  const restoreMutation = useRestoreAdminTrackMutation(track.id);

  return (
    <>
      <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-white">{track.title}</p>
              <Badge variant={statusBadgeVariant(track.status)}>{track.status}</Badge>
              <Badge variant="outline">{track.privacy}</Badge>
            </div>
            <p className="text-sm text-[#b3b3b3]">by {track.artistName}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
              {formatCompactNumber(track.playCount)} plays • {formatCompactNumber(track.likeCount)} likes • {track.commentCount} comments
            </p>
            {track.hiddenReason ? (
              <p className="text-sm text-[#b3b3b3]">Hidden reason: {track.hiddenReason}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {track.status === "hidden" ? (
              <Button
                type="button"
                variant="outline"
                disabled={restoreMutation.isPending}
                onClick={() =>
                  restoreMutation.mutate(undefined, {
                    onSuccess: () => toast.success(`Restored "${track.title}".`),
                    onError: (error) =>
                      toast.error(error instanceof Error ? error.message : "Failed to restore track."),
                  })
                }
              >
                {restoreMutation.isPending ? "Restoring..." : "Restore"}
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setIsHideOpen(true)}>
                Hide track
              </Button>
            )}
          </div>
        </div>
      </div>

      <ModerationNoteDialog
        open={isHideOpen}
        onOpenChange={setIsHideOpen}
        title="Hide track"
        description={`Hide "${track.title}" from discovery and listener surfaces.`}
        confirmLabel="Hide track"
        isPending={hideMutation.isPending}
        onConfirm={async (values) => {
          await hideMutation.mutateAsync({
            reason: values.reason ?? undefined,
          });
          setIsHideOpen(false);
          toast.success(`Hidden "${track.title}".`);
        }}
      />
    </>
  );
}

function AdminCommentCard({ comment }: { comment: AdminCommentSummary }) {
  const [isHideOpen, setIsHideOpen] = React.useState(false);
  const hideMutation = useHideAdminCommentMutation(comment.id);
  const restoreMutation = useRestoreAdminCommentMutation(comment.id);

  return (
    <>
      <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-white">@{comment.username}</p>
              <Badge variant={statusBadgeVariant(comment.isHidden ? "deleted" : "active")}>
                {comment.isHidden ? "Hidden" : "Visible"}
              </Badge>
            </div>
            <p className="text-sm text-[#b3b3b3]">On {comment.trackTitle}</p>
            <p className="text-sm text-[#b3b3b3]">{comment.body}</p>
          </div>

          <div className="flex gap-2">
            {comment.isHidden ? (
              <Button
                type="button"
                variant="outline"
                disabled={restoreMutation.isPending}
                onClick={() =>
                  restoreMutation.mutate(undefined, {
                    onSuccess: () => toast.success("Comment restored."),
                    onError: (error) =>
                      toast.error(error instanceof Error ? error.message : "Failed to restore comment."),
                  })
                }
              >
                {restoreMutation.isPending ? "Restoring..." : "Restore"}
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setIsHideOpen(true)}>
                Hide comment
              </Button>
            )}
          </div>
        </div>
      </div>

      <ModerationNoteDialog
        open={isHideOpen}
        onOpenChange={setIsHideOpen}
        title="Hide comment"
        description="Hide this comment from the public discussion timeline."
        confirmLabel="Hide comment"
        isPending={hideMutation.isPending}
        onConfirm={async (values) => {
          await hideMutation.mutateAsync({
            reason: values.reason ?? undefined,
          });
          setIsHideOpen(false);
          toast.success("Comment hidden.");
        }}
      />
    </>
  );
}

function AdminPlaylistCard({ playlist }: { playlist: AdminPlaylistSummary }) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const deleteMutation = useDeleteAdminPlaylistMutation(playlist.id);

  return (
    <>
      <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-white">{playlist.title}</p>
              <Badge variant={statusBadgeVariant(playlist.deletedAt ? "deleted" : "active")}>
                {playlist.deletedAt ? "Deleted" : playlist.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-sm text-[#b3b3b3]">Owner: {playlist.ownerName}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">
              {playlist.trackCount} tracks • {formatDuration(playlist.totalDuration)}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={Boolean(playlist.deletedAt)}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <ModerationNoteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete playlist"
        description={`Soft delete "${playlist.title}" from public and owner-facing surfaces.`}
        confirmLabel="Delete playlist"
        isPending={deleteMutation.isPending}
        onConfirm={async (values) => {
          await deleteMutation.mutateAsync({
            reason: values.reason ?? undefined,
          });
          setIsDeleteOpen(false);
          toast.success(`Deleted "${playlist.title}".`);
        }}
      />
    </>
  );
}

function AdminReportCard({ report }: { report: AdminReportSummary }) {
  const [isResolveOpen, setIsResolveOpen] = React.useState(false);
  const resolveMutation = useResolveAdminReportMutation(report.id);
  const shouldShowFallbackTargetId = !report.target?.label || !report.target?.href;

  return (
    <>
      <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">{report.reportableType}</Badge>
              <Badge variant={statusBadgeVariant(report.status)}>{report.status}</Badge>
              <p className="font-bold text-white">{report.reason}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-[#b3b3b3]">Reporter: @{report.reporter}</p>

              {report.target?.label ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">Target preview</p>
                  {report.target.href ? (
                    <Link
                      href={report.target.href}
                      className="block rounded-md bg-[#282828] px-4 py-3 transition-colors hover:bg-[#333333] border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-white">{report.target.label}</p>
                        {report.target.status ? (
                          <Badge variant={targetStatusBadgeVariant(report.target.status)}>
                            {report.target.status}
                          </Badge>
                        ) : null}
                      </div>
                      {report.target.secondaryLabel ? (
                        <p className="mt-1 text-sm text-[#b3b3b3]">{report.target.secondaryLabel}</p>
                      ) : null}
                    </Link>
                  ) : (
                    <div className="rounded-md bg-[#282828] px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-white">{report.target.label}</p>
                        {report.target.status ? (
                          <Badge variant={targetStatusBadgeVariant(report.target.status)}>
                            {report.target.status}
                          </Badge>
                        ) : null}
                      </div>
                      {report.target.secondaryLabel ? (
                        <p className="mt-1 text-sm text-[#b3b3b3]">{report.target.secondaryLabel}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}

              {shouldShowFallbackTargetId ? (
                <p className="text-sm text-[#b3b3b3]">Target ID: {report.reportableId}</p>
              ) : null}
            </div>
            {report.details ? (
              <p className="text-sm text-[#b3b3b3]">{report.details}</p>
            ) : null}
          </div>

          <Button type="button" variant="outline" onClick={() => setIsResolveOpen(true)}>
            Resolve
          </Button>
        </div>
      </div>

      <ResolveReportDialog
        open={isResolveOpen}
        onOpenChange={setIsResolveOpen}
        reportLabel={`${report.reportableType} report`}
        isPending={resolveMutation.isPending}
        onConfirm={async (values) => {
          await resolveMutation.mutateAsync({
            status: values.status,
            note: values.note ?? undefined,
          });
          setIsResolveOpen(false);
          toast.success("Report updated.");
        }}
      />
    </>
  );
}

function AdminAuditLogCard({ log }: { log: AdminAuditLogSummary }) {
  return (
    <div className="rounded-md bg-[#1f1f1f] p-4 transition-colors hover:bg-[#282828]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{log.action}</Badge>
        <p className="font-bold text-white">
          {log.entityType}:{log.entityId}
        </p>
      </div>
      <p className="mt-2 text-sm text-[#b3b3b3]">
        Admin @{log.admin} • {new Date(log.createdAt).toLocaleString()}
      </p>
      {log.details ? (
        <pre className="mt-3 overflow-x-auto rounded-md bg-[#282828] p-3 text-xs text-[#b3b3b3]">
          {JSON.stringify(log.details, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function AdminPageContent() {
  const [usersPage, setUsersPage] = React.useState(1);
  const [tracksPage, setTracksPage] = React.useState(1);
  const [playlistsPage, setPlaylistsPage] = React.useState(1);
  const [commentsPage, setCommentsPage] = React.useState(1);
  const [reportsPage, setReportsPage] = React.useState(1);
  const [auditPage, setAuditPage] = React.useState(1);

  const overviewQuery = useAdminOverviewQuery();
  const usersQuery = useAdminUsersQuery({ page: usersPage, limit: PAGE_SIZE });
  const tracksQuery = useAdminTracksQuery({ page: tracksPage, limit: PAGE_SIZE });
  const playlistsQuery = useAdminPlaylistsQuery({ page: playlistsPage, limit: PAGE_SIZE });
  const commentsQuery = useAdminCommentsQuery({ page: commentsPage, limit: PAGE_SIZE });
  const reportsQuery = useAdminReportsQuery({ page: reportsPage, limit: PAGE_SIZE });
  const auditQuery = useAdminAuditLogsQuery({ page: auditPage, limit: PAGE_SIZE });

  if (overviewQuery.isLoading && !overviewQuery.data) {
    return (
      <ProtectedRoute requireRole="admin">
        <AdminSkeleton />
      </ProtectedRoute>
    );
  }

  const overview = overviewQuery.data;

  return (
    <ProtectedRoute requireRole="admin">
      <div className="space-y-6">
        <section className="rounded-lg bg-[#181818] p-6 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="soft">Admin moderation hub</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Admin dashboard</h1>
                <p className="max-w-3xl text-sm text-[#b3b3b3]">
                  Moderate tracks, playlists, comments, reports, users, and audit history.
                </p>
              </div>
            </div>
            <Badge variant="outline">Admin-only surface</Badge>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: "Users", value: overview?.userCount ?? 0, icon: Users },
            { label: "Tracks", value: overview?.trackCount ?? 0, icon: Waves },
            { label: "Playlists", value: overview?.playlistCount ?? 0, icon: ListMusic },
            { label: "Pending reports", value: overview?.reportCount ?? 0, icon: ShieldAlert },
            { label: "Hidden comments", value: overview?.flaggedCommentCount ?? 0, icon: MessageSquareWarning },
          ].map((item) => {
            const Icon = item.icon;

            return (
               <Card key={item.label}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{formatCompactNumber(item.value)}</p>
                      <p className="text-sm text-[#b3b3b3]">{item.label}</p>
                    </div>
                  </CardContent>
               </Card>
            );
          })}
        </section>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-md bg-[#1f1f1f] p-2">
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Reports</TabsTrigger>
            <TabsTrigger value="tracks" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Tracks</TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Comments</TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Playlists</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Users</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-[#282828] data-[state=active]:text-white text-[#b3b3b3]">Audit logs</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : reportsQuery.isError ? (
                  <QueryErrorState label="reports" onRetry={() => void reportsQuery.refetch()} />
                ) : reportsQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {reportsQuery.data.data.map((report) => (
                        <AdminReportCard key={report.id} report={report} />
                      ))}
                    </div>
                    <PaginationControls
                      page={reportsPage}
                      hasPrev={Boolean(reportsQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(reportsQuery.data.meta?.hasNextPage)}
                      isPending={reportsQuery.isFetching}
                      onPageChange={setReportsPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No reports queued" description="New user reports will appear here for review." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracks">
            <Card>
              <CardHeader>
                <CardTitle>Track moderation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tracksQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : tracksQuery.isError ? (
                  <QueryErrorState label="tracks" onRetry={() => void tracksQuery.refetch()} />
                ) : tracksQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {tracksQuery.data.data.map((track) => (
                        <AdminTrackCard key={track.id} track={track} />
                      ))}
                    </div>
                    <PaginationControls
                      page={tracksPage}
                      hasPrev={Boolean(tracksQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(tracksQuery.data.meta?.hasNextPage)}
                      isPending={tracksQuery.isFetching}
                      onPageChange={setTracksPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No tracks loaded" description="The admin tracks feed is currently empty." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comment moderation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {commentsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : commentsQuery.isError ? (
                  <QueryErrorState label="comments" onRetry={() => void commentsQuery.refetch()} />
                ) : commentsQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {commentsQuery.data.data.map((comment) => (
                        <AdminCommentCard key={comment.id} comment={comment} />
                      ))}
                    </div>
                    <PaginationControls
                      page={commentsPage}
                      hasPrev={Boolean(commentsQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(commentsQuery.data.meta?.hasNextPage)}
                      isPending={commentsQuery.isFetching}
                      onPageChange={setCommentsPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No comments loaded" description="The admin comments feed is currently empty." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists">
            <Card>
              <CardHeader>
                <CardTitle>Playlist moderation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {playlistsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : playlistsQuery.isError ? (
                  <QueryErrorState label="playlists" onRetry={() => void playlistsQuery.refetch()} />
                ) : playlistsQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {playlistsQuery.data.data.map((playlist) => (
                        <AdminPlaylistCard key={playlist.id} playlist={playlist} />
                      ))}
                    </div>
                    <PaginationControls
                      page={playlistsPage}
                      hasPrev={Boolean(playlistsQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(playlistsQuery.data.meta?.hasNextPage)}
                      isPending={playlistsQuery.isFetching}
                      onPageChange={setPlaylistsPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No playlists loaded" description="The admin playlists feed is currently empty." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {usersQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : usersQuery.isError ? (
                  <QueryErrorState label="users" onRetry={() => void usersQuery.refetch()} />
                ) : usersQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {usersQuery.data.data.map((user) => (
                        <AdminUserCard key={user.id} user={user} />
                      ))}
                    </div>
                    <PaginationControls
                      page={usersPage}
                      hasPrev={Boolean(usersQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(usersQuery.data.meta?.hasNextPage)}
                      isPending={usersQuery.isFetching}
                      onPageChange={setUsersPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No users loaded" description="The admin users feed is currently empty." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {auditQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-md" />
                  ))
                ) : auditQuery.isError ? (
                  <QueryErrorState label="audit logs" onRetry={() => void auditQuery.refetch()} />
                ) : auditQuery.data?.data.length ? (
                  <>
                    <div className="space-y-2">
                      {auditQuery.data.data.map((log) => (
                        <AdminAuditLogCard key={log.id} log={log} />
                      ))}
                    </div>
                    <PaginationControls
                      page={auditPage}
                      hasPrev={Boolean(auditQuery.data.meta?.hasPreviousPage)}
                      hasNext={Boolean(auditQuery.data.meta?.hasNextPage)}
                      isPending={auditQuery.isFetching}
                      onPageChange={setAuditPage}
                    />
                  </>
                ) : (
                  <EmptyState title="No audit history yet" description="Admin actions will appear here after moderation changes." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminPage() {
  return (
    <React.Suspense fallback={<AdminSkeleton />}>
      <AdminPageContent />
    </React.Suspense>
  );
}
