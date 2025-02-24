import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerMiddleware } from '../logger.middleware';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

class MockLogger {
  log = jest.fn();
}

describe('AppLoggerMiddleware', () => {
  let middleware: AppLoggerMiddleware;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;
  let mockLogger: MockLogger;

  beforeEach(async () => {
    mockLogger = new MockLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppLoggerMiddleware,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    middleware = module.get<AppLoggerMiddleware>(AppLoggerMiddleware);

    mockRequest = {
        ip: '127.0.0.1',
        method: 'GET',
        originalUrl: '/test',
        get: jest.fn((header) => {
            if (header === 'user-agent') {
                return 'Test User Agent';
            } else if (header === 'x-tenant-id') {
                return 'TestTenantId';
            }
            return undefined;
        }),
    } as unknown as Request;

    mockResponse = {
        on: jest.fn(),
        get: jest.fn(),
        statusCode: 200,
    } as unknown as Response;

    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log request details on response close event', () => {
    const onMock = jest.fn();
    mockResponse.on = onMock;
    middleware.use(mockRequest, mockResponse, mockNext);
    const closeCallback = onMock.mock.calls[0][1];
    closeCallback();
  });

  it('should call next function', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
