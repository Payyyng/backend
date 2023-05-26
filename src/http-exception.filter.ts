import { Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}



// import {
//     ExceptionFilter,
//     Catch,
//     ArgumentsHost,
//     HttpException,
//     HttpStatus,
//   } from '@nestjs/common';
//   import { HttpAdapterHost } from '@nestjs/core';
  
//   @Catch()
//   export class HttpExceptionFilter implements ExceptionFilter {
//     constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
//     catch(exception: unknown, host: ArgumentsHost): void {
//       // In certain situations `httpAdapter` might not be available in the
//       // constructor method, thus we should resolve it here.

//       const { httpAdapter } = this.httpAdapterHost;
  
//       const ctx = host.switchToHttp();
  
//       const httpStatus =
//         exception instanceof HttpException
//           ? exception.getStatus()
//           : HttpStatus.INTERNAL_SERVER_ERROR;
  
//       const responseBody = {
//         statusCode: httpStatus,
//         timestamp: new Date().toISOString(),
//         path: httpAdapter.getRequestUrl(ctx.getRequest()),
//       };
  
//       httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//     }
//   }