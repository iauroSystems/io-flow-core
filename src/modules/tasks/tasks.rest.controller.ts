import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiHeader, ApiTags } from '@nestjs/swagger';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CompleteTaskBody, CompleteTaskParams, CompleteTasksHeadersDto, GetTasksQueryDto, GetTasksHeadersDto, GetTasksParamsDto, ReAssignTaskBody } from './dtos';
import { CommonHeadersDto } from 'src/shared/dtos';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { GetProcessInstanceStatsQueryDto } from '../process-instances/dtos';
@ApiTags('Tasks')
@Controller()

export class TasksController {
  constructor (private tasksService: TasksService) { }

  @Get('my-tasks')
  async findAllUserAssignedTasks(@Headers() headers: CommonHeadersDto, @Query() getUserTaskDto: GetTasksQueryDto): Promise<CustomResponse | CustomError> {
    return this.tasksService.findAllUserAssignedTasks(headers, getUserTaskDto);
  }

  @Get('tasks')
  async findTasks(@Headers() headers: CommonHeadersDto, @Query() query: GetTasksQueryDto): Promise<CustomResponse | CustomError> {
    return this.tasksService.findTasks(headers, query);
  }

  // @Put('tasks/:processInstanceId/:taskId')
  // async updateOne(@Param('id') id: string, @Body() updateUserTaskDto: UpdateUserTaskDto):
  //   Promise<CustomResponse | CustomError> {
  //   return this.tasksService.updateTask(id, updateUserTaskDto);
  // }

  @Post('tasks/:processInstanceId/complete')
  async completeTask(@Headers() headers: CommonHeadersDto, @Param() params: CompleteTaskParams, @Body() completeTaskDto: CompleteTaskBody):
    Promise<CustomResponse | CustomError> {
    return this.tasksService.completeTask(headers, params, completeTaskDto);
  }

  @Post('tasks/:processInstanceId/reassign')
  async reassignTask(@Headers() headers: CommonHeadersDto, @Param() params: CompleteTaskParams, @Body() completeTaskDto: ReAssignTaskBody):
    Promise<CustomResponse | CustomError> {
    return this.tasksService.reassignTask(headers, params, completeTaskDto);
  }


  @Get('tasks/stats')
  async getStatsByDefinitionId(@Headers() headers: CommonHeadersDto, @Query() query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    return this.tasksService.getTasksStats(headers, query, false);
  }

  @Get('tasks/my-stats')
  async getMyStatsByDefinitionId(@Headers() headers: CommonHeadersDto, @Query() query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    return this.tasksService.getTasksStats(headers, query, true);
  }


  @ApiExcludeEndpoint()
  @Get('timer')
  async updateTimer(): Promise<CustomResponse | CustomError> {
    return this.tasksService.updateTimer();
  }
}
