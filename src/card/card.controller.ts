import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CardService } from './card.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('card')
export class CardController {
    constructor(private readonly cardService: CardService) {}

    @Post('create')
    @ApiBody({ type: CreateCardDto })
    create(@Body() createCardDto: CreateCardDto) {
        return this.cardService.create(createCardDto);
    }
}
