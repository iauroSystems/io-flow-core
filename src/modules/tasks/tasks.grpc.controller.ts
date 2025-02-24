import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import CustomError from 'src/common/exceptions/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { TasksService } from './tasks.service';
import { jwtDecode } from 'jwt-decode';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
import { GrpcExceptionFilter } from 'src/common/exceptions/grpc-exception.filter';
const grpcCall = true;

@Controller()
export class TasksGrpcController {
    constructor (private tasksService: TasksService) { }

    private extractHeaders(metadata: any): any {
        const meta = metadata.getMap();
        const decodedToken = jwtDecode(meta['authorization']);
        return {
            "x-tenant-id": meta['x-tenant-id'],
            "authorization": meta['authorization'],
            "user-id": decodedToken['userId']
        };
    }


    @UseFilters(new GrpcExceptionFilter())
    @GrpcMethod('TasksGrpcService', 'CompleteTask')
    async completeTask(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
        const headers = this.extractHeaders(metadata);
        return this.tasksService.completeTask(headers, data.params, data.completeTaskDto, grpcCall);
    }

    @GrpcMethod('TasksGrpcService', 'ReassignTask')
    async reassignTask(data: any, metadata: any): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
        const headers = this.extractHeaders(metadata);
        return this.tasksService.reassignTask(headers, data.params, data.completeTaskDto, grpcCall);
    }
}
