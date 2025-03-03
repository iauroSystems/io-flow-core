import CustomResponse from 'src/common/providers/custom-response.service';
import { DataflowConversionService } from '../dataflow-conversion.service';
import { DataflowConversionController } from '../dataflow-conversion.rest.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateDataflowConversionDto } from '../dto/create-dataflow-conversion.dto';

const createDataflowConversionDto = new CreateDataflowConversionDto;
const mockService = {
    create: jest.fn()
}
describe('DataFlow Conversion', () => {
    let dataflowConversionController: DataflowConversionController;
    let dataflowConversionService: DataflowConversionService;
    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DataflowConversionController],
            providers: [ DataflowConversionService ]
        }).compile();
        dataflowConversionController = module.get<DataflowConversionController>(DataflowConversionController);
        dataflowConversionService = module.get<DataflowConversionService>(DataflowConversionService);
    });

    it('should be defined', () => {
        expect(dataflowConversionService).toBeDefined()
    })

    describe('create', () => {
        it('should return a workflowJSON with stages array and other properties', async () => {
            const createDataflowConversionDto = {
                name: 'Test workflow',
                _id: '123',
                criteria: { field1: 'value1' },
                assigneeConnector: { field2: 'value2' },
                nodes: [
                    {
                        node_id: 'node1',
                        name: 'Node 1',
                        key: 'test-key',
                        type: 'gateway',
                        description: 'Description 1',
                        properties: [
                            { key: 'subType', value: 'start' },
                            { key: 'processDefinitionKey', value: 'definition1' },
                            { key: 'mandatory', value: 'true' },
                            { key: 'connectorType', value: 'type2' },
                            { key: 'connectorConfiguration', value: {"config": {
                                'onTrueNextStage': true
                            }} },
                            { key: 'properties', value: '{"prop1":"value1","prop2":"value2"}' },
                            { key: 'tags', value: '["tag1", "tag2"]' },
                            { key: 'criteria', value: {}},
                            { key: 'customParams', value: {}},
                            { key: 'config', value: {"onTrueNextStage":true}}
                        ],
                    },
                    {
                        node_id: 'node2',
                        name: 'Node 2',
                        type: 'gateway',
                        description: 'Description 2',
                        properties: [
                            { key: 'subType', value: 'subtype2' },
                            { key: 'mandatory', value: 'false' },
                            { key: 'connectorType', value: 'type3' },
                            { key: 'connectorConfiguration', value: '{"config2":"value2"}' },
                            { key: 'properties', value: '{"prop3":"value3","prop4":"value4"}' },
                            { key: 'tags', value: '["tag1", "tag2"]' },
                            { key: 'criteria', value: {}},
                            { key: 'customParams', value: {}},
                            { key: 'config', value: {onTrueNextStage:true}}
                        ],
                    },
                ],
            };

            const result = await dataflowConversionService.create(createDataflowConversionDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return a workflowJSON with empty stages array if nodes array is empty', () => {
            const createDataflowConversionDto: CreateDataflowConversionDto = {
                name: 'Test Workflow',
                _id: '123',
                nodes: [],
                tags: [],
                project_id: '',
                pipeline_id: '',
                flowchart: []
            };

            const workflowJSON = dataflowConversionService.create(createDataflowConversionDto);
            expect(workflowJSON).toBeInstanceOf(CustomResponse);
        });
    });
})



