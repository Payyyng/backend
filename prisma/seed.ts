import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
2;
async function main() {
  await prisma.plans.createMany({
    data: [
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '500.0mb',
        dataId: '329',
        amount: 130.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '1.0GB',
        dataId: '330',
        amount: 160.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '2.0GB ',
        dataId: '331',
        amount: 320.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '3.0GB',
        dataId: '332',
        amount: 480.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '5.0GB',
        dataId: '334',
        amount: 800.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '10.0GB',
        dataId: '335',
        amount: 1600.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '15.0GB',
        dataId: '337',
        amount: 2400.0,
      },
      {
        network: '9MOBILE',
        type: 'GIFTING',
        bundle: '20.0GB',
        dataId: '338',
        amount: 3200.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '750.0 MB',
        dataId: '220',
        amount: 440.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '1.5 GB',
        dataId: '145',
        amount: 880.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '2.0 GB',
        dataId: '146',
        amount: 1056.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '3.0 GB',
        dataId: '147',
        amount: 1320.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '6.0 GB',
        dataId: '192',
        amount: 1320.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '4.5 GB',
        dataId: '148',
        amount: 1760.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '6.0 GB',
        dataId: '149',
        amount: 2200.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '10.0 GB',
        dataId: '150',
        amount: 2640.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '20.0 GB',
        dataId: '164',
        amount: 4950.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '40.0 GB',
        dataId: '165',
        amount: 8800.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '75.0 GB',
        dataId: '191',
        amount: 13200.0,
      },
      {
        network: 'AIRTEL',
        type: 'GIFTING',
        bundle: '120.0 GB',
        dataId: '193',
        amount: 19800.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '500MB',
        dataId: '279',
        amount: 145.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '1gb',
        dataId: '280',
        amount: 285.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '2gb',
        dataId: '281',
        amount: 570.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '5gb',
        dataId: '282',
        amount: 1425.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '10gb',
        dataId: '312',
        amount: 2850.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '100mb',
        dataId: '313',
        amount: 8000.0,
      },
      {
        network: 'AIRTEL',
        type: 'SME',
        bundle: '300mb',
        dataId: '314',
        amount: 17000.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '500.0MB',
        dataId: '320',
        amount: 130.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '1.0GB',
        dataId: '321',
        amount: 227.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '2.0GB ',
        dataId: '322',
        amount: 454.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '3.0GB ',
        dataId: '323',
        amount: 681.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '5.0GB',
        dataId: '324',
        amount: 1135.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '10.0GB',
        dataId: '325',
        amount: 2270.0,
      },
      {
        network: 'GLO',
        type: 'GIFTING',
        bundle: '138.0 GB ',
        dataId: '206',
        amount: 18400.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '500MB ',
        dataId: '270',
        amount: 155.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '1.0GB ',
        dataId: '265',
        amount: 265.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '2.0GB ',
        dataId: '266',
        amount: 530.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '3.0GB',
        dataId: '267',
        amount: 795.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '5.0GB',
        dataId: '268',
        amount: 1310.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '10gb',
        dataId: '269',
        amount: 2650.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '15gb',
        dataId: '275',
        amount: 3975.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '20gb',
        dataId: '277',
        amount: 5300.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '40gb',
        dataId: '276',
        amount: 10000.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '150.0 MB',
        dataId: '274',
        amount: 1000000.0,
      },
      {
        network: 'MTN',
        type: 'CDG',
        bundle: '250mb',
        dataId: '273',
        amount: 1000000.0,
      },
      {
        network: 'MTN',
        type: 'DATA SPECIAL',
        bundle: '1GB',
        dataId: '348',
        amount: 262.0,
      },
      {
        network: 'MTN',
        type: 'DATA SPECIAL',
        bundle: '3GB',
        dataId: '349',
        amount: 786.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '1.0GB',
        dataId: '215',
        amount: 479.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '1.5GB',
        dataId: '210',
        amount: 957.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '6gb',
        dataId: '49',
        amount: 2392.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '10gb',
        dataId: '224',
        amount: 2871.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '12gb',
        dataId: '225',
        amount: 3045.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '20gb',
        dataId: '226',
        amount: 4785.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '25gb',
        dataId: '227',
        amount: 6270.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '40gb',
        dataId: '51',
        amount: 9570.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '75gb',
        dataId: '52',
        amount: 14355.0,
      },
      {
        network: 'MTN',
        type: 'GIFTING',
        bundle: '120gb',
        dataId: '208',
        amount: 19350.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '500MB ',
        dataId: '252',
        amount: 130.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '1GB',
        dataId: '7',
        amount: 260.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '2GB',
        dataId: '8',
        amount: 520.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '3GB',
        dataId: '44',
        amount: 780.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '5GB',
        dataId: '11',
        amount: 1300.0,
      },
      {
        network: 'MTN',
        type: 'SME',
        bundle: '10gb ',
        dataId: '253',
        amount: 2600.0,
      },
    ],
  });

  await prisma.admin.create({
    data: {
      exchangeEUR: 1280,
      exchangeFee: 30,
      exchangeGBP: 1500,
      exchangeNGN: 1,
      exchangeUSD: 1200,
      paypalRate: 450,
      exchangeTransactionFeePercentage: 2,
      paypalEmail: 'support@payyng.com',
      userRole: 'ADMIN',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
