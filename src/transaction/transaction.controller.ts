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
    @Get('verify-trasanction')
    @ApiBody({   type: VerifyBillDTO }
    )
    verifyTransaction(@Body() reference: string) {
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
}
