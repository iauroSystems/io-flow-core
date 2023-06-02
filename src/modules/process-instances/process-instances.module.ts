import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios'

import { ProcessInstance, ProcessInstanceSchema } from 'src/models/process-instances/process-instances.schema';

import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';

import { ProcessInstanceController } from './process-instances.rest.controller';
import { ProcessInstanceService } from './process-instances.service';
import { Compiler } from './providers';
import { Executor } from '../tasks/providers';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessDefinition, ProcessDefinitionSchema } from 'src/models/process-definitions/process-definitions.schema';
import { UserTasks, UserTasksSchema } from 'src/models/user-tasks/user-tasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProcessInstance.name, schema: ProcessInstanceSchema }, { name: ProcessDefinition.name, schema: ProcessDefinitionSchema }, { name: UserTasks.name, schema: UserTasksSchema }]),
    HttpModule

  ],
  controllers: [ProcessInstanceController],
  providers: [ProcessInstanceService, ProcessInstanceRepositoryImpl, ProcessDefinitionRepositoryImpl, Compiler, Executor, UserTasksRepositoryImpl, HttpConnector, GrpcConnector],
})
export class ProcessInstancesModule { }
