import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositDTO } from './dto/deposit.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import FlutterwaveEvents from 'flutterwave-events'

// const flutterwaveEvents = new FlutterwaveEvents(process.env.FLW_SECRET_KEY);
// const webHook = flutterwaveEvents.webhook()

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  findUserAccount(@Param('id') id: string) {    
    return this.accountsService.findAccountByUserId(id);
  }

  @Put('update')
  update(@Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.adminUpdateUserAccounBalance(updateAccountDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("deposit")
  deposit(@Body() deposit: DepositDTO) {
    return this.accountsService.accountDeposit(deposit)
  }

  @Post("webhook")
  accountWebHook(@Body() webHook: any) {
    return this.accountsService.webhookHandler(webHook)
  }

}
