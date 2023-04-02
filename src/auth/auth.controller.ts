import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    UseGuards,
    Request
} from '@nestjs/common';
import { loginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';

import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    // @ApiBody({ type: loginUserDto })
    async loginUser(@Request() req) {
        return this.authService.loginWithCredentials(req.user);
    }

    @Post('forget-password')
    @ApiBody({ type: String })
    async forgotPassword(@Body("email") email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('verify-otp')
    @ApiBody({ type: String })
    async verifyOtp(@Body("otp") otp: number) {
        return this.authService.verifyForgetOTP(Number(otp));
    }



    @Post('reset-password')
    async resetPassword(@Body() email: string, otp: number, password: string) {
        return this.authService.resetPassword(email, otp, password);
    }

    @Post('logout')
    logout(@Body() userInfo: loginUserDto) { }
}


