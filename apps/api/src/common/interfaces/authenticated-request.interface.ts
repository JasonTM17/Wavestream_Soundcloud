import { Request } from 'express';
import { UserEntity } from 'src/database/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: UserEntity;
}
