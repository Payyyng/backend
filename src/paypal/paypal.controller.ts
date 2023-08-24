import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CreatePaypalDto } from './dto/create-paypal.dto';
import { UpdatePaypalDto } from './dto/update-paypal.dto';
import { MakePayment } from './dto/make-a-payment.dto';
import { BuyPaypalDTO } from './dto/buy-paypal-dto';
import { SellPaypalDTO } from './dto/sell-paypal-dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPaypalDto: CreatePaypalDto) {
    return this.paypalService.createPaypal(createPaypalDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paypalService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paypalService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaypalDto: UpdatePaypalDto) {
    return this.paypalService.update(+id, updatePaypalDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paypalService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("make-a-payment")
  MakeAPayment(@Body() makeAPayment: MakePayment) {
    return this.paypalService.makeApayment(makeAPayment);
  }

  @UseGuards(JwtAuthGuard)
  @Post("buy-paypal")
  BuyPaypal(@Body() buyPaypal: BuyPaypalDTO) {
    return this.paypalService.buyPaypal(buyPaypal);
  }


  @UseGuards(JwtAuthGuard)
  @Post("sell-paypal")
  SellPaypal(@Body() sellPaypal: SellPaypalDTO) {
    return this.paypalService.sellPaypal(sellPaypal);
  }

  @UseGuards(JwtAuthGuard)
  @Post("sell-wise")
  wiseDeposit(@Body() deposit: MakePayment) {
    return this.paypalService.wiseDeposit(deposit);
  }
  
}
