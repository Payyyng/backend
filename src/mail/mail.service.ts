import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface TransactionEmailDTO {
  email: string;
  firstName: string;
  content: string;
}
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordResetMail(email: string, firstName: string, code: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      template: './passwordreset',
      context: {
        firstName,
        code,
      },
    });
  }

  async sendVerificationMail(email: string, firstName: string, code: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './verification',
      context: {
        firstName,
        code,
      },
    });
  }

  async sendLoginNotificationMail(email: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Access',
      template: './loginNotification',
      context: {
        firstName,
      },
    });
  }

  async sendTransactionNotificationEmail(
    email: string,
    reference: string,
    type: string,
    customer: any,
    firstName: string,
    status: string,
    amount: number,
    biller_name: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Payyng Transaction Notification',
      template: './transaction',
      context: {
        firstName,
        status,
        amount,
        biller_name,
        reference,
        customer,
        type,
      },
    });
  }

  async sendBankTransferNotificationEmail(
    email: string,
    beneficiary_name: string,
    account_number: number,
    firstName: string,
    amount: number,
    bank_name: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bank Transfer Notification',
      template: './bankTransfer',
      context: {
        firstName,
        amount,
        bank_name,
        account_number,
        beneficiary_name,
      },
    });
  }

  async sendPayyngTransferNotificationEmail(
    email: string,
    firstName: string,
    amount: number,
    currency: string,
    sender_name: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Transaction Notification',
      template: './payyngTransfer',
      context: {
        firstName,
        amount,
        currency,
        sender_name,
      },
    });
  }

  async TransactionsNotificationEmail({
    email,
    firstName,
    content,
  }: TransactionEmailDTO) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Transaction Notification',
      template: './allTransactions',
      context: {
        firstName,
        content,
      },
    });
  }
}
