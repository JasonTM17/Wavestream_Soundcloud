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
          <Skeleton key={index} className="h-28 rounded-[2rem]" />
        ))}
      </div>
      <Skeleton className="h-[42rem] rounded-[2rem]" />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed bg-background/60">
      <CardContent className="space-y-2 p-6">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function QueryErrorState({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <Card className="border-dashed bg-background/60">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="font-medium">Could not load {label}</p>
          <p className="text-sm text-muted-foreground">
            The admin session is valid, but this moderation feed did not return.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
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
    <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{user.displayName}</p>
            <Badge variant="soft">@{user.username}</Badge>
            <Badge variant={statusBadgeVariant(user.deletedAt ? "deleted" : "active")}>
              {user.deletedAt ? "Deleted" : user.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {formatCompactNumber(user.followerCount)} followers | {user.trackCount} tracks | {user.playlistCount} playlists
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={draftRole} onValueChange={(value) => setDraftRole(value as UserRole)}>
            <SelectTrigger className="w-40">
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
            {updateRoleMutation.isPending ? "Saving..." : "Apply role"}
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
      <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{track.title}</p>
              <Badge variant={statusBadgeVariant(track.status)}>{track.status}</Badge>
              <Badge variant="outline">{track.privacy}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">by {track.artistName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatCompactNumber(track.playCount)} plays | {formatCompactNumber(track.likeCount)} likes | {track.commentCount} comments
            </p>
            {track.hiddenReason ? (
              <p className="text-sm text-muted-foreground">Hidden reason: {track.hiddenReason}</p>
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
      <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">@{comment.username}</p>
              <Badge variant={statusBadgeVariant(comment.isHidden ? "deleted" : "active")}>
                {comment.isHidden ? "Hidden" : "Visible"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">On {comment.trackTitle}</p>
            <p className="text-sm leading-6 text-muted-foreground">{comment.body}</p>
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
      <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{playlist.title}</p>
              <Badge variant={statusBadgeVariant(playlist.deletedAt ? "deleted" : "active")}>
                {playlist.deletedAt ? "Deleted" : playlist.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Owner: {playlist.ownerName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {playlist.trackCount} tracks | {formatDuration(playlist.totalDuration)}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={Boolean(playlist.deletedAt)}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete playlist
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
      <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft">{report.reportableType}</Badge>
              <Badge variant={statusBadgeVariant(report.status)}>{report.status}</Badge>
              <p className="font-medium">{report.reason}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Reporter: @{report.reporter}</p>

              {report.target?.label ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target preview</p>
                  {report.target.href ? (
                    <Link
                      href={report.target.href}
                      className="block rounded-2xl border border-border/70 bg-card/80 px-4 py-3 transition hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{report.target.label}</p>
                        {report.target.status ? (
                          <Badge variant={targetStatusBadgeVariant(report.target.status)}>
                            {report.target.status}
                          </Badge>
                        ) : null}
                      </div>
                      {report.target.secondaryLabel ? (
                        <p className="mt-1 text-sm text-muted-foreground">{report.target.secondaryLabel}</p>
                      ) : null}
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{report.target.label}</p>
                        {report.target.status ? (
                          <Badge variant={targetStatusBadgeVariant(report.target.status)}>
                            {report.target.status}
                          </Badge>
                        ) : null}
                      </div>
                      {report.target.secondaryLabel ? (
                        <p className="mt-1 text-sm text-muted-foreground">{report.target.secondaryLabel}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}

              {shouldShowFallbackTargetId ? (
                <p className="text-sm text-muted-foreground">Target ID: {report.reportableId}</p>
              ) : null}
            </div>
            {report.details ? (
              <p className="text-sm leading-6 text-muted-foreground">{report.details}</p>
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
    <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{log.action}</Badge>
        <p className="font-medium">
          {log.entityType}:{log.entityId}
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin @{log.admin} | {new Date(log.createdAt).toLocaleString()}
      </p>
      {log.details ? (
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-border/70 bg-card/80 p-3 text-xs text-muted-foreground">
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
        <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_24px_70px_-36px_rgba(10,13,25,0.45)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="soft">Admin moderation hub</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Moderate tracks, playlists, comments, reports, users, and audit history from the
                  live admin API already running behind WaveStream.
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{formatCompactNumber(item.value)}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-[1.5rem] bg-card/70 p-2">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit logs</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports queue</CardTitle>
                <CardDescription>Review, resolve, or dismiss moderation reports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : reportsQuery.isError ? (
                  <QueryErrorState label="reports" onRetry={() => void reportsQuery.refetch()} />
                ) : reportsQuery.data?.data.length ? (
                  <>
                    {reportsQuery.data.data.map((report) => (
                      <AdminReportCard key={report.id} report={report} />
                    ))}
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
                <CardDescription>Hide or restore tracks that break platform rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tracksQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : tracksQuery.isError ? (
                  <QueryErrorState label="tracks" onRetry={() => void tracksQuery.refetch()} />
                ) : tracksQuery.data?.data.length ? (
                  <>
                    {tracksQuery.data.data.map((track) => (
                      <AdminTrackCard key={track.id} track={track} />
                    ))}
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
                <CardDescription>Hide or restore comments reported by listeners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {commentsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : commentsQuery.isError ? (
                  <QueryErrorState label="comments" onRetry={() => void commentsQuery.refetch()} />
                ) : commentsQuery.data?.data.length ? (
                  <>
                    {commentsQuery.data.data.map((comment) => (
                      <AdminCommentCard key={comment.id} comment={comment} />
                    ))}
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
                <CardDescription>Review and soft delete abusive or unsafe playlists.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {playlistsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : playlistsQuery.isError ? (
                  <QueryErrorState label="playlists" onRetry={() => void playlistsQuery.refetch()} />
                ) : playlistsQuery.data?.data.length ? (
                  <>
                    {playlistsQuery.data.data.map((playlist) => (
                      <AdminPlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
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
                <CardDescription>Promote or demote roles without leaving the admin hub.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {usersQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : usersQuery.isError ? (
                  <QueryErrorState label="users" onRetry={() => void usersQuery.refetch()} />
                ) : usersQuery.data?.data.length ? (
                  <>
                    {usersQuery.data.data.map((user) => (
                      <AdminUserCard key={user.id} user={user} />
                    ))}
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
                <CardDescription>Chronological admin actions for moderation visibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                  ))
                ) : auditQuery.isError ? (
                  <QueryErrorState label="audit logs" onRetry={() => void auditQuery.refetch()} />
                ) : auditQuery.data?.data.length ? (
                  <>
                    {auditQuery.data.data.map((log) => (
                      <AdminAuditLogCard key={log.id} log={log} />
                    ))}
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
