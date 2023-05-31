import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Put,
    Request,
    UseGuards, Req, HttpException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './dto/create-user.dto';
import { createAccountDto } from './dto/create-bank.dto'
import { verifyAccount } from './dto/verify-account.dto'
import { createPin } from './dto/create-pin.dto'
import { ApiBody, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateTransactionPinDto } from './dto/update_user_pin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BVNverificationDto } from './dto/bvn-verification-dto';

interface createAccount {
    email: string,
    bvn: number
}

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Post('register')
    @ApiBody({ type: createUserDto })
    createUser(@Body() {firstName, lastName, email, phone, password}: createUserDto) {
            return this.userService.createUser({firstName, lastName, email, phone, password});
    }

    @Post('verify')
    @ApiBody({ type: verifyAccount })
    verifyUser(@Body() verifyAccount: verifyAccount) {
        return this.userService.verifyUser(verifyAccount.id, verifyAccount.otp);
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        } 
    )
    @ApiBody({type: UpdateTransactionPinDto})
    @Post('update-pin')
    updatePin(@Body() {id, new_pin, current_pin}: UpdateTransactionPinDto) {
        return this.userService.updateTransactionPin({id, new_pin, current_pin});
    }


    // @UseGuards(JwtAuthGuard)
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
    @Put('update-address/:id')
    @ApiBody({ type: UpdateAddressDto })
    updateAddress(@Param('id') id: string, @Body() {address, city,  state, lga}: any) {
        return this.userService.updateAddress({id, address, city, state, lga});
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader(
        {
            name: 'Authorization',
            description: "Bearer <token>"
        }
    )
    // @ApiBody()
    @Patch('update-password/:id')
    updatePassword(@Param('id') id: string, @Body() {password, new_password}: any) {
        return this.userService.updatePassword({id, password, new_password});
    }

    @UseGuards(JwtAuthGuard)
    @ApiHeader({name: 'Authorization',description: "Bearer <token>"})
    @ApiBody({type:UpdateUserDto})
    @Put('update')
    updateUserAccount(@Body() id: string, userInfo: any) {
        return this.userService.updateUserAccount(id, userInfo);
    }

    // @UseGuards(JwtAuthGuard)
    @ApiHeader({name: 'Authorization',description: "Bearer <token>"})
    @Get(':id')
    getUserAccount(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }

    @Post('bvn-verify')
    @ApiBody({type:BVNverificationDto})
    verifyUserBvn(@Body() {id, bvn}:any){
        return this.userService.verifyUserBvn(id, bvn);
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
    createBankAccount(@Body() {email, bvn}: createAccountDto) {
        return this.userService.createBankAccount(email, bvn);
    }
}




