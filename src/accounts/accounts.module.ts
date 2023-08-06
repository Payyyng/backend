import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from 'src/notifications/notifications.service';
@Module({
  controllers: [AccountsController],
  providers: [
    AccountsService,
    NotificationsService,
     MailService, 
     PrismaService, 
     UsersService, 
     TransactionService,
     JwtService ]
})
export class AccountsModule {}


