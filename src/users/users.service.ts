import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { User, Prisma } from '@prisma/client';
import { createUserDto } from './dto/create-user.dto';
import { hash, compare } from 'bcrypt';
import randomize from 'randomatic';
import axios from 'axios';
import { UpdateTransactionPinDto } from './dto/update_user_pin.dto';
import { Console } from 'console';

const BASE_API_URL = process.env.FLW_API_URL
const SECRET_KEY = process.env.FLW_SECRET_KEY

// console.log(BASE_API_URL, SECRET_KEY, "flw details")

export interface RegistrationStatus {
  status: string;
  message: string;
  id: any;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) { }

  async createUser({firstName, lastName, email, phone, password}: createUserDto): Promise<any> {
    

    //check if any of the userinfo is not provided
    if (!email || !password || !firstName || !lastName || !phone) {
      throw new HttpException(
        'All fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if email already exists
    const userExists = await this.prisma.user.findUnique({
      where: <any> {
        email: email,
      },
    });

    if (userExists) {
      throw new HttpException(
        'Account Already Exist. Please login to continue using payyng',
        HttpStatus.BAD_REQUEST,
      );
    }

    //Generate Otp Code
    const otp = randomize('0', 6);
    //Generate Promo Code

    const promoCode = randomize('A', 8);

    //Generate username from the lastName and add 4 random

    await this.mailService.sendVerificationMail(email, firstName, otp);

    // hash password if user doesn't exist
    const hashedPassword = await hash(password, 10);
    // create user

    const newUser = await this.prisma.user.create({
      data: <any>{
        firstName: firstName,
        lastName: lastName,
        email: email.toLowerCase(),
        phone: phone,
        password: hashedPassword,
        otp: Number(otp),
        promoCode: promoCode,
      },
    });

    if (!newUser) {
      throw new HttpException(
        'Something Went Wrong. Please Try Again',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newUser) {
      await this.prisma.account.create({
        data: <any>{
          userId: newUser.id
        }
      })
    }

    return {
      status: 'success',
      message: 'Account Registered Sucessfully',
      id: newUser.id,
    }
  }

  async verifyUser(id: string, otp: number): Promise<any> {
    //check if there's no otp

    if (!otp || !id) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message:'Otp and Id  is required',
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        'Invalid Verification Code',
        HttpStatus.BAD_REQUEST,
      );
    }

    //Check If the OTP is the Same As What We Have Saved In Database

    if (user.otp != otp) {
      throw new HttpException(
        'Invalid Verification Code',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        otp: null,
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
      message: 'Email Verification Successfully',
    };
  }

  async createUserPin(id: string, pin: number): Promise<any> {
    console.log(id, 'THE ID');
    // console.log(BASE_API_URL, SECRET_KEY, "flw details")

    if (!pin || !id) {
      throw new HttpException('Pin and ID is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        'Invalid Verification Code',
        HttpStatus.BAD_REQUEST,
      );
    }

    //Encrypt User Transaction Pin Before Saving
    const convert = pin.toString();
    const hashedPin = await hash(convert, 10);

    //Check If the OTP is the Same As What We Have Saved In Database
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: <any>{
        pin: hashedPin,
      },
    });

    //Generate and Sign JWT Token for user
    const token = this.jwtService.sign(updatedUser.id, {
      secret: `${process.env.JWT_SECRET}`,
    });

    //Delete Password from the response back
    delete updatedUser.password;
    delete updatedUser.pin

    if (!updatedUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'Pin Created Successfully',
      user: {
        access_token: token,
        ...updatedUser,
      },
    };
  }

  async verifyTransactionPin(id: string, pin: number): Promise<any> {
    if (!pin || !id) {
      throw new HttpException('Pin and ID is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    //Check If the OTP is the Same As What We Have Saved In Database

    const isMatch = await compare(pin.toString(), user.pin);

    if (!isMatch) {
      throw new HttpException(
        'Invalid Transaction Pin',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: 'The Transaction Pin has been Verified Successfully.',
    };
  }

  async updateAddress({ state, city, lga, address, id }: any) {
    if (!state || !city || !lga || !address) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
         id
        },
        data: <any> {
          state,
          lga,
          city,
          address
        }
      })

      console.log("entered, after")

      if (!updatedUser) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }

      return {
        status: 'success',
        message: 'Address Updated Successfully'
      }

    } catch (err) {
      throw new HttpException("Something went wrong. Please Try Again", HttpStatus.GATEWAY_TIMEOUT);
    }
  }

  async updateTransactionPin({ id, current_pin, new_pin }: UpdateTransactionPinDto) {

    if (!current_pin || !new_pin || !id) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      if (!user) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }

      const isMatch = await compare(current_pin.toString(), user.pin);

      if (!isMatch) {
        throw new HttpException('Invalid Transaction Pin', HttpStatus.BAD_REQUEST);
      }

      const convert = new_pin.toString();
      const hashedPin = await hash(convert, 10);

      const updatedUser = await this.prisma.user.update({
        where: {
          id
        },
        data: <any>{
          pin: hashedPin
        }
      })

      if (!updatedUser) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }

      return {
        status: 'success',
        message: 'Transaction Pin Updated Successfully'
      }

    } catch (err) {
      throw new HttpException(err, HttpStatus.GATEWAY_TIMEOUT);
    }
  }


  async updateUserAccount(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User with the ID not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });

    if (!updatedUser) {
      throw new HttpException(
        'Something went wrong. Please try again',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'success',
      message: 'Account Updated Successfully',
    };
  }

  async findUserByEmail(email: string): Promise<any> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email: email,
        }
      });
    } catch (err) {
      return 'Something went wrong. Please try again';
    }
  }

  async findUserById(id: string): Promise<any> {
    
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        }, 
        select: <any> {
          id : true,
          email   :    true,
          firstName :    true,
          lastName   :   true,
          userName  :    true,
          password  :    true,
          phone    :    true,
          address   :   true,
          city      :   true,
          state     :   true,
          lga       :   true,
          accountNumber: true,
          promoCode   :  true,
          otp       :    true,
          NGNBalance :   true,
          USDBalance :  true,
          EURBalance :   true,
          GPBBalance :  true,
          pin        :  true,
          token  :       true,
          bvn       :   true,
          isVerified  : true,  
          isActive   :   true,
          transactions : true,
          bankTransfers:true,
          accounts    :  true,
          cards     :    true,
        }
      });
      if (!user) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }
      return user;

    } catch (err) {
      throw err
    }
  }

  // async getUserDetails(id:)

  /**
   * @param data
   * @access PUBLIC
   * @description This method is used to create bank account for users
   * @returns
   */
  async createBankAccount(email: string, bvn: number) {

    if (!email || !bvn) {
      throw new HttpException(
        'All fields are required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const reference = randomize('aa', 10);
    const config = {
      method: 'POST',
      url: `${BASE_API_URL}/virtual-account-numbers`,
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        email: email,
        bvn: bvn,
        currency: 'NGN',
        trx_ref: reference,
      },
    };

    const response = await axios(config);

    if (response.data.status !== 'success') {
      throw new HttpException(
        response.data,
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    // Save The Account Number in DataBase
    console.log (response.data, "THE RESSSS")
    return response.data;
  }

  async updatePassword({ id, current_password, new_password }: any) {

    if (!current_password || !new_password || !id) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      if (!user) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }

      const isMatch = await compare(current_password, user.password);

      if (!isMatch) {
        throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST);
      }

      const convert = new_password.toString();
      const hashedPassword = await hash(convert, 10);

      const updatedUser = await this.prisma.user.update({
        where: {
          id
        },
        data: <any>{
          password: hashedPassword
        }
      })

      if (!updatedUser) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }

      return {
        status: 'success',
        message: 'Password Updated Successfully'
      }

    } catch (err) {
      throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async verifyUserBvn(id:string, bvn:number ) {
    
    console.log(bvn, id, "ENTEREEE")

    if (!bvn || !id) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }


    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      })

      console.log("AFTER")
      console.log(user, "THE USER")

      if (!user) {
        throw new HttpException("User Account Doesn't Exist", HttpStatus.NOT_FOUND);
      }


      const updatedUser = await this.prisma.user.update({
        where: {
          id
        },
        data: <any>{
          bvn: bvn
        }
      })

      return {
        status: 'success',
        message: 'BVN Verified Successfully'
      }

    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }




}
