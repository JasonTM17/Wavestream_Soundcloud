import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from 'src/database/entities/user.entity';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @CurrentUser() user: UserEntity,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getNotifications(user.id, page, limit);
  }

  @Post(':id/read')
  markRead(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: UserEntity) {
    return this.notificationsService.markAllRead(user.id);
  }
}
