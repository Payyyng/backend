import {
    Injectable,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

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
}
