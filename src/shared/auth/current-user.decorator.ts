import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthAccessTokenPayload } from './auth-token-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthAccessTokenPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthAccessTokenPayload | undefined;
  },
);

