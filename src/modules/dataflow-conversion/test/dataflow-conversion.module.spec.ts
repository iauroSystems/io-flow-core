import { DataflowConversionController } from "../dataflow-conversion.rest.controller";
import { DataflowConversionService } from "../dataflow-conversion.service";
import { DataflowConversionModule } from "../dataflow-conversion.module";
import { Test } from "@nestjs/testing";


describe( 'DataflowConversionModule', () => {
    let dataflowConversionService: DataflowConversionService;
    let dataflowConversionController: DataflowConversionController;


    beforeEach( async () => {
        const moduleRef = await Test.createTestingModule( {
            imports: [ DataflowConversionModule ],
            providers: [ DataflowConversionService ],
            controllers: [ DataflowConversionController]
        } ).compile();

        expect( moduleRef ).toBeDefined();
        dataflowConversionService = moduleRef.get<DataflowConversionService>( DataflowConversionService );
        dataflowConversionController = moduleRef.get<DataflowConversionController>( DataflowConversionController );
        
    } );

    describe( 'DataflowConversionService', () => {
        it( 'should be defined', () => {
            expect( dataflowConversionService ).toBeDefined();
        } );
    } );

    describe( 'DataflowConversionController', () => {
        it( 'should be defined', () => {
            expect( dataflowConversionController ).toBeDefined();
        } );
    } );

} );