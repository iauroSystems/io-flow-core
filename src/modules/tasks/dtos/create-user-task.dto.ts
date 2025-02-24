import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

class Params {
    [key: string]: any;
}

export class CreateUserTaskDto {
    rootProcessInstanceId: string;
    processInstanceId: string;
    taskId: string;
    assignee?: string;
    summary: string;
    description: string;
    expStartDate: number;
    expEndDate: number;
    priority: string;
    parameters: Params;
    watchers?: string[];
}
