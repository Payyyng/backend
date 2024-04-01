import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
    bodyParser: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Payyng')
    .setDescription('Backend API INTEGRATION FOR PAYYNG APPLICATION')
    .setVersion('0.1')
    .addTag('payyng')
    .setContact('Payyng', 'https://payyng.com', 'support@payyng.com')
    .addBearerAuth()
    .addServer('https://latest-h0i1.onrender.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('payyng-api', app, document);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      xContentTypeOptions: false,
      xPoweredBy: false,
      frameguard: true,
    }),
  );

  // app.use(cookieParser());

  // const port = process.env.PORT || 3000;

  // await app.listen(port, "0.0.0.0");
  // app.useGlobalFilters(new HttpExceptionFilter());
  // await app.listen(3000);
  await app.listen(process.env?.PORT || 3000);
}
bootstrap();
