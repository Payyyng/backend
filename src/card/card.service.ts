import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const BASE_API_URL = "https://api.flutterwave.com/v3"
const SECRET_KEY = 'FLWSECK-27df351a5a7cf733af09c7bd42a77326-1884b5daf27vt-X'




@Injectable()
export class CardService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) {}


    async create(createCardDto: CreateCardDto) {

        const {email,date_of_birth, gender, currency, amount, first_name, last_name,title, phone,  } = createCardDto

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
            

        } catch (err) {
            console.log(err)
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return
    }
    
}
