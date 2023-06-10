import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import randomize from 'randomatic'

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

  async accountDeposit(depositData: any) {
    const { id, amount } = depositData

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

    console.log(account, "THE ACCOUNT")


    const newBalance = account.NGN + Number(amount)

 await this.prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        NGN: newBalance
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
      }
    })

    if (!transaction) {
      throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR)
      
    }

    return{
      status: "success",
      message: "Deposit Successful",
    }
  }
}
