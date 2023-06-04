import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { loginUserDto } from './dto/login-user.dto';
import { MailService } from 'src/mail/mail.service';
import randomize from 'randomatic';
import { hash, compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  async validateUser(loginInfo: loginUserDto): Promise<any> {
    const { email, password } = loginInfo;

    if (!email || !password) {
      throw new HttpException(
        'All fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.findUserByEmail(email.toLowerCase());
    if (!user) {
      throw new HttpException(
        'Invalid Login Credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid Login Credentials Password',
        HttpStatus.UNAUTHORIZED,
      );
    }


    await this.mailService.sendLoginNotificationMail(
      user.email,
      user.firstName,
    );

    //Add the transaction and Bank details of user to the response 
    return {
      ...user,
    }
  }

  async loginWithCredentials(user: any) {
    //remove password and pin from the userInfo
    const { password: _,  ...result } = user;


    return {
      access_token: this.jwtService.sign(user.id, {
        secret: `${process.env.JWT_SECRET}`,
      }),
      ...result
    };
  }

  async forgotPassword(email: string) {

    if (!email) {
      throw new BadRequestException(
        'Please provide an email address',
      )
  }

    try {
      const user = await this.usersService.findUserByEmail(email);
      if (!user) {
        throw new HttpException(
          "User Doesn't Exist",
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      // Generate OTP
    const otp = randomize('0', 6);

    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        otp: Number(otp),
      },
    });

    // Send the OTP to the user's email
    await this.mailService.sendPasswordResetMail(email, user.firstName, otp);

    return {
      status: 'success',
      message: 'We have sent a verification code to your email. You will received a verification email shortly if the account exist.',
    };

    } catch (err) {
      throw new BadRequestException(
        err,
      )
    }



    
  }

  async verifyForgetOTP(otp: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        otp
      },
    });

    if (!user) {
      throw new HttpException(
        'Invalid Verification Code',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user) {
        throw new HttpException(
            'Invalid Verification Code',
            HttpStatus.UNAUTHORIZED,
        );
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otp: null,
      },
    });

    //Sign the User Login Authentication 

    return {
      status: 'success',
      message: 'Verification Successful',
      user: {
        access_token: this.jwtService.sign(user.id, {
            secret: `${process.env.JWT_SECRET}`,
          }),
        ...user,
      },
    };
  }

  async resetPassword(id: string, otp: number, password: string) {
    if (!id || !otp || !password) {
      throw new HttpException(
        'All fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.findUserById(id);

    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    if (user.otp !== otp) {
      throw new HttpException(
        'Invalid Verification Code',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // hash password if user doesn't exist
    const hashedPassword = await hash(password, 10);
    // Update the user with the new password
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      status: 'success',
      message: 'Password Reset Successfully. Login To Continue Using Payyng',
    };
  }

  async sendOTP (id:string) {
    console.log(id, "ID ENTERED")
    
    if (!id) {
      throw new HttpException(
        'Account ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const user = await this.usersService.findUserById(id);

      if (!user) {
        throw new HttpException(
          "User Doesn't Exist",
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      // Generate OTP

      const otp = randomize('0', 6);

      // Update the user with the new OTP

      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          otp: Number(otp),
        },
      });
  
      // Send the OTP to the user's email
      await this.mailService.sendVerificationMail(user.email, user.firstName, otp);
  
      return {
        status: 'success',
        message: 'We have sent a verification code to your email. You will received a verification email shortly if the account exist.',
      };
    } catch (err) {
      throw err
    }

  }
}
