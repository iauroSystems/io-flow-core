import { Test, TestingModule } from '@nestjs/testing';
import { MetricsMiddleware } from '../http-status-code.middleware';
import { Request, Response } from 'express';
import { Counter, register } from 'prom-client';

jest.mock('express');

describe('MetricsMiddleware', () => {
    let middleware: MetricsMiddleware;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockCounterInc: jest.Mock;

    beforeEach(async () => {
        register.clear();
        mockCounterInc = jest.fn();
        (Counter.prototype.inc as jest.Mock) = mockCounterInc;

        const module: TestingModule = await Test.createTestingModule({
            providers: [MetricsMiddleware],
        }).compile();

        middleware = module.get<MetricsMiddleware>(MetricsMiddleware);
        mockRequest = {
            method: 'GET',
            url: '/example',
        };
        mockResponse = {
            statusCode: 200,
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'finish') {
                    callback();
                }
            }), 
        } as Partial<Response>;
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
      });

    it('should increment the counter on finish', () => {
        middleware.use(mockRequest as Request, mockResponse as Response, () => {});
        expect(mockCounterInc).toHaveBeenCalledWith({ status: '200', method: 'GET', url: '/example' });
    });

    it('should call next function', () => {
        const nextMock = jest.fn();
        middleware.use(mockRequest as Request, mockResponse as Response, nextMock);
        expect(nextMock).toHaveBeenCalled();
    });
});