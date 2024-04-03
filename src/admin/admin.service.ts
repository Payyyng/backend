import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpAdminDTO } from './dto/admin-signUp-dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async signUp({ email, password, firstName, lastName }: SignUpAdminDTO) {
    if (!email || !password) {
      throw new HttpException(
        'Email and Password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: <any>{
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        role: 'ADMIN',
      },
    });

    if (!newUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'Admin Created Successfully',
    };
  }

  async login({ email, password }: any) {
    if (!email || !password) {
      throw new HttpException(
        'Email and Password are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await hash(password, 10);

    if (passwordMatch !== user.password) {
      throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }

    return {
      access_token: this.jwtService.sign(user.id, {
        secret: `${process.env.JWT_SECRET}`,
      }),
      ...user,
    };
  }

  async disableUserAccount(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    if (!updatedUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'Account Disabled Successfully',
    };
  }

  async enableUserAccount(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });

    if (!updatedUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'Account Enabled Successfully',
    };
  }

  //Get All Users Details

  async getAllUsers(): Promise<any> {
    try {
      return await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          phone: true,
          notificationKey: true,
          promoCode: true,
        },
      });
    } catch (err) {
      return 'Something went wrong. Please try again';
    }
  }

  //Get All Transactions
  async getAllTransactions(): Promise<any> {
    try {
      return await this.prisma.transaction.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          userId: true,
          reference: true,
          currency: true,
          status: true,
          customer: true,
          Bank: true,
          type: true,
          transactionType: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    } catch (err) {
      return 'Something went wrong. Please try again';
    }
  }

  //Get All Balance

  async getAllBalance(): Promise<any> {
    try {
      return await this.prisma.account.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          USD: true,
          EUR: true,
          GBP: true,
          NGN: true,
          USDAccount: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async updateAdminConstant(updateAdminConst) {
    const updatedValues = await this.prisma.admin.updateMany({
      where: {
        userRole: 'ADMIN',
      },
      data: {
        ...updateAdminConst,
      },
    });

    if (!updatedValues) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return {
      status: 'success',
      message: 'Admin Constants Updated Successfully',
    };
  }

  async getAdminConstant() {
    try {
      return await this.prisma.admin.findMany({
        select: {
          exchangeUSD: true,
          exchangeEUR: true,
          exchangeGBP: true,
          exchangeNGN: true,
          exchangeFee: true,
          paypalEmail: true,
          paypalRate: true,
          exchangeTransactionFeePercentage: true,
          dataProfit: true,
        },
      });
    } catch (err) {
      return 'Something went wrong. Please try again';
    }
  }

  async getAllPaypals() {
    try {
      return await this.prisma.paypal.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          description: true,
          loginDetails: true,
          paymentLink: true,
          amount: true,
          tradeAmount: true,
          status: true,
          fee: true,
          user: true,
          currency: true,
          createdAt: true,
        },
      });
    } catch (err) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getAllBankTransfers() {
    try {
      return await this.prisma.bank.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          account_number: true,
          account_bank: true,
          bank_name: true,
          amount: true,
          reference: true,
          currency: true,
          status: true,
          narration: true,
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          userId: true,
          createdAt: true,
        },
      });
    } catch (err) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async deactivateUser(id: string, type: string) {
    if (!id) {
      throw new HttpException('User Id Is Required', HttpStatus.NOT_FOUND);
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isActive: type === 'DEACTIVATE' ? false : true,
      },
    });

    if (!updatedUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'User Account Deactivated Successfully',
    };
  }
}
