import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Default to 500 Internal Server Error if the exception is not handled
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    // Check if the exception is an instance of Http
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string' ? response : JSON.stringify(response);
    } else if (exception instanceof Error) {
      message = exception.message;
    } else if (typeof exception === 'object') {
      message = JSON.stringify(exception);
    }

    const responseMessage = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      query: request.query,
      remoteAddress: request.ip,
      message,
    };

    this.logger.error(`HTTP Error: ${message}`, exception);

    response.status(status).json(responseMessage);
  }
}
