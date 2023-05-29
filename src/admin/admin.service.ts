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
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    phone: true,
                    accountNumber: true,
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
                select: {
                    id: true,
                    createdAt: true,
                    userId: true,
                    USD: true,
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

    async updateAdminConstant (updateAdminConst) {
       const {exchangeUSD, exchangeEUR, exchangeGPB, exchangeNGN, exchangeFee } = updateAdminConst
            const updatedValues = await this.prisma.admin.updateMany({
                where:  {
                    userRole: "ADMIN`"
                } ,
                data: {
                    exchangeUSD,
                    exchangeEUR,
                    exchangeGPB,
                    exchangeNGN,
                    exchangeFee
                }
            })

            if(!updatedValues){
                throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
            }
            return {
                status: 'success',
                message: 'Values Updated Successfully'
            }
  
    }
}
