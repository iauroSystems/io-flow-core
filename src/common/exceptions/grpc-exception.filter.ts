import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
// import { CustomRpcException } from './custom-grpc-error';

@Catch(RpcException)
export class GrpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException) {
        // let message: any = exception?.message || 'Internal server error';
        // let grpcStatusCode =  null;
        // let error = null;
        // if ( exception instanceof CustomRpcException ) {
        //      grpcStatusCode = exception.grpcStatusCode;
        //     message = exception.message || message;
        //     error = exception.getError();
        // }
        // const responseBody = {
        //     timestamp: new Date().toISOString(),
        //     grpcStatusCode,
        //     message: message,
        //     error: error.error
        // };
        return throwError(() => exception.getError());
    }

}
