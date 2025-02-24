import {
    IsOptional, IsNotEmpty, IsNotEmptyObject
} from 'class-validator';
import { AxiosRequestConfig, CustomParamsSerializer, ParamsSerializerOptions } from 'axios';

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

    @IsOptional()
    timeout?: number;

    @IsOptional()
    paramsSerializer?: ParamsSerializerOptions | CustomParamsSerializer;
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

export class SoapConnectorDto {
    @IsOptional()
    url: string;

    method: string;

    @IsOptional()
    data?: any;
}
export class KafkaConnectorDto {
    operation: string;

    clientId: any;

    broker: string;

    topic: string;

    data: any;
}

export class MySQLConnectorDto {
    @IsNotEmpty()
    hostname: string;

    @IsNotEmpty()
    port: number;

    user: string;

    password: string;

    encryptedPassword: string;

    @IsNotEmpty()
    databaseName: string;

    @IsNotEmpty()
    query: string;

    @IsNotEmpty()
    encryptedQuery: string;
}

export class PostgesConnectorDto {
    @IsNotEmpty()
    hostname: string;

    @IsNotEmpty()
    port: number;

    user: string;

    password: string;

    encryptedPassword: string;

    @IsNotEmpty()
    databaseName: string;

    @IsNotEmpty()
    query: string;

    @IsNotEmpty()
    encryptedQuery: string;
}
