import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { MailService } from 'src/mail/mail.service';

@Module({
  providers: [CardService, MailService],
  controllers: [CardController]
})
export class CardModule {}
