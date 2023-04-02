import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios'
import { Transaction, Prisma, } from '@prisma/client';
import { createBillDto } from './dto/create-bills.dto';
import randomize from 'randomatic'

const BASE_API_URL = "https://api.flutterwave.com/v3"
const SECRET_KEY = 'FLWSECK_TEST-10876e1c7827a5d99bc4bebfbd09a166-X'

interface transferDetails {
    id: any,
    account_number: number,
    account_bank: number,
    amount: number,
    narration: string,
    beneficiary_name: string
}

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) { }

    /**
     * @param data 
     * @access PUBLIC
     * @description This method is used to pay bills
     * @returns 
     */
    async payBills(data: createBillDto): Promise<any> {

        const { id, amount, type, customer, biller_name } = data;
        if (!id || !amount || !type || !customer) {
            throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST)
        }

        if (type == "AIRTIME" && amount > 5000) {
            throw new HttpException('Airtime Amount cannot be more than 5000', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const country = "NG"
        const reference = randomize('Aa', 10)

        const config = {
            'method': 'POST',
            'url': `${BASE_API_URL}/bills`,
            'headers': {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                country: country,
                customer: customer,
                amount: amount,
                recurrence: 'ONCE',
                type: type,
                biller_name: biller_name,
                reference: reference,
            }
        };

        const response = await axios(config)

        if (response.data.status !== "success") {
            throw new HttpException('Something Went Wrong', HttpStatus.BAD_REQUEST)
        }

        const transaction = await this.prisma.transaction.create({

            data: <any>{
                userId: id,
                amount: amount,
                type: type,
                customer: customer,
                reference: reference,
            }
        })

        //Verify The Transaction After 5 seconds
        setTimeout(async () => {
            const verifyTransaction = await this.verifyTransaction(reference)
            if (verifyTransaction.status == "success") {
                await this.prisma.transaction.update({
                    where: {
                        id
                    },
                    data: <any>{
                        status: "completed"
                    }
                })
            } else {
                await this.prisma.transaction.update({
                    where: {
                        id
                    },
                    data: <any>{
                        status: "failed"
                    }
                })
            }
        }, 5000)

        return response.data
    }

    /**
    * @param reference
    * @access PUBLIC
    * @description This function is used to verify transaction
    * @returns 
    */

    async verifyTransaction(reference: string) {

        if (!reference) {
            throw new HttpException('Transaction Reference is required', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const config = {
            'method': 'POST',
            'url': `${BASE_API_URL}/bills/${reference}`,
            'headers': {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },

        };

        const response = await axios(config)

        return response.data
    }


    /**
    * @param transferDetails
    * @access PUBLIC
    * @description This function is used to Transfer Money To Bank Account
    * @returns 
    */


    async bankTransfer(transferInfo: transferDetails) {
        const { id, account_bank, account_number, amount, narration, beneficiary_name } = transferInfo
        if (!id || !account_bank || !account_number || !amount) {
            throw new HttpException('Ensure all transfer information are provided.', HttpStatus.BAD_REQUEST)
        }


        const reference = randomize('Aa', 10)

        const config = {
            'method': 'POST',
            'url': `${BASE_API_URL}/transfers`,
            'headers': {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                account_bank: account_bank,
                account_number: account_number,
                amount: amount,
                currency: "NGN",
                reference: reference,
                narration: narration,
            }
        }

        const response = await axios(config)

        if (response.data.status !== "success") {
            throw new HttpException('Something Went Wrong. Please try again', HttpStatus.BAD_REQUEST)
        }

        await this.prisma.bank.create({
            data: <any>{
                beneficiary_name: beneficiary_name,
                account_number: account_number,
                account_bank: account_bank,
                amount: amount,
                reference: reference,
                transactionId: id,
                narration: narration,
                ststus: "COMPLETED"
            }
        })

        return {
            status: "success",
            transaction: response.data
        }
    }

}

