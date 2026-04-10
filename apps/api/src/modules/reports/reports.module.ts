import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/database/entities/comment.entity';
import { PlaylistEntity } from 'src/database/entities/playlist.entity';
import { ReportEntity } from 'src/database/entities/report.entity';
import { TrackEntity } from 'src/database/entities/track.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { ReportsController } from 'src/modules/reports/reports.controller';
import { ReportsService } from 'src/modules/reports/reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      PlaylistEntity,
      ReportEntity,
      TrackEntity,
      UserEntity,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
