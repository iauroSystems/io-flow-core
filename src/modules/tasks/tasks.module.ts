import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { UserTasks, UserTasksSchema } from 'src/models/user-tasks/user-tasks.schema';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { TasksController } from './tasks.rest.controller';
import { TasksService } from './tasks.service';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { Compiler } from '../process-instances/providers';
import { Executor } from './providers';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessInstance, ProcessInstanceSchema } from 'src/models/process-instances/process-instances.schema';
import { ProcessDefinition, ProcessDefinitionSchema } from 'src/models/process-definitions/process-definitions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserTasks.name, schema: UserTasksSchema }, { name: ProcessInstance.name, schema: ProcessInstanceSchema }, { name: ProcessDefinition.name, schema: ProcessDefinitionSchema }]),
    HttpModule,
  ],
  exports: [],
  controllers: [TasksController],
  providers: [TasksService, UserTasksRepositoryImpl, ProcessInstanceRepositoryImpl, ProcessDefinitionRepositoryImpl, HttpConnector, Compiler, Executor, GrpcConnector],
})
export class TasksModule { }
