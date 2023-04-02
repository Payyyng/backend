import { loginUserDto } from './dto/login-user.dto';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from './auth.module'


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super(
            {
                usernameField: 'email',
                passwordField: 'password'
            }
        )
    }

    async validate(email: string, password: string) {
        console.log(email, password, "IN THE LOCAL STRATEGY")


        const user = await this.authService.validateUser({ email, password })
        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}

export class LocalGuard extends AuthGuard('local') { }