import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AccountsService {

  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ){}


  create(createAccountDto: CreateAccountDto) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all accounts`;
  }

  async findOne(id: string): Promise<any>{
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
}
