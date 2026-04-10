import 'dotenv/config';
import { DataSource } from 'typeorm';
import {
  AuditLogEntity,
  CommentEntity,
  FollowEntity,
  GenreEntity,
  LikeEntity,
  ListeningHistoryEntity,
  NotificationEntity,
  PasswordResetTokenEntity,
  PlayEventEntity,
  PlaylistEntity,
  PlaylistTrackEntity,
  ProfileEntity,
  RefreshTokenEntity,
  ReportEntity,
  RepostEntity,
  TagEntity,
  TrackEntity,
  TrackFileEntity,
  UserEntity,
} from 'src/database/entities';
import { getValidatedEnv } from 'src/config/env.validation';

const env = getValidatedEnv();

export default new DataSource({
  type: 'postgres',
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  entities: [
    AuditLogEntity,
    CommentEntity,
    FollowEntity,
    GenreEntity,
    LikeEntity,
    ListeningHistoryEntity,
    NotificationEntity,
    PasswordResetTokenEntity,
    PlayEventEntity,
    PlaylistEntity,
    PlaylistTrackEntity,
    ProfileEntity,
    RefreshTokenEntity,
    ReportEntity,
    RepostEntity,
    TagEntity,
    TrackEntity,
    TrackFileEntity,
    UserEntity,
  ],
  migrations: ['src/database/typeorm/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
