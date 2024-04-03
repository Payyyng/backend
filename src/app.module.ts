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
import { AccountsModule } from './accounts/accounts.module';
import { PaypalModule } from './paypal/paypal.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { PlanModule } from './plan/plan.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/auth-roles.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 50,
      },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    TransactionModule,
    CardModule,
    AccountsModule,
    PaypalModule,
    NotificationsModule,
    PlanModule,
  ],
  controllers: [
    AppController,
    AuthController,
    TransactionController,
    AdminController,
    NotificationsController,
  ],
  providers: [
    AppService,
    AuthService,
    JwtService,
    UsersService,
    TransactionService,
    AdminService,
    NotificationsService,

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    ThrottlerGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
