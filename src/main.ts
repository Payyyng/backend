import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Payyng')
    .setDescription('Backend API INTEGRATION FOR PAYYNG APPLICATION')
    .setVersion('0.1')
    .addTag('payyng')
    .setContact('Payyng', 'https://payyng.com', 'dev@payyng.com')
    .addBearerAuth()
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // await app.listen(3000);
  await app.listen(process.env?.PORT || 3000 );

}
bootstrap();


