import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CreateValidationsDto, GetValidationDto, TestDto } from './dtos';
import { CommonHeadersDto } from 'src/shared/dtos';
import { ValidationService } from './validations.service';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
// import { AuthGuard } from 'src/common/guards/auth.guard';
@ApiTags('Validations')
@Controller('validation')
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
// @ApiHeader({
//   name: 'authorization',
//   description: 'Bearer token',
//   required: true,
// })

// @UseGuards(new AuthGuard(`${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`, true))

export class ValidationController {
  constructor (private validationService: ValidationService) { }


  @Post('create')
  async create(@Headers() headers: CommonHeadersDto, @Body() createValidationsDto: CreateValidationsDto):
    Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.validationService.create(headers, createValidationsDto);
  }

  // @Post( ':id' )
  // async ValidateParam ( @Param( 'id' ) id: string, @Body() params: TestDto ) {
  //   return this.validationService.validateParameters( id, params.data );
  // }

  @Patch(':id')
  async update(@Headers() headers: CommonHeadersDto, @Param('id') id: string, @Body() createValidationsDto: CreateValidationsDto):
    Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.validationService.update(id, createValidationsDto);
  }

  @Delete(':id')
  async remove(@Headers() headers: CommonHeadersDto, @Param('id') id: string):
    Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    return this.validationService.remove(id);
  }

  @Get('/list')
  async findAll(@Headers() headers: CommonHeadersDto, @Query() getValidationDto: GetValidationDto): Promise<CustomResponse | CustomError> {
    return this.validationService.findAll(getValidationDto);
  }

  @Get(':id')
  async findOne(@Headers() headers: CommonHeadersDto, @Param('id') id: string): Promise<CustomResponse | CustomError> {
    return this.validationService.findOne(id);
  }
}
