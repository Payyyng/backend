import { Module, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from './constants';
import { MailModule } from 'src/mail/mail.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
    imports: [
        MailModule,
        UsersModule,
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        JwtModule.register({
            secret: "Ayomideh1....",
            signOptions: {
                expiresIn: '3600s',
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, NotificationsService, LocalStrategy, JwtStrategy, PrismaService, UsersService, JwtService, ConfigService],
    exports: [AuthService],
})
export class AuthModule { }
export { AuthService };


