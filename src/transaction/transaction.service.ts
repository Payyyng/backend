import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction, Prisma, } from '@prisma/client';
import { createBillDto } from './dto/create-bills.dto';
import randomize from 'randomatic'
import Flutterwave from 'flutterwave-node-v3';
import { MailService } from 'src/mail/mail.service';
import { ExchangeDTO } from './dto/exchange-currency.dto';


const SECRET_KEY = 'FLWSECK-27df351a5a7cf733af09c7bd42a77326-1884b5daf27vt-X'

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, SECRET_KEY);

const reference = randomize('Aa', 10)

interface TransferDetails {
    id: any,
    account_number: number,
    account_bank: number,
    amount: number,
    narration: string,
    beneficiary_name: string
    bank_name: string,
    fee: number
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
        const { id, amount, type, customer, biller_name, fee } = data;
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
                        fee: fee,
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
                        const newBalance = account.NGN - amount - fee;
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
        const { id, account_bank, bank_name, account_number, amount, narration, beneficiary_name, fee } = transferInfo
        if (!id || !account_bank || !bank_name || !account_number || !amount) {
            throw new HttpException('Ensure all transfer information are provided.', HttpStatus.BAD_REQUEST)
        }

        //Get The Current Account Balance of the User 

        const userDetails = await this.prisma.user.findUnique({
            where: {
               id
            }
        })

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
                narration: `${userDetails.firstName } ${userDetails.firstName } -${narration} `,
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
                    const newBalance = account.NGN - amount - fee;
                    await this.prisma.account.update({
                        where: {
                            id: account.id,
                        },
                        data: {
                            NGN: Number(newBalance),
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
                        amount: amount + fee,
                        type: "BANK TRANSFER",
                        billerName: bank_name,
                        currency: 'NG',
                        customer: account_number.toString(),
                        reference: reference,
                        status: "Completed",
                        narration: narration,
                        bank_name: bank_name,
                        fee: fee,
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
                    exchangeGBP: true,
                    exchangeFee: true,
                }
            })
        } catch (err) {
            return 'Something went wrong. Please try again'
        }
    }

    async tranferToPayyngAccount({ id, userName, amount, narration, currency }) {
        if (!amount || !id || !userName || !currency) {
          throw new HttpException('Ensure All Values Are Provided', HttpStatus.BAD_REQUEST);
        }
      
        try {
          const sender = await this.prisma.user.findUnique({ where: { id: id } });
          if (!sender) {
            throw new HttpException('Sender Not Found', HttpStatus.NOT_FOUND);
          }
      
          const senderAccount = await this.prisma.account.findFirst({ where: { userId: id } });
          if (!senderAccount) {
            throw new HttpException('Sender Account Not Found', HttpStatus.NOT_FOUND);
          }
      
          const receiver = await this.prisma.user.findFirst({ where: { userName: userName } });
          if (!receiver) {
            throw new HttpException(`Receiver with the Username ${userName} doesn't exist`, HttpStatus.NOT_FOUND);
          }

          const receiverAccount = await this.prisma.user.findFirst({ where: { userName: userName } });
          if (!receiver) {
            throw new HttpException(`Receiver with the Username ${userName} doesn't exist`, HttpStatus.NOT_FOUND);
          }
      
          const updatedSenderAccount = await this.updateAccountBalance(senderAccount, currency, -amount);
          const updatedReceiverAccount = await this.updateAccountBalance(receiverAccount, currency, amount);
      
          const reference = randomize('Aa', 10);
      
          const transaction = await this.createTransaction(sender, receiver, amount, currency, reference, narration);
          const transactionRecipient = await this.createTransaction(receiver, sender, amount, currency, reference, narration);
      
          if (!transactionRecipient || !transaction) {
            throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE);
          }
      
          await this.mailService.sendPayyngTransferNotificationEmail(
            receiver.email,
            receiver.firstName,
            amount,
            currency,
            narration,
          );
      
          return {
            status: 'success',
            message: 'Transfer Successful',
            transfer: transaction,
          };
        } catch (err) {
          throw err;
        }
      }

    async updateAccountBalance(account, currency, amount) {
        if (account[currency] < amount) {
          throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY);
        }
      
        const newBalance = account[currency] + amount;
      
        if (newBalance < 0) {
          throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY);
        }
      
        const updatedAccount = await this.prisma.account.update({
          where: { id: account.id },
          data: { [currency]: newBalance },
        });
      
        if (!updatedAccount) {
          throw new HttpException('Something went wrong. Please try again', HttpStatus.SERVICE_UNAVAILABLE);
        }
      
        return updatedAccount;
      }


      
      async createTransaction(user, biller, amount, currency, reference, narration) {
        const transaction = await this.prisma.transaction.create({
          data: {
            amount: amount,
            type: "TRANSFER",
            billerName: biller.userName,
            currency: currency,
            bank_name: `PAYYNG - ${biller.userName.toUpperCase()} `,
            customer: biller.firstName + " " + biller.lastName,
            reference: reference,
            status: "Completed",
            narration: narration,
            user: {
              connect: { id: user.id },
            },
          },
        });
      
        return transaction;
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

    async exchangeCurrency({ id, newAmount, newCurrency, exchangeCurrency, exchangeAmount }: ExchangeDTO) {

        if (!id || !newAmount || !newCurrency || !exchangeAmount || !exchangeCurrency){
            throw new HttpException('Ensure all fields are provided', HttpStatus.BAD_REQUEST)
        }

        try {

            const user = await this.prisma.user.findUnique({
                where: {
                    id: id
                }
            })

            if (!user) { 
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
            }

            const account = await this.prisma.account.findFirst({
                where: {
                    userId: id
                }
            })

            if (!account) {
                throw new HttpException('Account Not Found', HttpStatus.NOT_FOUND)
            }

            if (exchangeCurrency === "USD" && newCurrency === "NGN" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.USD < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.USD - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        USD: newBalance,
                        NGN: account.NGN + newAmount
                    }
                })
            }

            if (exchangeCurrency === "USD" && newCurrency === "EUR" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.USD < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.USD - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        USD: newBalance,
                        EUR: account.EUR + newAmount
                    }
                })
            }

            if (exchangeCurrency === "USD" && newCurrency === "GBP" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.USD < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.USD - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        USD: newBalance,
                        GBP: account.GBP + newAmount
                    }
                })
            }

            if (exchangeCurrency === "EUR" && newCurrency === "NGN" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.EUR < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.EUR - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        EUR: newBalance,
                        NGN: account.NGN + newAmount
                    }
                })
            }

            if (exchangeCurrency === "EUR" && newCurrency === "USD" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.EUR < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.EUR - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        EUR: newBalance,
                        USD: account.USD + newAmount
                    }
                })
            }

            if (exchangeCurrency === "EUR" && newCurrency === "GBP" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.EUR < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.EUR - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        EUR: newBalance,
                        GBP: account.GBP + newAmount
                    }
                })
            }

            if (exchangeCurrency === "GBP" && newCurrency === "NGN" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.GBP < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.GBP - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        GBP: newBalance,
                        NGN: account.NGN + newAmount
                    }
                })
            }

            if (exchangeCurrency === "GBP" && newCurrency === "USD" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.GBP < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.GBP - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        GBP: newBalance,
                        USD: account.USD + newAmount
                    }
                })
            }

            if (exchangeCurrency === "GBP" && newCurrency === "EUR" ) {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.GBP < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.GBP - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: <any> {
                        GBP: newBalance,
                        EUR: account.EUR + newAmount
                    }
                })
            }
            
            if (exchangeCurrency === "NGN" && newCurrency === "USD") {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.NGN < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.NGN - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where: {
                        id: account.id
                    },
                    data: {
                        NGN: newBalance,
                        USD: account.USD + newAmount
                    }
                })
            }

            if (exchangeCurrency === "NGN" && newCurrency === "EUR") {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.NGN < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.NGN - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where:{
                        id: account.id
                    },
                    data: {
                        NGN: newBalance,
                        EUR: account.EUR + newAmount
                    }
                })
            }

            if (exchangeCurrency === "NGN" && newCurrency === "GBP") {
                //GET THE USE BALANCE FROM ACCOUNT

                if (account.NGN < exchangeAmount) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                const newBalance = account.NGN - exchangeAmount

                if (newBalance < 0) {
                    throw new HttpException('Insufficient Balance', HttpStatus.UNPROCESSABLE_ENTITY)
                }

                await this.prisma.account.update({
                    where:{
                        id: account.id
                    },
                    data: {
                        NGN: newBalance,
                        GBP: account.GBP + newAmount
                    }
                })
            }


            //Save To Transactions In Database
            const transaction = await this.prisma.transaction.create({
                data: <any>{
                    amount: exchangeAmount,
                    type: "EXCHANGE",
                    billerName: `EXCHANGE FROM ${exchangeCurrency} to ${newCurrency}`,
                    currency: exchangeCurrency,
                    bank_name: `PAYYNG - ${newCurrency} Account `,
                    customer: user.firstName + " " + user.lastName,
                    reference: reference,
                }
            })

            return {
                status: 'success',
                message: 'Exchange Successful',
                transaction: transaction
            }


        }catch (err) {
            throw err
        }
        return
    }


    async generateReceipt (id:string) {
        if (!id) {
            throw new HttpException('Ensure all fields are provided', HttpStatus.BAD_REQUEST)
        }

        try {

            const transaction = this.prisma.transaction.findUnique({
                where:{
                    id: id
                }
            })

            if (!transaction) {
                throw new HttpException('Transaction Not Found', HttpStatus.NOT_FOUND)
            }

            
            

        } catch (err){
            throw err
        }

        return
    }




}