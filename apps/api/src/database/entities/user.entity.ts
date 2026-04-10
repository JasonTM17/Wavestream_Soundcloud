import { UserRole } from '@wavestream/shared';
import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { AuditLogEntity } from 'src/database/entities/audit-log.entity';
import { SoftDeleteEntity } from 'src/database/entities/base.entity';
import { CommentEntity } from 'src/database/entities/comment.entity';
import { FollowEntity } from 'src/database/entities/follow.entity';
import { LikeEntity } from 'src/database/entities/like.entity';
import { ListeningHistoryEntity } from 'src/database/entities/listening-history.entity';
import { NotificationEntity } from 'src/database/entities/notification.entity';
import { PasswordResetTokenEntity } from 'src/database/entities/password-reset-token.entity';
import { PlayEventEntity } from 'src/database/entities/play-event.entity';
import { PlaylistEntity } from 'src/database/entities/playlist.entity';
import { ProfileEntity } from 'src/database/entities/profile.entity';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';
import { ReportEntity } from 'src/database/entities/report.entity';
import { RepostEntity } from 'src/database/entities/repost.entity';
import { TrackEntity } from 'src/database/entities/track.entity';

@Entity('users')
export class UserEntity extends SoftDeleteEntity {
  @Index({ unique: true })
  @Column()
  email!: string;

  @Index({ unique: true })
  @Column()
  username!: string;

  @Column()
  passwordHash!: string;

  @Column()
  displayName!: string;

  @Column({
    type: 'varchar',
    default: UserRole.LISTENER,
  })
  role!: UserRole;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'int', default: 0 })
  followerCount!: number;

  @Column({ type: 'int', default: 0 })
  followingCount!: number;

  @Column({ type: 'int', default: 0 })
  trackCount!: number;

  @Column({ type: 'int', default: 0 })
  playlistCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile!: ProfileEntity;

  @OneToMany(() => TrackEntity, (track) => track.artist)
  tracks!: TrackEntity[];

  @OneToMany(() => PlaylistEntity, (playlist) => playlist.owner)
  playlists!: PlaylistEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments!: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes!: LikeEntity[];

  @OneToMany(() => RepostEntity, (repost) => repost.user)
  reposts!: RepostEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following!: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers!: FollowEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications!: NotificationEntity[];

  @OneToMany(() => ReportEntity, (report) => report.reporter)
  reports!: ReportEntity[];

  @OneToMany(() => ReportEntity, (report) => report.resolvedBy)
  resolvedReports!: ReportEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refreshTokens!: RefreshTokenEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (token) => token.user)
  passwordResetTokens!: PasswordResetTokenEntity[];

  @OneToMany(() => PlayEventEntity, (event) => event.user)
  playEvents!: PlayEventEntity[];

  @OneToMany(() => ListeningHistoryEntity, (history) => history.user)
  listeningHistory!: ListeningHistoryEntity[];

  @OneToMany(() => AuditLogEntity, (auditLog) => auditLog.admin)
  auditLogs!: AuditLogEntity[];
}
