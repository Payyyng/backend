import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { AccountsService } from 'src/accounts/accounts.service';

@Module({
  providers: [CardService, MailService, PrismaService, AccountsService],
  controllers: [CardController],
  imports: [PrismaModule,MailModule]
})
export class CardModule {}
