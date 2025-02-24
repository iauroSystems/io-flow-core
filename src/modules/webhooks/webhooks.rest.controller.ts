import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Headers } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { CreateWebhookBodyDto, GetWebhookQueryDto, UpdateWebhookBodyDto } from "./dtos";
import { WebhookService } from "./webhooks.service";
import { CommonHeadersDto } from "src/shared/dtos";
// import { AuthGuard } from '@gessa/authguard';

@ApiTags('Webhooks')
@Controller('webhooks')

// @ApiHeader({
//   name: 'authorization',
//   description: 'Bearer token',
//   required: true,
// })
// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class WebhookController {
  constructor (private webhookService: WebhookService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Headers() headers: CommonHeadersDto, @Body() createProcessDefinitionDto: CreateWebhookBodyDto): Promise<CustomResponse | CustomError> {
    return this.webhookService.create(createProcessDefinitionDto);
  }

  @Get('/list')
  async findAll(@Headers() headers: CommonHeadersDto, @Query() getProcessDefinitionDto: GetWebhookQueryDto): Promise<CustomResponse | CustomError> {
    return this.webhookService.findAll(getProcessDefinitionDto);
  }

  @Get(':webhookId')
  async findOne(@Headers() headers: CommonHeadersDto, @Param('webhookId') id: string): Promise<CustomResponse | CustomError> {
    return this.webhookService.findOne(id);
  }
  @Put(':webhookId')
  async updateOne(@Headers() headers: CommonHeadersDto, @Param('webhookId') id: string, @Body() updateProcessDefinitionDto: UpdateWebhookBodyDto):
    Promise<CustomResponse | CustomError> {
    return this.webhookService.update(id, updateProcessDefinitionDto);
  }

}