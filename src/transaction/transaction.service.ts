import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios'
import { Transaction, Prisma, } from '@prisma/client';
import { createBillDto } from './dto/create-bills.dto';
import randomize from 'randomatic'
import Flutterwave from 'flutterwave-node-v3';
import { MailService } from 'src/mail/mail.service';


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

export interface AccountDetails {
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
            // console.log(response, "THE RESPONSE")

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

                if (transaction) {
                    // get what's already in NGN Balance and remount the amount from it 
                    const account = await this.prisma.account.findFirst({
                        where: {
                            userId: id,
                        },
                    });

                    if (account) {
                        const newBalance = account.NGN - amount;
                        await this.prisma.account.update({
                            where: {
                                id: account.id,
                            },
                            data: {
                                NGN: newBalance,
                            },
                        });
                    }
                }

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
            throw error
        }
    }
    /**
    * @param reference
    * @access PUBLIC
    * @description This function is used to verify transaction
    * @returns 
    */

    async verifyTransaction(ref) {
        console.log(ref, "ENTERED")
        const { reference } = ref

        console.log(reference, "THE REFERENCE")

        if (!reference) {
            throw new HttpException('Transaction Reference is required', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        try {
            const payload = ref

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

        //Get The Current Account Balance of the User 

        const accountBalance = await this.prisma.account.findFirst({
            where: {
                userId: id
            }
        })

        if (!accountBalance) {
            throw new HttpException('Something went wrong. Please try again', HttpStatus.BAD_REQUEST)
        }

        if (accountBalance.NGN < amount) {
            throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
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

                const account = await this.prisma.account.findFirst({
                    where: {
                        userId: id,
                    },
                });

                if (account) {
                    const newBalance = account.NGN - amount;
                    await this.prisma.account.update({
                        where: {
                            id: account.id,
                        },
                        data: {
                            NGN: newBalance,
                        },
                    });
                }
                const bankTransfer = await this.prisma.bank.create({
                    data: {
                        beneficiary_name: beneficiary_name,
                        account_number: account_number.toString(),
                        account_bank: account_bank.toString(),
                        amount: amount,
                        reference: reference,
                        transactionId: id,
                        bank_name: bank_name,
                        narration: narration,
                        status: "COMPLETED",
                        userId: id
                    }
                })

                await this.prisma.transaction.create({
                    data: <any>{
                        amount: amount,
                        type: "BANK TRANSFER",
                        billerName: bank_name,
                        currency: 'NG',
                        customer: account_number.toString(),
                        reference: reference,
                        status: "Completed",
                        narration: narration,
                        bank_name: bank_name,
                        user: {
                            connect: { id: id },
                        }
                    }
                })

                //Send Notification Email
                await this.mailService.sendBankTransferNotificationEmail(
                    user.email,
                    user.firstName,
                    amount,
                    bank_name,
                    account_number,
                    beneficiary_name,
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

        console.log(accountDetails, "DETAILS WEY ENTER")

        if (!account_number || !account_bank) {
            throw new HttpException('Ensure all transfer information are provided.', HttpStatus.BAD_REQUEST)
        }

        console.log(account_bank, "THE BANK ACCOUNT")

        const payload = {
            account_number: account_number,
            account_bank: account_bank
        }

        try {
            const response = await flw.Misc.verify_Account(payload)
            if (!response) {
                throw new HttpException('Something went wrong verifying this account', HttpStatus.BAD_REQUEST)
            }

            return response

        } catch (error) {
            console.log(error)
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

    /**
* @param id
* @access PUBLIC
* @description This function is used to Get A Single Transaction From Database
* @returns 
*/

    async getTransaction(id: string) {

        if (!id) {
            throw new HttpException('Transaction Id is required', HttpStatus.BAD_REQUEST)
        }
        return {
            status: 'success',
        }
        // try {
        //     const transaction = await this.prisma.transaction.findUnique({
        //         where: {
        //             id: id
        //         }, 
        //     })

        //     if (!transaction) {
        //         throw new HttpException('Transaction Not Found', HttpStatus.NOT_FOUND)
        //     }

        //     return transaction
        // } catch (err){
        //     throw err
        // }
    }

    async getAdminConstants() {
        try {
            return await this.prisma.admin.findMany({
                select: {
                    id: true,
                    exchangeNGN: true,
                    exchangeUSD: true,
                    exchangeEUR: true,
                    exchangeGPB: true,
                    exchangeFee: true,
                }
            })
        } catch (err) {
            return 'Something went wrong. Please try again'
        }
    }

    async tranferToPayyngAccount({ id, userName, amount, narration, currency }) {

        if (!amount || !id || !userName || !currency) {
            throw new HttpException('Ensure All Values Are Provided', HttpStatus.BAD_REQUEST)
        }

        try {
            const senderAccount = await this.prisma.account.findFirst({
                where: {
                    userId: id
                }
            })

            if (!senderAccount) {
                throw new HttpException('Sender Account Not Found', HttpStatus.NOT_FOUND)
            }

            const receiver = await this.prisma.user.findFirst({
                where: {
                    userName: userName
                }
            })

            if (!receiver) {
                throw new HttpException(`Receiver with the Username ${userName} doesn't exist`, HttpStatus.NOT_FOUND)
            }

            //IF THE CURRENCY BEING SENT IS NGN

            if (currency === "NGN") {
                if (senderAccount.NGN < amount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = senderAccount.NGN - amount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const updatedSenderAccount = await this.prisma.account.update({
                    where: {
                        id: senderAccount.id
                    },
                    data: {
                        NGN: newBalance
                    }
                })

                if (!updatedSenderAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }

                const receiverAccount = await this.prisma.account.findFirst({
                    where: {
                        userId: receiver.id
                    }
                })

                if (!receiverAccount) {
                    throw new HttpException('Receiver Account Not Found', HttpStatus.NOT_FOUND)
                }

                const newReceiverBalance = receiverAccount.NGN + amount

                const updatedReceiverAccount = await this.prisma.account.update({
                    where: {
                        id: receiverAccount.id
                    },
                    data: {
                        NGN: newReceiverBalance
                    }
                })

                if (!updatedReceiverAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }



            }

            //IF THE CURRENCY IS USD

            if (currency === "USD") {
                if (senderAccount.USD < amount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = senderAccount.USD - amount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const updatedSenderAccount = await this.prisma.account.update({
                    where: {
                        id: senderAccount.id
                    },
                    data: {
                        USD: newBalance
                    }
                })

                if (!updatedSenderAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }

                const receiverAccount = await this.prisma.account.findFirst({
                    where: {
                        userId: receiver.id
                    }
                })

                if (!receiverAccount) {
                    throw new HttpException('Receiver Account Not Found', HttpStatus.NOT_FOUND)
                }

                const newReceiverBalance = receiverAccount.USD + amount

                const updatedReceiverAccount = await this.prisma.account.update({
                    where: {
                        id: receiverAccount.id
                    },
                    data: {
                        USD: newReceiverBalance
                    }
                })

                if (!updatedReceiverAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }
            }

            //IF THE CURRENCY IS EUR

            if (currency === "EUR") {
                if (senderAccount.EUR < amount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }
                const newBalance = senderAccount.EUR - amount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const updatedSenderAccount = await this.prisma.account.update({
                    where: {
                        id: senderAccount.id
                    },
                    data: {
                        EUR: newBalance
                    }
                })

                if (!updatedSenderAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }

                const receiverAccount = await this.prisma.account.findFirst({
                    where: {
                        userId: receiver.id
                    }
                })

                if (!receiverAccount) {
                    throw new HttpException('Receiver Account Not Found', HttpStatus.NOT_FOUND)
                }

                const newReceiverBalance = receiverAccount.EUR + amount

                const updatedReceiverAccount = await this.prisma.account.update({
                    where: {
                        id: receiverAccount.id
                    },
                    data: {
                        EUR: newReceiverBalance
                    }
                })

                if (!updatedReceiverAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }
            }

            //IF THE CURRENCY IS GBP

            if (currency === "GBP") {
                if (senderAccount.GPB < amount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }
                const newBalance = senderAccount.GPB - amount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const updatedSenderAccount = await this.prisma.account.update({
                    where: {
                        id: senderAccount.id
                    },
                    data: {
                        GPB: newBalance
                    }
                })

                if (!updatedSenderAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }

                const receiverAccount = await this.prisma.account.findFirst({
                    where: {
                        userId: receiver.id
                    }
                })

                if (!receiverAccount) {
                    throw new HttpException('Receiver Account Not Found', HttpStatus.NOT_FOUND)
                }

                const newReceiverBalance = receiverAccount.EUR + amount

                const updatedReceiverAccount = await this.prisma.account.update({
                    where: {
                        id: receiverAccount.id
                    },
                    data: {
                        GPB: newReceiverBalance
                    }
                })

                if (!updatedReceiverAccount) {
                    throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
                }
            }


            //Save To Transactions In Database
            const transaction = await this.prisma.transaction.create({
                data: <any>{
                    amount: amount,
                    type: "TRANSFER",
                    billerName: receiver.userName,
                    currency: currency,
                    bank_name: `PAYYNG - ${receiver.userName.toUpperCase()} `,
                    customer: receiver.firstName + " " + receiver.lastName,
                    reference: randomize('Aa', 10),
                    status: "Completed",
                    narration: narration,
                    user: {
                        connect: { id: id },
                    }
                }
            })

            if (!transaction) {
                throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE)
            }

            //Send Notification Email
            // await this.mailService.sendTransactionNotificationEmail()

            await this.mailService.sendPayyngTransferNotificationEmail(
                receiver.email,
                receiver.firstName,
                amount,
                currency,
                narration,
            )

            return {
                status: 'success',
                message: 'Transfer Successful',
                transfer: transaction
            }
        } catch (err) {
            throw err
        }
    }

    /**
* @body Deposite With Paypal
* @access PUBLIC
* @description This function is used to validate bill
* @returns 
*/

    async depositWithPaypal(id: string, amount: number) {

        if (!id || !amount) {
            throw new HttpException('Ensure all fields are provided', HttpStatus.BAD_REQUEST)
        }

        try {



        } catch (err) {
            throw err
        }


        return
    }





}