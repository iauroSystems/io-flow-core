import {
    IsOptional, IsNotEmpty, IsNotEmptyObject
} from 'class-validator';
import { AxiosRequestConfig } from 'axios';

export class HttpConnectorDto implements AxiosRequestConfig {
    url: string;
    method: string;

    @IsOptional()
    headers: any;

    @IsOptional()
    params?: any;

    @IsOptional()
    query?: any;

    @IsOptional()
    data?: any;
}

class GrpcServiceOptions {
    @IsOptional()
    protoPath: string;

    @IsNotEmpty()
    serviceName: string;

    @IsNotEmpty()
    packageName: string;

    @IsNotEmpty()
    url: string;
}

class GrpcMethodOptions {
    @IsNotEmpty()
    methodName: string;

    @IsOptional()
    message: any;

    @IsOptional()
    metadata: any;
}

export class GrpcConnectorDto {
    @IsNotEmptyObject()
    serviceOptions: GrpcServiceOptions;

    @IsNotEmptyObject()
    methodOptions: GrpcMethodOptions;
}

export class KafkaConnectorDto {
    operation: string;

    clientId:any;

    broker: string;

    topic: string;
    
    data: any; 
}

export class OpenAIConnectorDto{
    prompt: string;
    apiKey: string;
    
    @IsOptional()
    data?: any;
    
}