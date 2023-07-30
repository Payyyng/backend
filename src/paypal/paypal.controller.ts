import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CreatePaypalDto } from './dto/create-paypal.dto';
import { UpdatePaypalDto } from './dto/update-paypal.dto';
import { MakePayment } from './dto/make-a-payment.dto';
import { BuyPaypalDTO } from './dto/buy-paypal-dto';
import { SellPaypalDTO } from './dto/sell-paypal-dto';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post()
  create(@Body() createPaypalDto: CreatePaypalDto) {
    return this.paypalService.createPaypal(createPaypalDto);
  }

  @Get()
  findAll() {
    return this.paypalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paypalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaypalDto: UpdatePaypalDto) {
    return this.paypalService.update(+id, updatePaypalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paypalService.remove(+id);
  }

  @Post("make-a-payment")
  MakeAPayment(@Body() makeAPayment: MakePayment) {
    return this.paypalService.makeApayment(makeAPayment);
  }

  @Post("buy-paypal")
  BuyPaypal(@Body() buyPaypal: BuyPaypalDTO) {
    return this.paypalService.buyPaypal(buyPaypal);
  }

  @Post("sell-paypal")
  SellPaypal(@Body() sellPaypal: SellPaypalDTO) {
    return this.paypalService.sellPaypal(sellPaypal);
  }

  @Post("sell-wise")
  wiseDeposit(@Body() deposit: MakePayment) {
    return this.paypalService.wiseDeposit(deposit);
  }

}
