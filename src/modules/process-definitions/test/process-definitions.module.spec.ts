import { Module } from "@nestjs/common";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { TenancyModule } from "src/databases/mongo-tenancy";
import { ProcessDefinition, ProcessDefinitionSchema } from "src/models/process-definitions/process-definitions.schema";
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { Audits } from "src/shared/clients/audit-service/audit-service.provider";
import { GrpcConnector } from "src/shared/connectors";
import { Compiler } from "../../process-instances/providers";
import { ProcessDefinitionController } from "../process-definitions.rest.controller";
import { ProcessDefinitionService } from "../process-definitions.service";
import { ProcessDefinitionsModule } from "../process-definitions.module";
import { Test } from "@nestjs/testing";


describe( 'ProcessDefintionModule', () => {
    let service: ProcessDefinitionService;
    let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
    let controller: ProcessDefinitionController;


    beforeEach( async () => {
        const moduleRef = await Test.createTestingModule( {
            imports: [
                TenancyModule.forRoot( [{name: ProcessDefinition.name, schema: ProcessDefinitionSchema}] as any ),
                ProcessDefinitionsModule,
            ],
            providers: [
                ProcessDefinitionService,
                ProcessDefinitionRepositoryImpl,
                {
                    provide: getModelToken( ProcessDefinition.name ),
                    useValue: {},
                },
                GrpcConnector, Audits, Compiler
            ],
            controllers: [ ProcessDefinitionController]
        } ).compile();

        expect( moduleRef ).toBeDefined();
        service = moduleRef.get<ProcessDefinitionService>( ProcessDefinitionService );
        processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
        controller = moduleRef.get<ProcessDefinitionController>( ProcessDefinitionController );
        
    } );

    describe( 'ProcessDefinitionService', () => {
        it( 'should be defined', () => {
            expect( service ).toBeDefined();
        } );
    } );

    describe( 'ProcessDefinitionRepositoryImpl', () => {
        it( 'should be defined', () => {
            expect( processDefinitionRepository ).toBeDefined();
        } );
    } );

    describe( 'processDefinitionController', () => {
        it( 'should be defined', () => {
            expect( controller ).toBeDefined();
        } );
    } );

} );