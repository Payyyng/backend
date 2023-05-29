import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import Flutterwave from 'flutterwave-node-v3';

const BASE_API_URL = "https://api.flutterwave.com/v3"
const SECRET_KEY = 'FLWSECK-27df351a5a7cf733af09c7bd42a77326-1884b5daf27vt-X'

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, SECRET_KEY);



@Injectable()
export class CardService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) {}


    async create(createCardDto: CreateCardDto) {

        const {id,email,date_of_birth, gender, currency, amount, first_name, last_name, title, phone,  } = createCardDto

        const payload = {
            amount: amount,
            email: email,
            first_name: first_name,
            last_name: last_name,
            title: title,
            phone: phone,
            currency: currency,
            gender: gender,
            date_of_birth: date_of_birth,
            tx_ref: "tx_ref_" + Math.floor(Math.random() * 10000),
        }

        try {
            const response = await flw.VirtualCards.create(payload);
            console.log(response)

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
    
}
