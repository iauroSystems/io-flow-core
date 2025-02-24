import { Body, Controller, Get, Headers, Param, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CompleteTaskBody, CompleteTaskParams, GetTasksQueryDto, ReAssignTaskBody } from './dtos';
import { CommonHeadersDto } from 'src/shared/dtos';
import { TasksService } from './tasks.service';
import { GetProcessInstanceStatsQueryDto } from '../process-instances/dtos';
// import { AuthGuard } from '@gessa/authguard';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
@ApiTags('Tasks')
@Controller()
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
// @ApiHeader({
//   name: 'authorization',
//   description: 'Bearer token',
//   required: true,
// })

// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class TasksController {

  constructor (private tasksService: TasksService,

  ) { }

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
    Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.tasksService.completeTask(headers, params, completeTaskDto);
  }

  @Post('tasks/:processInstanceId/reassign')
  async reassignTask(@Headers() headers: CommonHeadersDto, @Param() params: CompleteTaskParams, @Body() completeTaskDto: ReAssignTaskBody):
    Promise<CustomResponse | CustomError | CustomGrpcResponse> {
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
  async updateTimer(@Headers() headers: CommonHeadersDto): Promise<CustomResponse | CustomError> {

    return this.tasksService.updateTimer(headers);
  }

}