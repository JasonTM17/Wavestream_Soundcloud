import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from 'src/database/entities/follow.entity';
import { ProfileEntity } from 'src/database/entities/profile.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProfileEntity, FollowEntity]),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
