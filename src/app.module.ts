import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { TransactionService } from './transaction/transaction.service';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ConfigModule } from '@nestjs/config';
import { CardModule } from './card/card.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';


@Module({
  
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    TransactionModule,
    CardModule,
  ],
  controllers: [
    AppController,
    AuthController,
    TransactionController,
    AdminController,
  ],
  providers: [
    AppService,
    AuthService,
    JwtService,
    UsersService,
    TransactionService,
    AdminService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],


})
export class AppModule {}
