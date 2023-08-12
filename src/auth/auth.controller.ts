import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { loginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';

import { ApiBody,} from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { ResetPasswordDto } from './dto/reset-password-dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: loginUserDto })
  async loginUser(@Request() req) {
    return this.authService.loginWithCredentials(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('admin/login')
  @ApiBody({ type: loginUserDto })
  async adminLogin(@Body() loginDetails: loginUserDto) {
    return this.authService.adminLogin(loginDetails)
  }

  @Post('forget-password')
  @ApiBody({ schema: {
    type: 'string',
    format: 'email',
    properties:{
        email: {
            type: 'string',
            format: 'email',
        }
    }
  }})
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-otp')
  @ApiBody({ type: String })
  async verifyOtp(@Body('otp') otp: number) {
    return this.authService.verifyForgetOTP(Number(otp),);
  }

  @Post('reset-password')
  @ApiBody({type: ResetPasswordDto})
  async resetPassword(@Body() {email, otp, password}:ResetPasswordDto)  {
    return this.authService.resetPassword({email, otp, password});
  }

  @Post('send-otp')
  @ApiBody({ type: String })
  async sendOtp (@Body() {id}: any) {
    return this.authService.sendOTP(id);
  }

  @Post('logout')
  logout(@Body() userInfo: loginUserDto) {
    /* TODO document why this method 'logout' is empty */
  }
}
