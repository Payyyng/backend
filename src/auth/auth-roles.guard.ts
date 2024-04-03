import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './auth.enum';
import { ROLES_KEY } from './roles.decorator';
import { DecodedTokenDecorator } from './decoded-token.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, so access is granted
    }

    console.log(requiredRoles, 'requiredRoles');

    const request = context.switchToHttp().getRequest();
    const userToken = request.headers.authorization.split[0]; // Assuming user is stored in request.user
    const [type, token] = request.headers.authorization?.split(' ');
    if (!token) {
      return false;
    }
    const decodedToken = await this.authService.verifyToken(token);
    console.log(decodedToken, 'decodedToken');
    if (!decodedToken) {
      return false;
    }

    if (decodedToken.role === requiredRoles[0]) {
      return true;
    }
    return false;
  }
}
