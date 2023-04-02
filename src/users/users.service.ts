
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { User, Prisma } from '@prisma/client';
import { createUserDto } from './dto/create-user.dto';
import { hash, compare } from 'bcrypt';
import randomize from 'randomatic';
import axios from 'axios';


const BASE_API_URL = "https://api.flutterwave.com/v3"
const SECRET_KEY = 'FLWSECK_TEST-10876e1c7827a5d99bc4bebfbd09a166-X'


export interface RegistrationStatus {
    status: string;
    message: string;
    userId: any;
}


@Injectable()
export class UsersService {

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private jwtService: JwtService,
    ) { }

    async createUser(userInfo: createUserDto): Promise<RegistrationStatus> {

        const { email, password, firstName, lastName, phone } = userInfo;

        //check if any of the userinfo is not provided 
        if (!email || !password || !firstName || !lastName || !phone) {
            throw new HttpException("All fields are required", HttpStatus.BAD_REQUEST)
        }

        // check if email already exists 
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (userExists) {
            throw new HttpException(`Account already exist. Please login to continue`, HttpStatus.CONFLICT)
        }


        //Generate Otp Code
        const otp = randomize('0', 6)
        //Generate Promo Code 

        const promoCode = randomize('A', 8)

        //Send Verification Email To The User 

        await this.mailService.sendVerificationMail(email, firstName, otp)

        // hash password if user doesn't exist
        const hashedPassword = await hash(password, 10)
        // create user

        const newUser = await this.prisma.user.create({
            data: <any>{
                ...userInfo,
                password: hashedPassword,
                otp: Number(otp),
                promoCode: promoCode,
            }
        })

        if (!newUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        let status: RegistrationStatus = {
            status: "success",
            message: "Account Registered Sucessfully",
            userId: newUser.id
        }


        return status
    }

    async verifyUser(id: string, otp: number): Promise<any> {
        //check if there's no otp

        if (!otp || !id) {
            throw new HttpException("Otp and Id  is required", HttpStatus.BAD_REQUEST)
        }

        const user = await this.prisma.user.findFirst({
            where: {
                id
            }
        })

        if (!user) {
            throw new HttpException("Invalid Verification Code", HttpStatus.BAD_REQUEST)
        }

        //Check If the OTP is the Same As What We Have Saved In Database

        console.log("Verification Code", user.otp)
        if (user.otp != otp) {
            throw new HttpException("Invalid Verification Code", HttpStatus.BAD_REQUEST)
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isVerified: true,
                otp: null
            }
        })

        if (!updatedUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        return {
            status: 'success',
            message: 'Email Verification Successfully'
        }
    }

    async createUserPin(id: string, pin: number): Promise<any> {
        console.log(id, "THE ID")
        if (!pin || !id) {
            throw new HttpException("Pin and ID is required", HttpStatus.BAD_REQUEST)
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            throw new HttpException("Invalid Verification Code", HttpStatus.BAD_REQUEST)
        }


        //Encrypt User Transaction Pin Before Saving 
        const convert = pin.toString()
        console.log(convert, "THE CONVERTED")
        const hashedPin = await hash(convert, 10)
        console.log(hashedPin, "THE HASED PIN")

        //Check If the OTP is the Same As What We Have Saved In Database
        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: <any>{
                pin: hashedPin
            }
        })


        //Generate and Sign JWT Token for user 
        const token = this.jwtService.sign(updatedUser.id, {
            secret: `${process.env.JWT_SECRET}`,
        })

        //Delete Password from the response back 
        delete updatedUser.password

        if (!updatedUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        return {
            status: 'success',
            message: 'Pin Created Successfully',
            user: {
                access_token: token,
                ...updatedUser,
            }

        }
    }

    async verifyTransactionPin(id: string, pin: number,): Promise<any> {
        if (!pin || !id) {
            throw new HttpException("Pin and ID is required", HttpStatus.BAD_REQUEST)
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        //Check If the OTP is the Same As What We Have Saved In Database

        const isMatch = await compare(pin.toString(), user.pin)

        if (!isMatch) {
            throw new HttpException("Invalid Transaction Pin", HttpStatus.BAD_REQUEST)
        }

        return {
            status: 'success',
            message: 'The Transaction Pin has been Verified Successfully.'
        }
    }

    async updateUserAccount(id: string, data: Prisma.UserUpdateInput): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data
        })

        if (!updatedUser) {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.SERVICE_UNAVAILABLE)
        }

        return {
            status: 'success',
            message: 'Account Updated Successfully'

        }
    }


    async findUserByEmail(email: string): Promise<any> {

        try {
            return await this.prisma.user.findUnique({
                where: {
                    email: email
                }
            })
        } catch (err) {
            return "Something went wrong. Please try again"
        }

    }

    async findUserById(id: string): Promise<any> {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    id: id
                }
            })
        } catch (err) {
            return "Something went wrong. Please try again"
        }
    }

    /**
    * @param data 
    * @access PUBLIC
    * @description This method is used to create bank account for users
    * @returns 
    */
    async createBankAccount(email: string, bvn: number) {

        if (!email || !bvn) {
            throw new HttpException('All fields are required', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const reference = randomize('aa', 10)
        const config = {
            'method': 'POST',
            'url': `${BASE_API_URL}/virtual-account-numbers`,
            'headers': {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                "email": email,
                "bvn": bvn,
                "currency": "NGN",
                "trx_ref": reference
            }
        }

        const response = await axios(config)

        if (response.data.status !== "success") {
            throw new HttpException("Something went wrong. Please try again", HttpStatus.GATEWAY_TIMEOUT)
        }

        // Save The Account Number in DataBase

        return response.data
    }

}