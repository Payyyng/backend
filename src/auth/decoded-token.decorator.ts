import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AuthError, AuthErrors } from 'src/auth/auth.error';

export const DecodedTokenDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // console.log(request, 'decodedToken')
    const decodedUser = request.user;
    if (!decodedUser)
      throw new AuthError(
        AuthErrors.UNAUTHORIZED,
        'You are Unauthorized to perform this action.',
        HttpStatus.FORBIDDEN,
        `decodedToken (${decodedUser}) does not exist.`,
      );

    return decodedUser;
  },
);
