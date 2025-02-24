import { Module } from '@nestjs/common';
import { DataflowConversionService } from './dataflow-conversion.service';
import { DataflowConversionController } from './dataflow-conversion.rest.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
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
  controllers: [DataflowConversionController],
  providers: [DataflowConversionService],
  exports: [DataflowConversionService]
})
export class DataflowConversionModule { }
