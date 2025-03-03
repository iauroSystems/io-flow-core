import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import CustomError from 'src/common/exceptions/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ProcessInstanceService } from './process-instances.service';
import { jwtDecode } from 'jwt-decode';
import { GrpcExceptionFilter } from 'src/common/exceptions/grpc-exception.filter';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
const grpcCall = true;

@UseFilters(new GrpcExceptionFilter())
@Controller()
export class ProcessInstanceGrpcController {
  constructor (private processInstanceService: ProcessInstanceService) { }

  private extractHeaders(metadata: any): any {
    const meta = metadata.getMap();
    const decodedToken = jwtDecode(meta["authorization"]);
    return {
      "x-tenant-id": meta['x-tenant-id'],
      "authorization": meta['authorization'],
      "user-id": decodedToken['userId']
    };
  }

  @GrpcMethod('ProcessIntanceGrpcService', 'Create')
  async createByDefinitionId(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    const headers = this.extractHeaders(metadata);
    return this.processInstanceService.createByDefinitionId(headers, data.processDefinitionId, data.query, grpcCall);
  }

  @GrpcMethod('ProcessIntanceGrpcService', 'CreateByDefinitionKey')
  async createByDefinitionKey(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    const headers = this.extractHeaders(metadata);
    const response = await this.processInstanceService.createByDefinitionKey(headers, data.query, data.key, grpcCall);
    return response;
  }

  @GrpcMethod('ProcessIntanceGrpcService', 'Start')
  async start(data: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.start(data.processInstanceId, data.createProcessInstanceDto, grpcCall);
  }

  @GrpcMethod('ProcessIntanceGrpcService', 'RunByDefinitionId')
  async runByDefinitionId(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    const headers = this.extractHeaders(metadata);
    const params = JSON.parse(data.parameters);
    let body = { ...data };
    body.parameters = params;
    return this.processInstanceService.runByDefinitionId(headers, data.processDefinitionId, body, grpcCall);
  }

  @GrpcMethod('ProcessIntanceGrpcService', 'RunByDefinitionKey')
  async runByDefinitionKey(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    const headers = this.extractHeaders(metadata);
    const params = JSON.parse(data.parameters);
    let body = { ...data };
    body.parameters = params;
    return this.processInstanceService.runByDefinitionKey(headers, data.query, data.key, body, grpcCall);
  }
}
