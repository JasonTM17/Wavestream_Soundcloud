import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, of } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      try {
        const result = super.canActivate(context);
        if (result instanceof Promise) {
          return result.catch(() => true);
        }
        if (result instanceof Observable) {
          return result.pipe(catchError(() => of(true)));
        }

        return result;
      } catch {
        return true;
      }
    }

    return super.canActivate(context);
  }
}
