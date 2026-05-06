import { HttpException } from '@nestjs/common';
import { EAPIErrorType } from '../enums/exceptions';
import { APIErrorDetails } from '../types/exception.type';

export class APIException extends HttpException {
  readonly error: EAPIErrorType;

  constructor(type: EAPIErrorType, message?: string, errors?: string[]) {
    const details = APIErrorDetails[type];
    const errorMessage = message || details.message;
    const response: any = { error: type, message: errorMessage };
    
    //for exel fields validation errors
    if (errors && errors.length > 0) {
      response.success = false;
      response.errors = errors;
    }
    
    super(response, details.code);
  }
}
