import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendPasswordResetMail(email: string, firstName: string, code: any) {

        await this.mailerService.sendMail({
            to: email,
            subject: 'Payyng Password Reset',
            template: './passwordreset',
            context: {
                firstName,
                code
            },
        });
    }

    async sendVerificationMail(email: string, firstName: string, code: any) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Payyng Account Verification',
            template: './verification',
            context: {
                firstName,
                code
            },
        });
    }

    async sendTransactionNotificationEmail(email: string, firstName: string, status: string, amount: number, trx_type: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Transaction Notification',
            template: './transaction',
            context: {
                firstName,
                status,
                amount,
                trx_type
            },
        });
    }

}

