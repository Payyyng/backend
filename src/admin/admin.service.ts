import {
    Injectable,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }
    getHello(): string {
        return 'Hello World!';
    }

    


    async disableUserAccount(id: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }


        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        })

        if (!updatedUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        return {
            status: 'success',
            message: 'Account Disabled Successfully'
        }
    }

    async enableUserAccount(id: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                isActive: true
            }
        })

        if (!updatedUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        return {
            status: 'success',
            message: 'Account Enabled Successfully'
        }

    }


    //Get All Users Details 

    async getAllUsers(): Promise<any> {
        try {
            return await this.prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc'
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
                }
            })
        } catch (err) {
            return 'Something went wrong. Please try again'
        }
    }

    //Get All Transactions 
    async getAllTransactions(): Promise<any> {

        try {
            return await this.prisma.transaction.findMany({
                orderBy: {
                    createdAt: 'desc'
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
                        }
                    },
                }
            })
        } catch (err) {
            return 'Something went wrong. Please try again'
        }
    }

    //Get All Balance

    async getAllBalance(): Promise<any> {
        try {
            return await this.prisma.account.findMany({
                orderBy: {
                    createdAt: 'desc'
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
                        }
                    },
                }
            })
        } catch (err) {
            throw err
        }
    }

    async updateAdminConstant(updateAdminConst) {
        const updatedValues = await this.prisma.admin.updateMany({
            where: {
                userRole: "ADMIN"
            },
            data: {
                ...updateAdminConst
            }
        })

        if (!updatedValues) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }
        return {
            status: 'success',
            message: 'Admin Constants Updated Successfully'
        }
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
                    exchangeTransactionFeePercentage: true
                }
            })
        } catch (err) {
            return 'Something went wrong. Please try again'
        }
    }

    async getAllPaypals() {
        try {
            return await this.prisma.paypal.findMany({
                orderBy: {
                    createdAt: 'desc'
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
                }
            })
        } catch (err) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }
    }

    async getAllBankTransfers() {
        try {
            return await this.prisma.bank.findMany({
                orderBy: {
                    createdAt: 'desc'
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
                        }
                    },
                    userId: true,
                    createdAt: true,
                }
            })
        } catch (err) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }
    }
}
