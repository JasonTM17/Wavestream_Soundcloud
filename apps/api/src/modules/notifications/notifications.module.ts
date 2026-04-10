import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/database/entities/notification.entity';
import { NotificationsController } from 'src/modules/notifications/notifications.controller';
import { NotificationsGateway } from 'src/modules/notifications/notifications.gateway';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
