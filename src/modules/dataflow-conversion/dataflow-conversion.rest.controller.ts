import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { DataflowConversionService } from './dataflow-conversion.service';
import { CreateDataflowConversionDto } from './dto/create-dataflow-conversion.dto';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CommonHeadersDto } from 'src/shared/dtos';
// import { AuthGuard } from 'src/common/guards/auth.guard';
// import { AuthGuard } from '@gessa/authguard';

@ApiTags('Data flow JSON conversion to Workflow JSON')
@Controller('dataflow-conversion')
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class DataflowConversionController {
  constructor (private readonly dataflowConversionService: DataflowConversionService) { }

  @Post()
  create(@Headers() headers: CommonHeadersDto, @Body() createDataflowConversionDto: CreateDataflowConversionDto) {
    return this.dataflowConversionService.create(createDataflowConversionDto);
  }

}
