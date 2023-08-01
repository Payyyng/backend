import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import randomize from 'randomatic'
import { DepositDTO } from './dto/deposit.dto';

const reference = `${randomize('Aa', 10)}`

@Injectable()
export class AccountsService {

  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) { }


  create(reateAccountDto: CreateAccountDto) {



    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all accounts`;
  }

  async findOne(id: string): Promise<any> {
    if (!id) {
      throw new HttpException('Accout ID is Required', HttpStatus.BAD_REQUEST)
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

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  /*
  * @param {string} email
  */

  async accountDeposit(depositData: DepositDTO) {
    const { id, amount, type } = depositData

    if (!id || !amount || !type){
      throw new HttpException('Please provide all required fields', HttpStatus.BAD_REQUEST)
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    console.log(user, "THE USER")

    const account = await this.prisma.account.findFirst({
      where: {
        userId: id
      }
    })

    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND)
    }

    let newBalance;

    if (type === 'CREDIT') {
      newBalance = account.NGN + Number(amount)
    } else {
      newBalance = account.NGN - Number(amount)
    }

 await this.prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        NGN: Number(newBalance)
      }
    })

    //Create A Transaction Details
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: amount,
        type: 'DEPOSIT',
        userId: id,  
        currency: "NGN",
        status: "Completed",
        narration:`Card Deposit ${user.firstName}`, 
        customer: `${user.firstName + " " + user.lastName}`,
        reference: reference,
        transactionType: 'DEPOSIT',
      }
    })

    if (!transaction) {
      throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    //Send Email notification to admin
    this.mailService.TransactionsNotificationEmail({
      email:'support@payyng.com',
      firstName: 'Admin',
      content: `You have a new ${amount} deposited from User with Name ${user.lastName}, with email ${user.email} and the userID is ${user.id} `
    })

    return{
      status: "success",
      message: "Deposit Successful",
    }
  }

  //FUNC TO UPDATE ACCOUNT BALANCE
  async updateAccountBalance(account:any, currency:string, amount:number, fee:number, type:string) {

    console.log(account, currency, amount, fee, type, "HEHEHEHEH")
    if (type === 'debit'){
      if (account[currency] < amount) {
        throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  
    let newBalance : any;

    if (type === "credit"){
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

  async accountTopUp  ({id, currency, amount, fee, type}:any){

    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
    const account= await this.prisma.account.findFirst({
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
        narration:`Account Deposit ${user.firstName + ""+ user.lastName}`,
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
}
