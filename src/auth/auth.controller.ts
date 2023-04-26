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
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  // @ApiBody({ type: loginUserDto })
  async loginUser(@Request() req) {
    return this.authService.loginWithCredentials(req.user);
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
  async resetPassword(@Body() email: string, otp: number, password: string) {
    return this.authService.resetPassword(email, otp, password);
  }

  @Post('logout')
  logout(@Body() userInfo: loginUserDto) {
    /* TODO document why this method 'logout' is empty */
  }
}
