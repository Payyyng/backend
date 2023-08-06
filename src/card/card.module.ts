import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { AccountsService } from 'src/accounts/accounts.service';
import { AdminService } from '../admin/admin.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  providers: [
    CardService, 
    MailService, 
    PrismaService, 
    AccountsService,
    AdminService,
    NotificationsService,
    UsersService,
    JwtService,
    TransactionService
    
  ],
  controllers: [CardController],
  imports: [PrismaModule,MailModule]
})
export class CardModule {}
