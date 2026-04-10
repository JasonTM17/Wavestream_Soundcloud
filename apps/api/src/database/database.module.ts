import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

export const databaseEntities = [
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
];

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('app.dbHost'),
        port: configService.getOrThrow<number>('app.dbPort'),
        username: configService.getOrThrow<string>('app.dbUser'),
        password: configService.getOrThrow<string>('app.dbPassword'),
        database: configService.getOrThrow<string>('app.dbName'),
        entities: databaseEntities,
        migrations: ['dist/database/typeorm/migrations/*.js'],
        synchronize: false,
        autoLoadEntities: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature(databaseEntities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
