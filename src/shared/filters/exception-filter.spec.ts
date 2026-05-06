import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './exception-filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
      query: {},
      ip: '127.0.0.1',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;
  });

  // 1. Check if the filter exists
  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  // 2. Send HTTP kind of error and check response
  it('should handle HttpException', () => {
    const httpException = new HttpException('Test HTTP Exception', HttpStatus.BAD_REQUEST);
    
    filter.catch(httpException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Test HTTP Exception',
      path: '/test',
      method: 'GET',
      query: {},
      remoteAddress: '127.0.0.1',
    }));
  });

  // 3. Send non-HTTP error and check for 500 response
  it('should handle non-HttpException with 500 status', () => {
    const nonHttpError = new Error('Some unexpected error');
    
    filter.catch(nonHttpError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Internal Server Error',
      path: '/test',
      method: 'GET',
      query: {},
      remoteAddress: '127.0.0.1',
    }));
  });
});
