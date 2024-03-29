import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import Flutterwave from 'flutterwave-node-v3';
import { CreateUSDCardDto } from './dto/create-usd-card';

const SECRET_KEY = 'FLWSECK-27df351a5a7cf733af09c7bd42a77326-1884b5daf27vt-X'

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, SECRET_KEY);



@Injectable()
export class CardService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) {}


    async create(createCardDto: CreateCardDto) {

        const {id, date_of_birth, currency, amount, title,} = createCardDto

        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user){
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const payload = {
            amount: amount,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            title: title,
            phone: user.phone,
            currency: currency,
            gender: 'Mr',
            date_of_birth: date_of_birth,
            tx_ref: "tx_ref_" + Math.floor(Math.random() * 10000),
        }

        try {
            const response = await flw.VirtualCards.create(payload);
            if (response) {
                const { card_pan, amount, cvv, card_type, expiry, name_on_card, zip_code, state, address, city,  } = response.data
                const card = await this.prisma.card.create({
                    data: <any>{
                        cardNo: card_pan,
                        cardName: name_on_card,
                        cvv: cvv,
                        expiration: expiry,
                        state: state,
                        address: address,
                        city: city,
                        cardType: card_type,
                        zipCode: zip_code,
                        amount: amount,
                        user: {
                            connect: {
                                id: id
                            }
                        }
                    }
                })
                return card
            }

        } catch (err) {
        throw err
        }
    }


    async createDollarCard (createUSDCardDto: CreateUSDCardDto) {

        const {id, amount, tradeAmount} = createUSDCardDto

        if (!id || !amount || !tradeAmount){
            throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user){
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        //Create the Card
        await this.prisma.card.create({
            data: <any>{
                amount: amount,
                status: "PENDING"
            }
        })

        //Create the Transaction

    await this.prisma.transaction.create({
        data: {
            amount: tradeAmount,
            status: "PENDING",
            user: {
                connect: {
                    id: id
                }
            }
        }
    })


        return
    }
}
