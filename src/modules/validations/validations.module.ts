import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';

import { Validations, ValidationsSchema } from 'src/models/validations/validations.schema';
import { ValidationsRepositoryImpl } from 'src/models/validations/repository/validations.repository.impl';
import { ValidationService } from './validations.service';
import { ValidationController } from './validations.rest.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Validations.name, schema: ValidationsSchema }]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'access-control',
        transport: Transport.GRPC,
        options: {
          url: `${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`,
          package: 'app',
          protoPath: join(
            __dirname,
            '../../../src/proto/access-control/access-control.proto',
          ),
        },
      },
    ]),
  ],
  exports: [],
  controllers: [ValidationController],
  providers: [
    ValidationsRepositoryImpl,
    ValidationService,
  ],
})
export class ValidationsModule { }
