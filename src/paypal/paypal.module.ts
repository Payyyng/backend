import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { AdminService } from '../admin/admin.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from 'src/transaction/transaction.service';


@Module({
  controllers: [PaypalController],
  providers: [PaypalService,JwtService, TransactionService, UsersService, MailService,NotificationsService , PrismaService, AccountsService, AdminService]
})
export class PaypalModule {}
