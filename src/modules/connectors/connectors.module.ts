import { Module } from "@nestjs/common";
import { ConnectorController } from "./connectors.rest.controller";
import { ConnectorService } from "./connectors.service";
import { Connector, ConnectorSchema } from "src/models/connectors/connectors.schema";
import { ConnectorRepositoryImpl } from "src/models/connectors/repository/connectors.repository.impl";
import { ConnectorEvaluate } from "./providers/connector-evaluate";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Connector.name, schema: ConnectorSchema }]),
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
  controllers: [ConnectorController],
  providers: [ConnectorService, ConnectorRepositoryImpl, ConnectorEvaluate],
  exports: [ConnectorEvaluate]
})
export class ConnectorModule { }
