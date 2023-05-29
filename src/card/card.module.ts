import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [CardService, MailService, PrismaService],
  controllers: [CardController],
  imports: [PrismaModule,MailModule]
})
export class CardModule {}
