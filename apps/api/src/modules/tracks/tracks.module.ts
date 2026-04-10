import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/database/entities/comment.entity';
import { GenreEntity } from 'src/database/entities/genre.entity';
import { LikeEntity } from 'src/database/entities/like.entity';
import { ListeningHistoryEntity } from 'src/database/entities/listening-history.entity';
import { PlayEventEntity } from 'src/database/entities/play-event.entity';
import { RepostEntity } from 'src/database/entities/repost.entity';
import { TagEntity } from 'src/database/entities/tag.entity';
import { TrackFileEntity } from 'src/database/entities/track-file.entity';
import { TrackEntity } from 'src/database/entities/track.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { TracksController } from 'src/modules/tracks/tracks.controller';
import { TracksService } from 'src/modules/tracks/tracks.service';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      CommentEntity,
      TrackEntity,
      TrackFileEntity,
      GenreEntity,
      LikeEntity,
      ListeningHistoryEntity,
      PlayEventEntity,
      RepostEntity,
      TagEntity,
      UserEntity,
    ]),
  ],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
