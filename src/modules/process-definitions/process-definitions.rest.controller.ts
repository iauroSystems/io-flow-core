import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Headers, UseInterceptors, UploadedFile, UploadedFiles, UseGuards } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiHeader, ApiTags } from "@nestjs/swagger";
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { ProcessDefinition, ProcessDefinitionDocument } from "src/models/process-definitions/process-definitions.schema";
import { CreateProcessDefinitionDto, UpdateProcessDefinitionDto, GetProcessDefinitionDto, UpdateDefinitionParams, StageDefinition, GetProcessDefinitionQueryDto } from "./dtos";
import { ProcessDefinitionService } from "./process-definitions.service";
import { UpdateStageBody, UpdateStageParams } from "./dtos/update-stage.dto";
import { CommonHeadersDto } from "src/shared/dtos";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "./providers/multer-options";

@ApiTags('Business Process Definitions')
@Controller('process-definitions')

export class ProcessDefinitionController {
  constructor (private processDefinitionService: ProcessDefinitionService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Headers() headers: CommonHeadersDto, @Body() createProcessDefinitionDto: CreateProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.create(headers, createProcessDefinitionDto);
  }

  @Get('/list')
  async findAll(@Headers() headers: CommonHeadersDto, @Query() getProcessDefinitionDto: GetProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.findAll(getProcessDefinitionDto);
  }

  @Get(':processDefinitionId')
  async findOne(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') id: string): Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.findOne(id);
  }

  @Get('key/:key')
  async findOneByKey(@Headers() headers: CommonHeadersDto, @Param('key') key: string, @Query() query: GetProcessDefinitionQueryDto): Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.findOneByKey(key, query);
  }

  @Put(':processDefinitionId')
  async updateOne(@Headers() headers: CommonHeadersDto, @Param('processDefinitionId') id: string, @Body() updateProcessDefinitionDto: UpdateProcessDefinitionDto):
    Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.update(headers, id, updateProcessDefinitionDto);
  }

  @Patch(':processDefinitionId/stages/:stageId')
  async updateStage(@Headers() headers: CommonHeadersDto, @Param() params: UpdateStageParams, @Body() stage: UpdateStageBody):
    Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.updateStage(headers, params, stage);
  }

  @Post('upload-connector')
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        serviceName: {
          type: "string"
        }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadPROTOFile(
    @Headers() headers: CommonHeadersDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.processDefinitionService.uploadProtoFile(headers, file);
  }

  @Post('upload-bpmn')
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadBPMNFile(
    @Headers() headers: CommonHeadersDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.processDefinitionService.uploadBPMNFile(headers, file);
  }

}
