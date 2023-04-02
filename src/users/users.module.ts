import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [UsersService, JwtService],
  controllers: [UsersController],
  imports: [PrismaModule, MailModule]

})
export class UsersModule { }
