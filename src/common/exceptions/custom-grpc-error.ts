import { RpcException } from "@nestjs/microservices";

export interface IRpcException {
    message: string;
    grpcStatusCode: number;
    timestamp: string;
}
export class CustomRpcException extends RpcException implements IRpcException {
    httpStatusCode: number;
    grpcStatusCode: number;
    timestamp: string;
    constructor(grpcStatusCode: number,  message: string, error?: any) {
        super({ message, error });
        this.grpcStatusCode = grpcStatusCode;
        this.timestamp = new Date().toISOString();
    }
}

const HTTP_TO_GRPC_STATUS_MAP: { [httpStatus: number]: number } = {
    200: 0,
    201: 0,
    499: 1,
    500: 13,
    400: 3,
    405: 4,
    409: 5,
    403: 7,
    401: 16,
    429: 8,
    501: 12,
    503: 14,
};

export const mapHttpStatusToGrpcStatus = (httpStatus: number): number => {
    const grpcStatusCode = HTTP_TO_GRPC_STATUS_MAP[httpStatus];
    return grpcStatusCode;
};
