import {
    Controller,
    Post,
    Body,
    Get,
    Param,
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
import { ExchangeDTO } from './dto/exchange-currency.dto';
import { SmeDataDTO } from './dto/sme-data.dto';
import { UpdateTransaction } from './dto/update-transaction.dto';
import { EducationDTO } from './dto/education-transaction.dto';

@Controller('transaction')
export class TransactionController {

    constructor(private transactionService: TransactionService) { }

    @UseGuards(JwtAuthGuard)
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
    @Get('user/:id')
    getUserTransaction(@Param('id') id: string) {
        return this.transactionService.getUserTransactions(id);
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
    transferToPayyngUser(@Body( ) { id, userName, amount, narration, currency }:PayyngTransferDto) {
        return this.transactionService.tranferToPayyngAccount({ id, userName, amount, narration, currency }); 
    }

    @UseGuards(JwtAuthGuard)
    @Post('exchange')
    exchangeCurrency(@Body( ) { id, newAmount, newCurrency, exchangeCurrency, exchangeAmount }:ExchangeDTO) {
        return this.transactionService.exchangeCurrency({ id, newAmount, newCurrency, exchangeCurrency, exchangeAmount }); 
    }

    @UseGuards(JwtAuthGuard)
    @Post('sme-data')
    smeData(@Body() {network_id, phone, plan_id, id, amount}:SmeDataDTO) {
        return this.transactionService.smeData({network_id, phone, plan_id, id, amount}); 
    }

    @UseGuards(JwtAuthGuard)
    @Post('education')
    educationPin(@Body() educationDto: EducationDTO) {
        return this.transactionService.educational(educationDto); 
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    updateTransaction(@Body() {id, status}:UpdateTransaction) {
        return this.transactionService.updateTransaction({id, status}); 
    }
}
