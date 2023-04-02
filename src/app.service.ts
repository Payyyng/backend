import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Welcome to Payyng Backend';
  }

  notValid(): string {
    return 'Not A Valid Route';
  }
}
