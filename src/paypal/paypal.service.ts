import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaypalDto } from './dto/create-paypal.dto';
import { UpdatePaypalDto } from './dto/update-paypal.dto';
import { MakePayment } from './dto/make-a-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { AccountsService } from 'src/accounts/accounts.service';
import randomize from 'randomatic'
import { BuyPaypalDTO } from './dto/buy-paypal-dto';
import { SellPaypalDTO } from './dto/sell-paypal-dto';
import { AdminService } from 'src/admin/admin.service';



const reference = randomize('Aa', 10)


@Injectable()
export class PaypalService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private accountService: AccountsService,
    private adminService : AdminService
) { }

  async createPaypal(createPaypalDto: CreatePaypalDto) {

    const createPaypal = await this.prisma.paypal.create({
      data: {
        ...createPaypalDto
      }
    })
    if (!createPaypal){
      throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return createPaypal

    }

  findAll() {
    return `This action returns all paypal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paypal`;
  }

  update(id: number, updatePaypalDto: UpdatePaypalDto) {
    return `This action updates a #${id} paypal`;
  }

  remove(id: number) {
    return `This action removes a #${id} paypal`;
  }

  async makeApayment (MakePayment: MakePayment) {

    const {amount, paymentLink, currency, id, description, fee } = MakePayment

    if (!amount || !paymentLink || !currency) {
      throw new HttpException('Insufficient Balance', HttpStatus.BAD_REQUEST)
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      const account = await this.prisma.account.findFirst({
        where:{
          userId: id
        }
      })

      await this.accountService.updateAccountBalance(account, currency, amount, fee, 'debit')

      await this.createPaypal({
        amount, 
        paymentLink, 
        currency, 
        description, 
        fee,
        tradeAmount: 0,
        loginDetails: '',
        userId: id
      })

      
      const transaction = await this.prisma.transaction.create({
        data: {
          amount: amount,
          type: "MAKE A PAYMENT",
          billerName: paymentLink,
          currency: currency,
          bank_name: `PAYPAL - MAKE A PAYMENT REQUEST`,
          customer: ` ${user.firstName} ${user.lastName}`,
          reference: reference,
          status: "Pending",
          narration: description,
          fee: fee,
          user: {
            connect: { id: user.id },
          },
        },
      });

      // Create Transaction Details 
      //Send Email to User
      await this.mailService.TransactionsNotificationEmail({
       firstName: user.firstName,
       email: user.email, 
       content : `Your Make a PAYPAL Payment Request order for ${currency} ${amount} was received successfully. You will be notified once completed.`
      })

      return {
        status: 'success',
        message: "Make A Request Order Created Successfully", 
        transaction: transaction
      }

    } catch (err) {
      throw err
    }
  }


  async buyPaypal (buypaypal: BuyPaypalDTO) {

    const {amount, id, email, description, currency, tradeAmount} = buypaypal
    if (!amount || !id || !email || !currency || !tradeAmount) {
      throw new HttpException('All Fields Are Required', HttpStatus.BAD_REQUEST)
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      const account = await this.prisma.account.findFirst({
        where:{
          userId: id
        }
      })

      await this.accountService.updateAccountBalance(account, "NGN", tradeAmount, 0, 'debit')

      await this.createPaypal({
        amount,
        description,
        fee: 0,
        paymentLink: '',
        tradeAmount: tradeAmount,
        loginDetails: '',
        currency: currency,
        userId: id
      })

      const transaction = await this.prisma.transaction.create({
        data: {
          amount: amount,
          type: "BUY PAYPAL FUNDS",
          billerName: email,
          currency: currency,
          bank_name: `PAYPAL - BUY FUNDS - ${email}`,
          customer: ` ${user.firstName} ${user.lastName}`,
          reference: reference,
          status: "COMPLETED",
          narration: description,
          fee: 0,
          user: {
            connect: { id: user.id },
          },
        },
      })

      //Send Email
      await this.mailService.TransactionsNotificationEmail({
        firstName: user.firstName,
        email: user.email,
        content: `Your recent purchase of ${currency}${amount} PAYPAL funds was completed successfully`
      })

      return {
        status: 'success',
        message: "Paypal funds purchased successfully",
        transaction: transaction
      }

    } catch (err){
      throw err
    }

  }

  async sellPaypal (sellPaypal: SellPaypalDTO) {

    const {amount, id, currency, tradeAmount} = sellPaypal

    if (!amount || !id || !currency || !tradeAmount) {
      throw new HttpException('All Fields Are Required', HttpStatus.BAD_REQUEST)
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      //get ADMIN CONSTANTS 

      const adminConstant = await this.adminService.getAdminConstant()

      console.log(adminConstant, "BACK BACK ")

      //Send Email
      if (typeof adminConstant[0] === 'object' && adminConstant[0] !== null) {
        await this.prisma.transaction.create({
          data: {
            amount: amount,
            type: "SELL PAYPAL FUNDS",
            billerName: adminConstant[0]?.paypalEmail,
            currency: currency,
            bank_name: `PAYPAL - SELL FUNDS`,
            customer: ` ${user.firstName} ${user.lastName}`,
            reference: reference,
            status: "PENDING",
            narration: "",
            fee: 0,
            user: {
              connect: { id: user.id },
            },
          },
        })

        await this.createPaypal({
          amount,
          description: "",
          fee: 0,
          paymentLink: '',
          tradeAmount: tradeAmount,
          loginDetails: '',
          currency: '',
          userId: id,
        })

        await this.mailService.TransactionsNotificationEmail({
          firstName: user.firstName,
          email: user.email,
          content: `You have a pending Sell Paypal order of ${currency} ${amount}. Kindly complete the transaction and notify us once completed. `
        })

        return {
          status: 'success',
          message: "",
          payPalEmail: adminConstant[0].paypalEmail
        };
      } else {
        throw new HttpException('We currently dont have an email for this transaction. Please try again later or contact support to trade with our agents.', HttpStatus.PRECONDITION_REQUIRED)
      }
    }catch(err){
      throw err
    }
  }
}
