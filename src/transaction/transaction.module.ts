import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({})
export class TransactionModule {
    providers: [NotificationsService]
}
