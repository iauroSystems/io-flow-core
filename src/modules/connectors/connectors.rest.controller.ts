import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Headers, Delete, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { CreateConnectorBodyDto, GetConnectorQueryDto, UpdateConnectorBodyDto } from "./dtos";
import { ConnectorService } from "./connectors.service";
import { CommonHeadersDto } from "src/shared/dtos";
// import { AuthGuard } from "src/common/guards/auth.guard";

@ApiTags('Connector')
@Controller('connector')
// @ApiBearerAuth()
// @UseGuards(AuthGuard)

// @ApiHeader({
//   name: 'authorization',
//   description: 'Bearer token',
//   required: true,
// })
// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class ConnectorController {
  constructor (private connectorService: ConnectorService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Headers() headers: CommonHeadersDto, @Body() createConnectorBodyDto: CreateConnectorBodyDto): Promise<CustomResponse | CustomError> {
    return this.connectorService.create(createConnectorBodyDto);
  }

  @Get('/list')
  async findAll(@Headers() headers: CommonHeadersDto, @Query() getConnectorQueryDto: GetConnectorQueryDto): Promise<CustomResponse | CustomError> {
    return this.connectorService.findAll(getConnectorQueryDto);
  }

  @Get(':id')
  async findOne(@Headers() headers: CommonHeadersDto, @Param('id') id: string): Promise<CustomResponse | CustomError> {
    return this.connectorService.findOne(id);
  }

  @Put(':id')
  async updateOne(@Headers() headers: CommonHeadersDto, @Param('id') id: string, @Body() updateConnectorBodyDto: UpdateConnectorBodyDto):
    Promise<CustomResponse | CustomError> {
    return this.connectorService.update(id, updateConnectorBodyDto);
  }

  @Delete(':id')
  async remove(@Headers() headers: CommonHeadersDto, @Param('id') id: string):
    Promise<CustomResponse | CustomError> {
    return this.connectorService.remove(id);
  }
}
