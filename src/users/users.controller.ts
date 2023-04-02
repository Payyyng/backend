import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Put,
    Request,
    UseGuards, Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './dto/create-user.dto';
import { createAccountDto } from './dto/create-bank.dto'
import { verifyAccount } from './dto/verify-account.dto'
import { createPin } from './dto/create-pin.dto'
import { ApiBody, ApiProperty, ApiHeader, ApiResponseProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface createAccount {
    email: string,
    bvn: number
}

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Post('register')
    @ApiBody({ type: createUserDto })
    createUser(@Body() userInfo: createUserDto) {
        return this.userService.createUser(userInfo);
    }

    @Post('verify')
    @ApiBody({ type: verifyAccount })
    verifyUser(@Body() verifyAccount: verifyAccount) {
        console.log(verifyAccount.id, verifyAccount.otp, "THE DETAILS")
        return this.userService.verifyUser(verifyAccount.id, verifyAccount.otp);
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )
    @Post('create-pin')
    createPin(@Body() createPin: createPin) {
        return this.userService.createUserPin(createPin.id, createPin.pin);
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )

    @Post("verify-pin")
    verifyPin(@Body() createPin: createPin) {
        return this.userService.verifyTransactionPin(createPin.id, createPin.pin);
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )
    @Put('update')
    updateUserAccount(@Body() id: string, userInfo: any) {
        return this.userService.updateUserAccount(id, userInfo);
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )
    @Post('create-bank-account')
    @ApiBody({
        type: createAccountDto
    })

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )
    createBankAccount(@Body() email: string, bvn: number) {
        return this.userService.createBankAccount(email, bvn);
    }
}
