import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios'
import { Transaction, Prisma, } from '@prisma/client';
import { createBillDto } from './dto/create-bills.dto';
import randomize from 'randomatic'
import Flutterwave from 'flutterwave-node-v3';
import { MailService } from 'src/mail/mail.service';


const BASE_API_URL = "https://api.flutterwave.com/v3"
const SECRET_KEY = 'FLWSECK-27df351a5a7cf733af09c7bd42a77326-1884b5daf27vt-X'

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, SECRET_KEY);

interface TransferDetails {
    id: any,
    account_number: number,
    account_bank: number,
    amount: number,
    narration: string,
    beneficiary_name: string
    bank_name: string
}

interface AccountDetails {
    account_number: string,
    account_bank: string
}

@Injectable()
export class TransactionService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

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

        if (type == "AIRTIME" && amount > 10000 || type == "AIRTIME" && amount < 10) {
            throw new HttpException('Airtime Amount cannot be less than 10 or more than 10000', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const country = "NG"
        const reference = randomize('Aa', 10)

        //Find the User First 

        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        try {
            const payload = {
                country: country,
                customer: customer,
                amount: amount,
                recurrence: "ONCE",
                type: type,
                reference: reference,
            }

            const response = await flw.Bills.create_bill(payload);

            if (response.status === "success") {
                // Save the transaction in the database
                const transaction = await this.prisma.transaction.create({
                    data: {
                        amount: amount,
                        type: type,
                        billerName: biller_name,
                        currency: 'NG',
                        customer: customer,
                        reference: reference,
                        status: "Completed",
                        user: {
                            connect: { id: id },
                        },
                    },
                });

                // Send transaction notification email
                this.mailService.sendTransactionNotificationEmail(
                    user.email,
                    reference,
                    type,
                    customer,
                    user?.firstName,
                    "success",
                    amount,
                    biller_name
                );

                return {
                    status: "success",
                    message: "Transaction Successful",
                    data: transaction,
                };
            } else {
                throw new HttpException(response, HttpStatus.EXPECTATION_FAILED);
            }

        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    /**
    * @param reference
    * @access PUBLIC
    * @description This function is used to verify transaction
    * @returns 
    */

    async verifyTransaction(reference) {
        console.log(reference, "ENTERED")

        if (!reference) {
            throw new HttpException('Transaction Reference is required', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        try {
            const payload = {
                reference: reference,
            }
            const response = await flw.Bills.fetch_status(payload)

            console.log(response, "THE RESPONSE HERE")
            return {
                status: "success",
                message: response.message

            }
        } catch (error) {
            throw new HttpException('Something went wrong verifying this transaction', HttpStatus.SERVICE_UNAVAILABLE)
        }
    }


    /**
    * @body transferDetails
    * @access PUBLIC
    * @description This function is used to Transfer Money To Bank Account
    * @returns 
    */
    async bankTransfer(transferInfo: TransferDetails) {
        const { id, account_bank, bank_name, account_number, amount, narration, beneficiary_name } = transferInfo
        if (!id || !account_bank || !bank_name || !account_number || !amount) {
            throw new HttpException('Ensure all transfer information are provided.', HttpStatus.BAD_REQUEST)
        }

        if (amount < 100) {
            throw new HttpException('Ensure amount is greater than 100', HttpStatus.BAD_REQUEST)
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        const reference = randomize('Aa', 10)

        try {
            const payload = {
                account_bank: account_bank,
                account_number: account_number,
                amount: amount,
                currency: "NGN",
                reference: reference,
                narration: narration,
            }

            const response = await flw.Transfer.initiate(payload)

            if (response.status !== "success") {
                throw new HttpException(response, HttpStatus.BAD_REQUEST)
            }

            try {
                const bankTransfer = await this.prisma.bank.create({
                    data: <any>{
                        beneficiary_name: beneficiary_name,
                        account_number: account_number,
                        account_bank: account_bank,
                        amount: amount,
                        reference: reference,
                        transactionId: id,
                        bank_name: bank_name,
                        narration: narration,
                        status: "COMPLETED",
                        userId: id
                    }
                })

                //Send Notification Email
                await this.mailService.sendBankTransferNotificationEmail(
                    user.email,
                    user.firstName,
                    amount
                )

                return {
                    status: "success",
                    transfer: bankTransfer
                }
            } catch (err) {
                throw new HttpException(err, HttpStatus.BAD_REQUEST)
            }
            // Send transaction notification email



        } catch (err) {
            console.log(err, "THE ERROR")
            throw new HttpException("Something Went Wrong. Please try again", HttpStatus.BAD_REQUEST)
        }
    }


    /**
    * @body accountDetails
    * @access PUBLIC
    * @description This function is used to Transfer Money To Bank Account
    * @returns 
    */

    async verifyAccountNumber(accountDetails: AccountDetails) {
        const account_number = accountDetails.account_number
        const account_bank = accountDetails.account_bank

        if (!account_number || !account_bank) {
            throw new HttpException('Ensure all transfer information are provided.', HttpStatus.BAD_REQUEST)
        }

        const config = {
            'method': 'POST',
            'url': `${BASE_API_URL}/accounts/resolve`,
            'headers': {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },

            data: {
                account_number, account_bank
            }
        }

        // const {} = await axios(config)

        try {
            const { data } = await axios(config)
            return data

        } catch (error) {

        }
    }



    /**
* @body Validate Bill
* @access PUBLIC
* @description This function is used to validate bill
* @returns 
*/

    async validateBill(customer: string, item_code: string, code: string) {
        if (!customer || !item_code || !code) {
            throw new HttpException('Ensure all information are provided.', HttpStatus.BAD_REQUEST)
        }
        const payload = {
            customer: customer,
            item_code: item_code,
            code: code
        }
        try {
            const response = await flw.Bills.validate(payload)
            return response
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}