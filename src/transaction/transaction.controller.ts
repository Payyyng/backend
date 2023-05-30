import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Put,
    UseGuards
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { createBillDto, } from './dto/create-bills.dto';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VerifyBillDTO } from './dto/verify-bill-dto';
import { BankTransferDto } from './dto/bank-transfer.dto';
import { ValidateBillDto } from './dto/validate-bill-dto';
import { VerifyAccountDTO } from './dto/verify-account-dto';
import { PayyngTransferDto } from './dto/payyng-transfer.dto';

@Controller('transaction')
export class TransactionController {

    constructor(private transactionService: TransactionService) { }

    // @UseGuards(JwtAuthGuard)
    @Post('pay-bill')
    @ApiBody({ type: createBillDto })
    createBill(@Body() billInfo: createBillDto) {
        return this.transactionService.payBills(billInfo);
    }

    @UseGuards(JwtAuthGuard)
    @Get('verify/:reference')
    @ApiBody({   type: VerifyBillDTO }
    )
    verifyTransaction(@Param() reference: string) {
        return this.transactionService.verifyTransaction(reference);
    }

    @UseGuards(JwtAuthGuard)
    @Post('bank-transfer')
    @ApiBody({ type: BankTransferDto })
    bankTransfer(@Body() transferDetails: any) {
        return this.transactionService.bankTransfer(transferDetails);
    }



    @Post('verify-bill')
    @ApiBody({ type: ValidateBillDto })
    verifyBill(@Body() {item_code, customer, code}: ValidateBillDto) {
        return this.transactionService.validateBill(customer, item_code, code);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getTransaction(@Param('id') id: string) {
        return this.transactionService.getTransaction(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-account-number')
    @ApiBody({ type: VerifyAccountDTO })
    verifyAccount(@Body() {account_number, account_bank}: any) {
        return this.transactionService.verifyAccountNumber({account_number, account_bank});
    }

    @UseGuards(JwtAuthGuard)
    @Get('constants')
    getAdminConstants() {
        return this.transactionService.getAdminConstants(); 
    }

    @UseGuards(JwtAuthGuard)
    @Post('payyng-transfer')
    transferToPayyngUser(@Body( ) { id, userName, amount, narration }:PayyngTransferDto) {
        return this.transactionService.tranferToPayyngAccount({ id, userName, amount, narration }); 
    }



    
    
}
