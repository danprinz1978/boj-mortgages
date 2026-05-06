import { HttpStatus } from '@nestjs/common';
import { EAPIErrorType } from '../enums/exceptions';

export const APIErrorDetails: {
  [key in EAPIErrorType]: {
    message: string;
    code: HttpStatus;
  };
} = {
  TECHNICAL_ERROR: {
    message: 'An unexpected error occurred.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_PARAMETER: {
    message: 'Invalid parameter.',
    code: HttpStatus.BAD_REQUEST,
  },
  RESOURCE_NOT_FOUND: {
    message: 'Resource not found.',
    code: HttpStatus.NOT_FOUND,
  },
  CODE_EXPIRED: {
    message: 'Code expired.',
    code: HttpStatus.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    message:
      'Unauthorized action check if you have the right permissions or token is missing',
    code: HttpStatus.UNAUTHORIZED,
  },
  INVALID_FILE_FORMAT: {
    message: 'Invalid file format.',
    code: HttpStatus.BAD_REQUEST,
  },
  INVALID_FILE_CONTENT: {
    message: 'Invalid file content.',
    code: HttpStatus.BAD_REQUEST,
  },
  INVALID_FILE_ENCODING: {
    message: 'Invalid file encoding.',
    code: HttpStatus.BAD_REQUEST,
  },
  NO_FILE_UPLOADED: {
    message: 'No file uploaded.',
    code: HttpStatus.BAD_REQUEST,
  },
  ONLY_CSV_AND_EXCEL_FILES_ARE_ALLOWED: {
    message: 'Only CSV and Excel files are allowed.',
    code: HttpStatus.BAD_REQUEST,
  },
  CREATE_ENTITY_ERROR: {
    message: 'Failed to create entity.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  UPDATE_ENTITY_ERROR: {
    message: 'Failed to update entity.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  DELETE_ENTITY_ERROR: {
    message: 'Failed to delete entity.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FETCH_ENTITIES_ERROR: {
    message: 'Failed to fetch entities.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FETCH_ENTITY_BY_ID_ERROR: {
    message: 'Failed to fetch entity by ID.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FETCH_ENTITY_BY_FIELD_ERROR: {
    message: 'Failed to fetch entity by field.',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_TOKEN_ERROR: {
    message: 'Failed to get authentication token.',
    code: HttpStatus.UNAUTHORIZED,
  },
  FILE_VALIDATION_ERROR: {
    message: 'File validation failed.',
    code: HttpStatus.BAD_REQUEST,
  },
};
