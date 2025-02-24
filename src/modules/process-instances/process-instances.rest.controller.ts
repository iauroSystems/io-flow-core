import { Body, Controller, Get, Param, Post, Query, Headers, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CreateProcessInstanceDto, GetProcessInstanceStatsQueryDto, GetProcessInstanceQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceDto, UpdateProcessInstanceQueryDto, GetProcessInstanceStageStatsQueryDto } from './dtos';
import { ProcessInstanceService } from './process-instances.service';
import { CommonHeadersDto } from 'src/shared/dtos';
// import { AuthGuard } from '@gessa/authguard';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
@ApiTags('Process Instances')
@Controller('process-instances')
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
// @ApiHeader({
//   name: 'authorization',
//   description: 'Bearer token',
//   required: true,
// })
// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class ProcessInstanceController {
  constructor (private processInstanceService: ProcessInstanceService) { }

  @Post(':processDefinitionId')
  async createByDefinitionId(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') processDefinitionId: string, @Query() query: GetOneProcessInstanceQueryDto): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.createByDefinitionId(headers, processDefinitionId, query);
  }

  @Post('key/:key')
  async createByDefinitionKey(@Headers() headers: CommonHeadersDto, @Param('key') key: string, @Query() query: GetOneProcessInstanceQueryDto): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.createByDefinitionKey(headers, query, key);
  }

  @Post(':processInstanceId/start')
  async start(@Headers() headers: CommonHeadersDto, @Param('processInstanceId') processInstanceId: string, @Body() createProcessInstanceDto: CreateProcessInstanceDto): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.start(processInstanceId, createProcessInstanceDto);
  }

  @Get(':processDefinitionId/list')
  async findAll(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') processDefinitionId: string, @Query() getProcessInstanceDto: GetProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.getInstancesByDefinitionId(processDefinitionId, getProcessInstanceDto);
  }

  @Get('key/:key/list')
  async findAllByKey(@Headers() headers: CommonHeadersDto, @Param('key') processDefinitionKey: string, @Query() getProcessInstanceDto: GetProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.getInstancesByDefinitionKey(processDefinitionKey, getProcessInstanceDto);
  }

  @Get(':processInstanceId')
  async findOne(@Headers() headers: CommonHeadersDto, @Param('processInstanceId') id: string): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.findOne(id);
  }

  @Get('stats/:processDefinitionId')
  async getStatsByDefinitionId(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') processDefinitionId: string, @Query() query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.getStatsByDefinitionId(processDefinitionId, query);
  }

  @Get('stats/key/:key')
  async getStatsByDefinitionKey(@Headers() headers: CommonHeadersDto, @Param('key') processDefinitionKey: string, @Query() query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.getStatsByDefinitionKey(processDefinitionKey, query);
  }
  @Patch(':processInstanceId')
  async updateInstances(@Headers() headers: CommonHeadersDto, @Param('processInstanceId') processInstanceId: string, @Body() updateProcessInstanceDto: UpdateProcessInstanceDto, @Query() query: UpdateProcessInstanceQueryDto):
    Promise<CustomResponse | CustomError> {
    return this.processInstanceService.updateInstances(processInstanceId, updateProcessInstanceDto, query);
  }

  @Post('run/:processDefinitionId')
  async runByDefinitionId(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') processDefinitionId: string, @Body() createProcessInstanceDto: CreateProcessInstanceDto): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.runByDefinitionId(headers, processDefinitionId, createProcessInstanceDto);
  }

  @Post('run/key/:key')
  async runByDefinitionKey(@Headers() headers: CommonHeadersDto, @Param('key') key: string, @Query() query: GetOneProcessInstanceQueryDto, @Body() createProcessInstanceDto: CreateProcessInstanceDto): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.processInstanceService.runByDefinitionKey(headers, query, key, createProcessInstanceDto);
  }

  @Get('/stages/stats')
  async getAllStageStats(@Headers() headers: CommonHeadersDto, @Query() query: GetProcessInstanceStageStatsQueryDto): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.getStageStats(query);
    // return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, query);
  }

  @Get('/mostfrequentpath/:processDefinitionId/list')
  async mostFrequentPath(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') processDefinitionId: string): Promise<CustomResponse | CustomError> {
    return this.processInstanceService.mostFollowedPath(processDefinitionId);
  }

}