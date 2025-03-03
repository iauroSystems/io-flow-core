import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProcessDefinitionDto, UpdateProcessDefinitionDto, GetProcessDefinitionDto, GetProcessDefinitionQueryDto, DefaultProcessDefinitionDto } from './dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { UpdateStageBody, UpdateStageParams } from './dtos/update-stage.dto';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { LogEntities, Operations, Paths } from 'src/common/const/constants';
import { Mappings } from 'src/common/const/BPMN-mappings';
import { CommonHeadersDto } from 'src/shared/dtos';
import { Compiler } from '../process-instances/providers';
import { StagesSchema } from './joi-validations/create-process-definition.joi';
import * as _ from 'lodash';
import sanitize from 'sanitize-filename';
import { DeleteProcessDefinitionDto } from './dtos/delete-process-definition.dto';
import { endpointToString } from '@grpc/grpc-js/build/src/subchannel-address';

const convert = require('xml-js');

@Injectable()
export class ProcessDefinitionService {
  private readonly logger: Logger = new Logger(ProcessDefinitionService.name);

  constructor (
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private audits: Audits,
    private compiler: Compiler,
  ) { }

  /**
   * checks duplicate key in an array of objects
   * @param key {string} - key to be checked, e.g. "k3"
   * @param arr {object} - target array, e.g. [{key: "k1"}, {key: "k2"}]
   * @returns {boolean} e.g. true/false
   */
  private checkDuplicateKey(key, arr) {
    let map = {};
    let isDup = false;
    for (let i = 0; i < arr.length; i++) {
      let obj = arr[i];
      if (map[obj[key]]) {
        isDup = true;
        break;
      }
      map[obj[key]] = true;
    }
    return isDup;
  }

  /**
   * It verifies the compound task properties with the properties of the attached process definition
   * @param definition {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {undefined/object} - Error array, e.g. [{taskKey: "", processDefinitionKey: "", parameterKey: "", error: ""}]
   */
  // private async verifyCompoundTaskParams(definition) {
  //   const compoundTasks = definition.stages.filter(stage => stage.subType === Constants.STAGE_SUB_TYPES.COMPOUND_TASK && (stage.processDefinitionId || stage.processDefinitionKey));
  //   const childProcessDefinitionKeys = compoundTasks.map(stage => stage.processDefinitionKey);
  //   const compObject = compoundTasks.reduce(
  //     (obj, item) => Object.assign(obj, { [item.processDefinitionKey]: { key: item.key, properties: item.properties } }), {})
  //   const childDef = await this.processDefinitionRepositoryImpl.find({ key: childProcessDefinitionKeys, properties: { $exists: true, $ne: [] } }, { key: 1, properties: 1 });
  //   const errors = [];
  //   childDef.forEach(def => {
  //     const propObj = compObject[def.key].properties.reduce(
  //       (obj, item) => Object.assign(obj, { [item.key]: item.value?.default }), {});
  //     def.properties.forEach(p => {
  //       if ((p.value.required === true || p.value.required as any === 'true') && !propObj[p.key]) {
  //         errors.push({ taskKey: compObject[def.key].key, processDefinitionKey: def.key, parameterKey: p.key, error: 'default value must be set for the input parameters which are required for child workflow' })
  //       }
  //     });

  //   });
  //   if (errors[0]) {
  //     return errors;
  //   }
  // }

  /**
   * Validate the individual stage schema
   * @param createProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {undefined/string} - Error, e.g. "Error for key [k1] and subType [user-task] : [Invalid datatype]"
   */
  private async validateStages(createProcessDefinitionDto: CreateProcessDefinitionDto) {
    if (!createProcessDefinitionDto.stages.length) {
      return `The stages array must have at least one element.`;
    }
    for (let i = 0; i < createProcessDefinitionDto.stages.length; i++) {
      const stage = createProcessDefinitionDto.stages[i];
      const stageSubType = stage.subType;
      const validationResult = StagesSchema?.[stageSubType]?.validate(stage);
      if (validationResult?.error) {
        return `Error for key [${stage?.key}] and subType [${stageSubType}] : [${validationResult?.error?.details?.[0]?.message}]`;
      }
    }
    return;
  }

  /**
   * Create a process definition record in database
   * @param headers {object} - Defined request headers  
   * @param createProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async create(headers: CommonHeadersDto, createProcessDefinitionDto: CreateProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    const uniqueStageIdentifier = 'key';
    if (this.checkDuplicateKey(uniqueStageIdentifier, createProcessDefinitionDto.stages)) {
      throw new CustomError(HttpStatus.BAD_REQUEST, `[${uniqueStageIdentifier}] must be unique within [stages] array`);
    }

    //validates the process-definition-stages schema
    const stagesValidationResult = await this.validateStages(createProcessDefinitionDto);
    if (stagesValidationResult) {
      throw new CustomError(HttpStatus.BAD_REQUEST, stagesValidationResult);
    }

    // const compoundTaskValidate = await this.verifyCompoundTaskParams(createProcessDefinitionDto);
    // if (compoundTaskValidate) {
    //   throw new CustomError(HttpStatus.BAD_REQUEST, 'Error in compound tasks [properties]', compoundTaskValidate);

    // }

    let workflow = await this.processDefinitionRepositoryImpl.findOne({ key: createProcessDefinitionDto.key }, {}, { version: -1 });
    if (workflow) {
      createProcessDefinitionDto['version'] = workflow.version + 1;
      const updatedProcessDefinition = { ...createProcessDefinitionDto, ...workflow };
      const data = await this.processDefinitionRepositoryImpl.create(updatedProcessDefinition);
      this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.CREATE);
      this.updateCompiledDefinition(data);
      return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_CREATED_NEW_VERSION, data);
    }

    createProcessDefinitionDto['version'] = 1;
    const data = await this.processDefinitionRepositoryImpl.create(createProcessDefinitionDto);
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.CREATE);
    this.updateCompiledDefinition(data);
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED, data);
  }

  /**
   * Add a compiled process definition in the root process definition
   * @param processDefinition {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   */
  private async updateCompiledDefinition(processDefinition) {
    const compiledWorkflow = await this.compiler.compileV2(processDefinition);
    await this.processDefinitionRepositoryImpl.update({ _id: processDefinition._id }, { _compiledDefinition: compiledWorkflow });
  }

  /**
   * Update a process definition record by id in database
   * @param headers {object} - Defined request headers 
   * @param id {string} - _id of the mongo document
   * @param updateProcessDefinitionDto {object} - Process definiton object, e.g. {name: "", key: "",properties: [], stages:[], ...}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async update(headers: CommonHeadersDto, id: string, updateProcessDefinitionDto: UpdateProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    const workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: id });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    const uniqueStageIdentifier = 'key';
    if (this.checkDuplicateKey(uniqueStageIdentifier, updateProcessDefinitionDto.stages)) {
      throw new CustomError(HttpStatus.BAD_REQUEST, `[${uniqueStageIdentifier}] must be unique within [stages] array`);
    }
    // updateProcessDefinitionDto['version'] = workflow.version + 1;
    const data = await this.processDefinitionRepositoryImpl.update({ _id: id }, updateProcessDefinitionDto);
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.UPDATE);
    this.updateCompiledDefinition(data);
    return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, data);
  }

  /**
   * Update a stage by processDefinitionId and stageId
   * @param headers {object} - Defined request headers 
   * @param params {object} - Defined query params 
   * @param stage {object} - Stage object 
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async updateStage(headers: CommonHeadersDto, params: UpdateStageParams, stage: UpdateStageBody): Promise<CustomResponse | CustomError> {
    const condition = { _id: params.processDefinitionId, 'stages._id': params.stageId };
    const workflow = await this.processDefinitionRepositoryImpl.findOne(condition);
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    const setValues = {
      ...(stage.description && { 'stages.$.description': stage.description }),
      ...(stage.processDefinitionId && { 'stages.$.processDefinitionId': stage.processDefinitionId }),
      ...(stage.conditions?.length && { 'stages.$.conditions': stage.conditions }),
      ...(stage.assignee?.length && { 'stages.$.assignee': stage.assignee }),
      ...(stage.criteria && { 'stages.$.criteria': stage.criteria }),
      ...(stage.connector && { 'stages.$.connectorId': stage.connector }),
      ...(stage.nextStages && { 'stages.$.nextStages': stage.nextStages }),
      ...(stage.type && { 'stages.$.type': stage.type }),
      ...(stage.subType && { 'stages.$.subType': stage.subType })
    };
    const data = await this.processDefinitionRepositoryImpl.updateStage(condition, setValues);
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.UPDATE);
    return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, data);
  }

  /**
   * Find a list of definitions with pagination, filters, search option
   * @param query {object} - Query params object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAll(query: GetProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }


      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (let key in search) {
          if (search.hasOwnProperty(key)) {
            let obj = {};
            const safeKey = _.escapeRegExp(search[key]);
            obj[key] = { $regex: new RegExp(safeKey, 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      this.logger.error(err);

      throw new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`);
    }
    if (!condition.$and.length) {
      condition = {};
    }

    const count = await this.processDefinitionRepositoryImpl.count(condition);
    const data = await this.processDefinitionRepositoryImpl.find(condition, {}, query.page, query.size, sort || { $natural: -1 });
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
  }

  /**
   * Find a process deifnition by _id
   * @param id {string} - _id of the mongo document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOne(id: string): Promise<CustomResponse | CustomError> {
    let condition = { _id: id };
    const workflow = await this.processDefinitionRepositoryImpl.findOne(condition);
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, workflow);
  }

  /**
   * Find a process deifnition by key
   * @param key {string} - Process definiton key
   * @param query {object} - Query params object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOneByKey(key: string, query: GetProcessDefinitionQueryDto): Promise<CustomResponse | CustomError> {
    let condition = {
      key, ...(query.version && { version: query.version }),
    };
    const workflow = await this.processDefinitionRepositoryImpl.findOne(condition, {}, { version: -1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, workflow);
  }

  /**
   * Upload a file
   * @param headers {object} - Defined request headers 
   * @param file {object} - file object
   * @returns {Promise} - CustomResponse, e.g. {statusCode: 200, message: "", result: {}}
   */
  async uploadProtoFile(headers: CommonHeadersDto, file) {
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { protoPath: file.filename });
  }

  /**
 * Upload a file
 * @param headers {object} - Defined request headers 
 * @param file {object} - file object
 * @returns {Promise} - CustomResponse, e.g. {statusCode: 200, message: "", reprotoPathsult: {}}
 */
  async uploadWsdlFile(headers: CommonHeadersDto, file) {
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { wsdlPath: `/src/shared/public/${file.filename}` });
  }

  /**
   * Upload a file
   * @param headers {object} - Defined request headers 
   * @param file {object} - file object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async uploadBPMNFile(headers: CommonHeadersDto, file) {
    const xml = require('fs').readFileSync(file.path, 'utf8');
    const options = { ignoreComment: true, alwaysChildren: true };
    const rawJson = convert.xml2js(xml, options); // or convert.xml2json(xml, options)

    // const businessFlowJson = this.bpmnJsonToNativeJson(rawJson);
    return this.bpmnToDataFlow(rawJson);
    // return this.create(headers, businessFlowJson);
  }

  /**
   * Convert bpmn json to native json
   * @param bpmnJson {object} - input bpmn json
   * @returns {object} - target json
   */
  bpmnJsonToNativeJson(bpmnJson) {

    let bpmnProcessJson = bpmnJson.elements[0]['elements'][0];
    let targetProcessJSON: CreateProcessDefinitionDto = {
      name: bpmnProcessJson.attributes.name || bpmnProcessJson.attributes.id,
      description: bpmnProcessJson.attributes.description || '',
      key: bpmnProcessJson.attributes.id,
      isParallel: false,
      stages: []
    };
    targetProcessJSON.stages = bpmnProcessJson.elements.map(ele => {
      if (Mappings.StageMappings[ele.name]) {
        let stage = { ...Mappings.StageMappings[ele.name] };
        stage.key = ele?.attributes.id;
        stage.name = ele?.attributes.name || ele?.attributes.id;
        stage.description = ele.attributes.description || ele.name;
        const nextStages = bpmnProcessJson.elements.filter(linkObj => linkObj.name === 'bpmn2:sequenceFlow' && linkObj.attributes.sourceRef === ele.attributes.id).map(obj => obj.attributes.targetRef);
        // stage.properties = ele.elements.find(obj => obj.name === 'bpmn2:extensionElements')?.elements.find(obj => obj.name === 'camunda:connector')?.elements.find(obj => obj.name === 'camunda:inputOutput')?.elements.map(obj => {

        //   return {
        //     key: obj.attributes.name,
        //     value: {
        //       type: 'string',
        //       default: ''
        //     }
        //   };

        // }).filter(obj => obj);

        stage.nextStages = nextStages;
        // temporary code -
        if (stage.type === 'gateway') {
          stage.nextStages = nextStages.splice(0, 1);
        }
        if (ele.name === 'bpmn2:callActivity') {
          stage.processDefinitionKey = ele.elements.find(extEle => extEle.name = 'bpmn2:extensionElements')?.elements.find(obj => obj.name === 'zeebe:calledElement')?.attributes?.processId;
        }
        return stage;
      }
    }).filter(obj => obj?.key);
    return targetProcessJSON;
  }

  bpmnToDataFlow(bpmnJson) {

    let bpmnProcessJsonNodes = bpmnJson.elements[0]['elements'][0];
    let bpmnProcessJsonDiagram = bpmnJson.elements[0]['elements'][1]['elements'][0];

    const dataflow = {
      name: bpmnProcessJsonNodes.attributes.name || bpmnProcessJsonNodes.attributes.id,
      nodes: [],
      flowchart: []
    };
    const nodeKeyMapping = {};
    const edges = {};

    dataflow.nodes = bpmnProcessJsonNodes.elements.map(ele => {
      if (ele.name === "bpmn2:sequenceFlow") {
        edges[ele?.attributes.id] = ele?.attributes;
        return;
      } else {
        let stage = { ...Mappings.StageMappings[ele.name] };
        let oldNode = { ...Mappings.NodeMappings[ele.name] };
        let node = JSON.parse(JSON.stringify(oldNode));
        node.connector_id = stage.type;
        node.name = ele?.attributes.name || ele?.attributes.id;
        node.type = stage.type;
        node['description'] = stage.subType;
        node.node_id = ele?.attributes.id;
        node.properties = [
          {
            "key": "tags",
            "value": "[]"
          },
          {
            "key": "name",
            "value": ele?.attributes.name || ele?.attributes.id
          },
          {
            "key": "key",
            "value": ele?.attributes.id
          },
          {
            "key": "description",
            "value": ele?.attributes.name
          },
          {
            "key": "assignee",
            "value": ""
          },
          {
            "key": "subType",
            "value": stage.subType
          },
          {
            "key": "displayName",
            "value": ele?.attributes.name
          },

          {
            "key": "config",
            "value": ""
          }
        ];
        nodeKeyMapping[ele?.attributes.id] = node;
        return node;
      }

    }).filter(obj => obj?.type);

    dataflow.flowchart = bpmnProcessJsonDiagram.elements.map(ele => {
      if (ele.name === "bpmndi:BPMNShape") {
        let oldNode = { ...Mappings.DiagramMapping[nodeKeyMapping[ele.attributes.bpmnElement]?.description] };
        let node = JSON.parse(JSON.stringify(oldNode));
        if (ele.attributes.bpmnElement) {
          node.id = ele.attributes.bpmnElement;
          node.position = {
            x: parseInt(ele?.elements[0].attributes.x),
            y: parseInt(ele?.elements[0].attributes.y),
          }
          node.data.props.text = nodeKeyMapping[ele.attributes.bpmnElement].name;
          node.data.props.displayName = nodeKeyMapping[ele.attributes.bpmnElement].name;


        }

        return node;
      }
      if (ele.name === "bpmndi:BPMNEdge") {
        return {
          id: ele.attributes.bpmnElement,
          connector_id: "",
          target: edges[ele.attributes.bpmnElement].targetRef,
          source: edges[ele.attributes.bpmnElement].sourceRef,
          type: "smoothstep",
          labelBgStyle: {
            fill: "#0F1013",
            color: "#0F1013"
          },
          labelStyle: {
            fill: "#E6E6E6",
            fontWeight: 700
          },
          arrowHeadType: "arrowclosed",
          style: {
            strokeWidth: 2.5
          }
        };
        // console.log("$$$$$$$$$ EDGE node ", node);


      }
    });
    return dataflow;

  }

  async deleteProcessDefinitions(headers: CommonHeadersDto, queryDto: DeleteProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    if (queryDto?.startVersion > queryDto?.endVersion) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.START_END_VERSION_ERROR);
    }
    let condition = {
      key: queryDto.key,
      version: { $gte: queryDto.startVersion, $lte: queryDto.endVersion }
    }
    try {
      const result = await this.processDefinitionRepositoryImpl.deleteBulk(condition);

      return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
    } catch (error) {
      this.logger.error(error);
      return new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, CustomMessages.FAILURE);
    }
  }

  async updateDefinition(headers: CommonHeadersDto, id: string, updateProcessDefinitionDto: DefaultProcessDefinitionDto): Promise<CustomResponse | CustomError> {
    const workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: id });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }

    // updateProcessDefinitionDto['version'] = workflow.version + 1;
    const data = await this.processDefinitionRepositoryImpl.update({ _id: id }, { default: updateProcessDefinitionDto.default });
    this.processDefinitionRepositoryImpl.updateMany({ key: workflow.key, _id: { $ne: id } }, { default: false });
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.UPDATE);
    return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, updateProcessDefinitionDto);
  }

}
