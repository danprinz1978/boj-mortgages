import { HttpException } from '@nestjs/common';

export interface ErrorMapping {
  [key: string]: {
    status: number;
    message: string;
  };
}

export function throwMappedError({
  errorCode,
  errorMessage,
  responseCode,
  errorMapping,
}: {
  errorCode: string;
  errorMessage?: string;
  responseCode?: number;
  errorMapping: ErrorMapping;
}): never {
  if (errorCode && errorMapping[errorCode]) {
    const { status, message } = errorMapping[errorCode];
    throw new HttpException(
      {
        message: message,
        bankStatus: responseCode ?? status,
      },
      500,
    );
  }
  throw new HttpException(
    {
      message: errorMessage ?? 'unknown',
      bankStatus: 500,
    },
    500,
  );
}
