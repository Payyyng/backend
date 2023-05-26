import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception.filter';

  
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

  // const port = process.env.PORT || 3000;

  // await app.listen(port, "0.0.0.0");
  // app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
  // await app.listen(process.env?.PORT || 3000 );

}
bootstrap();
