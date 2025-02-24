import { Module } from "@nestjs/common";
import { ProcessDefinition, ProcessDefinitionSchema } from "src/models/process-definitions/process-definitions.schema";
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { Audits } from "src/shared/clients/audit-service/audit-service.provider";
import { GrpcConnector } from "src/shared/connectors";
import { Compiler } from "../process-instances/providers";
import { ProcessDefinitionController } from "./process-definitions.rest.controller";
import { ProcessDefinitionService } from "./process-definitions.service";
import { MongooseModule } from "@nestjs/mongoose";


@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProcessDefinition.name, schema: ProcessDefinitionSchema }])
  ],
  controllers: [ProcessDefinitionController],
  providers: [ProcessDefinitionService, ProcessDefinitionRepositoryImpl, GrpcConnector, Audits, Compiler],
})
export class ProcessDefinitionsModule { }