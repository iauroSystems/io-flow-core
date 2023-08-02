import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProcessDefinition, ProcessDefinitionSchema } from "src/models/process-definitions/process-definitions.schema";
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { GrpcConnector, OpenAIConnector } from "src/shared/connectors";
import { Compiler } from "../process-instances/providers";
import { ProcessDefinitionController } from "./process-definitions.rest.controller";
import { ProcessDefinitionService } from "./process-definitions.service";


@Module({
  imports: [MongooseModule.forFeature([{ name: ProcessDefinition.name, schema: ProcessDefinitionSchema }])],
  controllers: [ProcessDefinitionController],
  providers: [ProcessDefinitionService, ProcessDefinitionRepositoryImpl, GrpcConnector,OpenAIConnector, Compiler],
})
export class ProcessDefinitionsModule { }