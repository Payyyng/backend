import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { TransactionService } from 'src/transaction/transaction.service';
import randomize from 'randomatic'
import FlutterwaveEvents from 'flutterwave-events'
import { DepositDTO } from './dto/deposit.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

const reference = `${randomize('Aa', 10)}`

@Injectable()
export class AccountsService {

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private userService: UsersService,
    private transactionService: TransactionService,
    private notificationService: NotificationsService
  ) { }


  create(reateAccountDto: CreateAccountDto) {



    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all accounts`;
  }

  async findAccountByUserId(userId: string): Promise<any> {
    if (!userId) {
      throw new HttpException('User ID is Required', HttpStatus.BAD_REQUEST)
    }

    const account = await this.prisma.account.findFirst({
      where: {
        userId: userId
      }
    })

    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND)
    }

    return account
  }


  async findOne(id: string): Promise<any> {
    if (!id) {
      throw new HttpException('Account ID is Required', HttpStatus.BAD_REQUEST)
    }


    const account = await this.prisma.account.findUnique({
      where: {
        id: id
      }
    })
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND)
    }
    return account
  }

  async update(updateAccountDto: UpdateAccountDto) {

    const { type, id, currency, amount } = updateAccountDto

    try {
      const account = await this.findOne(id)

      if (type !== 'CREDIT') {
        if (account.NGN < amount) {
          throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
        }
      }

      let newBalance;
      if (type === 'CREDIT') {
        newBalance = account.NGN + Number(amount)
      } else {
        newBalance = account.NGN - Number(amount)
      }

      const res = await this.prisma.account.update({
        where: {
          id: id
        },
        data: {
          NGN: Number(newBalance)
        }
      })

      if (!res) {
        throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
      }

      return {
        status: "success",
        message: "Account Updated Successfully",
        data: res
      }
    } catch (err) {
      throw err
    }
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }


  async accountDeposit(depositData: DepositDTO) {
    const { id, amount, type } = depositData

    if (!id || !amount || !type) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST)
    }

    try {
      const user = await this.userService.findUserById(id)
      const account = await this.findOne(user?.accounts[0].id)
      await this.updateAccountBalance(account, 'NGN', amount, 0, type)
      await this.transactionService.create({
        amount: amount,
        type: type,
        userId: id,
        currency: 'NGN',
        status: "Completed",
        narration: `Account Deposit ${user.firstName + "" + user.lastName}`,
        customer: `${user.firstName + " " + user.lastName}`,
        fee: 0,
        transactionType: "DEPOSIT",
        bankName: "",
        billerName: "",
      })

      //Send Email notification to admin
      this.mailService.TransactionsNotificationEmail({
        email: 'support@payyng.com',
        firstName: 'Admin',
        content: `You have a new ${amount} deposited from User with Name ${user.lastName}, with email ${user.email} and the userID is ${user.id} `
      })

      //Send Email to User

      this.mailService.TransactionsNotificationEmail({
        email: user.email,
        firstName: user.firstName,
        content: `You have successfully deposited ₦ ${amount} to your account`
      })

      //Send Notification to User

      this.notificationService.sendNotification({
        expoPushToken: user.notificationKey,
        title: "Deposit Successful",
        body: `You have successfully deposited ₦ ${amount} to your account`,
      })

      return {
        status: "success",
        message: "Deposit Successful",
      }
    } catch (err) {
      throw err
    }

  }

  //FUNC TO UPDATE ACCOUNT BALANCE
  async updateAccountBalance(account: any, currency: string, amount: number, fee: number, type: string) {

    if (type === 'debit') {
      if (account[currency] < amount) {
        throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }

    let newBalance: any;

    if (type === "credit" || type === "CREDIT") {
      newBalance = account[currency] + amount + fee;
    } else {
      newBalance = account[currency] - amount - fee;
    }

    if (newBalance < 0) {
      throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: { [currency]: newBalance },
    });

    if (!updatedAccount) {
      throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE);
    }

    return updatedAccount;
  }

  async adminUpdateUserAccounBalance(updateAccountDto: UpdateAccountDto) {
    try {
      const account = await this.findOne(updateAccountDto.id)
      const user = await this.userService.findUserById(account.userId)
      await this.update(updateAccountDto)
      const transaction = await this.transactionService.create({
        amount: updateAccountDto.amount,
        type: updateAccountDto.type,
        userId: user.id,
        currency: updateAccountDto.currency,
        status: "Completed",
        narration: `Account Deposit ${user.firstName + " " + user.lastName}`,
        customer: `${user.firstName + " " + user.lastName}`,
        fee: 0.00,
        transactionType: "DEPOSIT",
        bankName: "",
        billerName: "",
      })

      //Send Email To The User

      this.mailService.TransactionsNotificationEmail({
        email: user.email,
        firstName: user.firstName,
        content: `You have successfully deposited ${updateAccountDto.amount} to your account`
      })

      //Send Email To  Admin
      this.mailService.TransactionsNotificationEmail({
        email: 'support@payyng.com',
        firstName: 'Admin',
        content: `You have a new ${updateAccountDto.amount} deposited from User with Name ${updateAccountDto.id}, with email ${updateAccountDto.id} and the userID is ${updateAccountDto.id} `
      })

      return {
        status: 'success',
        message: 'successfully Credited',
        data: transaction
      }

    } catch (err) {
      throw err
    }
  }

  async accountTopUp({ id, currency, amount, fee, type }: any) {

    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
    const account = await this.prisma.account.findFirst({
      where: {
        userId: id
      }
    })

    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND)
    }

    await this.updateAccountBalance(account, currency, amount, fee, type);

    //Create A Transaction Details

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: amount,
        type: type,
        userId: id,
        currency: currency,
        status: "Completed",
        narration: `Account Deposit ${user.firstName + "" + user.lastName}`,
        customer: `${user.firstName + " " + user.lastName}`,
        fee: fee,
        transactionType: "DEPOSIT"
      }
    })
    return {
      status: "success",
      message: "Deposit Successful",
      transaction: transaction
    }
  }

  async webhookHandler(webhookData: any) {
    // const flutterwaveEvents = new FlutterwaveEvents(process.env.FLW_SECRET_KEY);

    // flutterwaveEvents.on('charge.success', async (data: any) => {
    //   console.log(data);



    // });
    const { data } = webhookData

    console.log(data, webhookData, "BOTH VALUES ")


    if (data.status === 'successful' && data.payment_type === 'bank_transfer') {
      try {
        const user = await this.prisma.user.findUnique({
          where: {
            email: data.customer.email
          }
        })

        const account = await this.prisma.account.findFirst({
          where: {
            userId: user.id
          }
        })

        const updateAmount = Number(data.amount) - Number(data.app_fee)
        console.log('AMOUNT TO UPDATE', updateAmount)

        await this.updateAccountBalance(account, data.currency, updateAmount, 0, 'credit')

        const trans = await this.prisma.transaction.create({
          data: {
            amount: updateAmount,
            type: 'DEPOSIT',
            userId: user.id,
            currency: data.currency,
            status: "Completed",
            narration: `Account Deposit ${user.firstName + "" + user.lastName}`,
            customer: `${user.firstName + " " + user.lastName}`,
            fee: 0,
            transactionType: "DEPOSIT",
            billerName: "",
            reference: data.flw_ref
          }
        })

        //Send Email to User

        this.mailService.TransactionsNotificationEmail({
          email: user.email,
          firstName: user.firstName,
          content: `You have successfully deposited ${data.amount} to your account`
        })

        //Sent Notification To The User Account

        this.notificationService.sendNotification({
          expoPushToken: user.notificationKey,
          title: "Deposit Successful",
          body: `You have successfully deposited ₦ ${updateAmount} to your account`,
        })

        return {
          status: "success",
          message: "Deposit Successful",
          code: HttpStatus.OK
        }
      } catch (err) {
        throw err
      }
    } else {
      throw new HttpException('Transaction Failed', HttpStatus.BAD_REQUEST)
    }

    // const {data} = webhookData

    // if (data.status === "successful" && data.payment_type === 'Bank_transfer'){




    //   //Return
    //   return {
    //     status: "success",
    //     message: "Deposit Successful",
    //   }
    // } else{
    //   return {
    //     status: "success",
    //     message: "Deposit Successful",
    //     code: HttpStatus.OK
    //   }
    // }
  }
}
