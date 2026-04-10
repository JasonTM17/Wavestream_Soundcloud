import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from 'src/database/entities/audit-log.entity';
import { CommentEntity } from 'src/database/entities/comment.entity';
import { PlaylistEntity } from 'src/database/entities/playlist.entity';
import { ReportEntity } from 'src/database/entities/report.entity';
import { TrackEntity } from 'src/database/entities/track.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { AdminController } from 'src/modules/admin/admin.controller';
import { AdminService } from 'src/modules/admin/admin.service';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      AuditLogEntity,
      CommentEntity,
      PlaylistEntity,
      ReportEntity,
      TrackEntity,
      UserEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
