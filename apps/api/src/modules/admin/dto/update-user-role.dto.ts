import { UserRole } from '@wavestream/shared';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
