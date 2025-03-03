import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto, GetProcessInstanceQueryDto, StartProcessInstanceBodyDto, GetProcessInstanceStatsQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceQueryDto, GetProcessInstanceStageStatsQueryDto } from './dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { Compiler } from './providers/compiler';
import { Constants, LogEntities, Operations } from 'src/common/const/constants';
import { WebhookConnector } from '../webhooks/providers/webhook.connector';
import { Webhooks } from 'src/common/const/enums';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { CommonHeadersDto } from 'src/shared/dtos';
import * as moment from 'moment';
import { Types } from 'mongoose';
import * as _ from 'lodash';
import { CustomRpcException, mapHttpStatusToGrpcStatus } from 'src/common/exceptions/custom-grpc-error';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
import { Transform } from 'src/common/utils';
import { ExecutorService } from '../executor/executor.service';
@Injectable()
export class ProcessInstanceService {
  private readonly logger: Logger = new Logger(ProcessInstanceService.name);

  constructor (
    private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private compiler: Compiler,
    private execute: ExecutorService,
    private webhook: WebhookConnector,
    private audits: Audits,
    private transform: Transform,

  ) { }

  /**
   * Create a process instance by process definition id
   * @param headers {object} - Defined request headers  
   * @param processDefinitionId {string} - _id of the process definition document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */


  async createByDefinitionId(headers: CommonHeadersDto, processDefinitionId: string, query: GetOneProcessInstanceQueryDto, grpcCall?: boolean): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: processDefinitionId, ...(query.version && { version: query.version }) }, { name: 1, key: 1, stages: 1, version: 1 }, { version: -1 });
    if (!workflow) {
      if (grpcCall) {
        throw new CustomRpcException(mapHttpStatusToGrpcStatus(HttpStatus.BAD_REQUEST), CustomMessages.WORKFLOW_NOT_EXISTS);
      }
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(compiledWorkflow);
    this.webhook.callWebhook(Webhooks.CREATE_INSTANCE, data);
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.CREATE);
    if (grpcCall) {
      return new CustomGrpcResponse(mapHttpStatusToGrpcStatus(HttpStatus.CREATED), CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
    }
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
  }

  /**
   * Create a process instance by process definition key & version
   * @param headers {object} - Defined request headers
   * @param query {object} - Defined query params 
   * @param key {string} - process definition key
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async createByDefinitionKey(headers: CommonHeadersDto, query: GetOneProcessInstanceQueryDto, key: string, grpcCall?: boolean): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    let workflow = null;
    if (query.version) {
      workflow = await this.processDefinitionRepositoryImpl.findOne({ key, version: query.version }, { name: 1, key: 1, stages: 1, version: 1 });
    } else {
      workflow = await this.processDefinitionRepositoryImpl.findOne({ key, default: true }, { name: 1, key: 1, stages: 1, version: 1 });
      if (!workflow) {
        workflow = await this.processDefinitionRepositoryImpl.findOne({ key }, { name: 1, key: 1, stages: 1, version: 1 }, { version: -1 });
      }
    }

    if (!workflow) {
      if (grpcCall) {
        throw new CustomRpcException(mapHttpStatusToGrpcStatus(HttpStatus.BAD_REQUEST), CustomMessages.WORKFLOW_NOT_EXISTS);
      }
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(compiledWorkflow);
    this.webhook.callWebhook(Webhooks.CREATE_INSTANCE, data);
    this.audits.pushAuditLogs(headers, LogEntities.PROCESS_DEF, data, Operations.CREATE);
    if (grpcCall) {
      return new CustomGrpcResponse(mapHttpStatusToGrpcStatus(HttpStatus.CREATED), CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
    }
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
  }

  /**
   * Start the process instance by process instance id
   * @param processInstanceId {string} - _id of the process instance document
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async start(processInstanceId: string, processInstanceBody: StartProcessInstanceBodyDto, grpcCall?: boolean): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    const processInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId, status: Constants.STAGE_STATUSES.ACTIVE });
    if (!processInstance) {
      if (grpcCall) {
        throw new CustomRpcException(mapHttpStatusToGrpcStatus(HttpStatus.BAD_REQUEST), CustomMessages.PROCESS_INSTANCE_NOT_FOUND);
      }
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.PROCESS_INSTANCE_NOT_FOUND);
    }

    this.execute.startFlow(processInstance, processInstanceBody);

    // mark current task as complete
    // GoTo next stage
    // mark next task as active
    // this.execute.goToNextStage(processInstance, taskDetails.nextStage);
    if (grpcCall) {
      return new CustomGrpcResponse(mapHttpStatusToGrpcStatus(HttpStatus.CREATED), CustomMessages.PROCESS_INSTANCE_STARTED);
    }
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_STARTED);
  }

  /**
   * Update the instance parameters by instance id
   * @param processInstanceId {string} - _id of the process instance document
   * @param updateProcessInstanceDto {object} - Input payload required to update an instance, e.g. {parameters: {}}
   * @param query {object} - Defined query params 
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async updateInstances(processInstanceId: string, updateProcessInstanceDto: UpdateProcessInstanceDto, query: UpdateProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    const workflow = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { parameters: 1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    const updatedProcessInstance = { ...workflow.parameters, ...updateProcessInstanceDto.parameters };

    let data = null;
    if (query.cascade === 'true') {
      data = await this.processInstanceRepositoryImpl.updateMany({ rootProcessInstanceId: processInstanceId }, { parameters: updatedProcessInstance });
    } else {
      data = await this.processInstanceRepositoryImpl.updateOne({ _id: processInstanceId }, { parameters: updatedProcessInstance });
    }

    return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, data);
  }

  /**
   * List all the process instances by process definition id
   * @param processDefinitionId {string} - _id of the process definition document
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getInstancesByDefinitionId(processDefinitionId: string, query: GetProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    let condition = { processDefinitionId };
    return this.findAll(condition, query);
  }

  /**
  * List all the process instances by process definition key
  * @param processDefinitionKey {string} - key of the process definition
  * @param query {object} - Defined query params
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async getInstancesByDefinitionKey(processDefinitionKey: string, query: GetProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    let condition = { processDefinitionKey };
    return this.findAll(condition, query);
  }

  /**
   * Generic findAll method to list the process isnatnces
   * @param rootCondition {object} - mongo condition
   * @param query {object} - Defined query params
   * @returns  {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAll(rootCondition: any, query: GetProcessInstanceQueryDto): Promise<CustomResponse | CustomError> {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    let customFilters = null;
    let projection = {};
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }
      if (query?.projection) {
        const proj = JSON.parse(query.projection);
        projection = this.transform.getProjection(proj);
      } else {
        projection = { processDefinitionId: 1, version: 1, name: 1, timeActivated: 1, timeCompleted: 1, status: 1 };
      }

      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        if (customFilters.startDate && customFilters.endDate) {
          condition.$and.push({ createdAt: { $gte: moment(customFilters.startDate).startOf('day'), $lt: moment(customFilters.endDate).endOf('day') } })
        }
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (let key in search) {
          if (search.hasOwnProperty(key)) {
            let obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') }
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
    condition.$and.push(rootCondition);
    const count = await this.processInstanceRepositoryImpl.count(condition);
    const data = await this.processInstanceRepositoryImpl.find(condition, projection, query.page, query.size, sort || { $natural: -1 });
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
  }

  /**
   * Find a process instance by process instance id
   * @param id {string} - _id of the process instance document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOne(id: string): Promise<CustomResponse | CustomError> {
    const defaultProjection = { _startIndex: 0, _endIndex: 0, _flags: 0, _stageIndexJSON: 0 }

    const workflow = await this.processInstanceRepositoryImpl.findOne({ _id: id }, defaultProjection);
    if (workflow) {
      return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, workflow);
    } else {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
  }

  /**
   * Get the statistics of the process instances by process definition id
   * @param processDefinitionId {string} - _id of the process definition document
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStatsByDefinitionId(processDefinitionId: string, query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    let condition = { processDefinitionId };
    return this.getStats('processDefinitionId', condition, query);
  }

  /**
   * Get the statistics of the process instances by process definition key
   * @param processDefinitionKey {string} - key of the process definition
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStatsByDefinitionKey(processDefinitionKey: string, query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    let condition = {
      processDefinitionKey, ...(query.version && { version: query.version }),
    };
    return this.getStats('processDefinitionKey', condition, query);
  }

  /**
   * Generic method for stats
   * @param groupBy {string} - group the instances by processDefinitionId/processDefinitionKey
   * @param _condition {object} - Mongo condition
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStats(groupBy: string, _condition: any, query: GetProcessInstanceStatsQueryDto): Promise<CustomResponse | CustomError> {
    let customFilters = null;
    let filters = null;
    let condition: any = { $and: [_condition] };
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }
      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        if (customFilters.startDate && customFilters.endDate) {
          condition.$and.push({ createdAt: { $gte: moment(customFilters.startDate).startOf('day').toDate(), $lt: moment(customFilters.endDate).endOf('day').toDate() } })
        }
      }
      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (let key in search) {
          if (search.hasOwnProperty(key)) {
            let obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') }
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }
    } catch (err) {
      this.logger.error(err);
      throw new CustomError(HttpStatus.BAD_REQUEST, ` [filters/search] ${CustomMessages.INVALID_JSON}`);
    }

    const pipeline = [
      {
        $match: condition
      },
      {
        $group: {
          _id: `$${groupBy}`,
          waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          on_hold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          all: { $sum: 1 },
        },
      }];
    const stats = await this.processInstanceRepositoryImpl.aggregate(pipeline);
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, stats[0]);
  }

  /**
   * Create an instance and start by using process definition id
   * @param headers {object} - Defined request headers  
   * @param processDefinitionId {string} - _id of the process definition document
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async runByDefinitionId(headers: CommonHeadersDto, processDefinitionId: string, processInstanceBody: CreateProcessInstanceDto, grpcCall?: boolean): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: processDefinitionId }, { _compiledDefinition: 1 });
    if (!workflow) {
      if (grpcCall) {
        throw new CustomRpcException(mapHttpStatusToGrpcStatus(HttpStatus.BAD_REQUEST), CustomMessages.WORKFLOW_NOT_EXISTS);
      }
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    // let [isValid, error] = [null, null];
    // if (processInstanceBody?.parameters || processInstanceBody?.validationId && Object.keys(processInstanceBody?.parameters).length) {
    //   [isValid, error] = await this.validationService.validateParameters(processInstanceBody?.validationId, processInstanceBody?.parameters);
    //   if (!(isValid)) {
    //     throw new CustomError(HttpStatus.BAD_REQUEST, error);
    //   }
    // }
    const newInstanceId = new Types.ObjectId();
    this.runFlow({
      _compiledDefinition: workflow._compiledDefinition
    }, newInstanceId, processInstanceBody);
    if (grpcCall) {
      return new CustomGrpcResponse(mapHttpStatusToGrpcStatus(HttpStatus.CREATED), CustomMessages.PROCESS_INSTANCE_RUNNING, { _id: newInstanceId });
    }
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING, { _id: newInstanceId });
  }

  /**
   * Create an instance and start by using process definition key
   * @param headers {object} - Defined request headers  
   * @param query {object} - Defined query params
   * @param key {string} - key of the process definition
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async runByDefinitionKey(headers: CommonHeadersDto, query: GetOneProcessInstanceQueryDto, key: string, processInstanceBody: CreateProcessInstanceDto, grpcCall?: boolean): Promise<CustomResponse | CustomError | CustomGrpcResponse> {
    let workflow = null;
    if (query.version) {
      workflow = await this.processDefinitionRepositoryImpl.findOne({ key, version: query.version }, { _compiledDefinition: 1, version: 1 });
    } else {
      workflow = await this.processDefinitionRepositoryImpl.findOne({ key, default: true }, { _compiledDefinition: 1, version: 1 });
      if (!workflow) {
        workflow = await this.processDefinitionRepositoryImpl.findOne({ key }, { _compiledDefinition: 1, version: 1 }, { version: -1 });
      }
    }
    if (!workflow) {
      if (grpcCall) {
        throw new CustomRpcException(mapHttpStatusToGrpcStatus(HttpStatus.BAD_REQUEST), CustomMessages.WORKFLOW_NOT_EXISTS);
      }
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    // let [ isValid, error ] = [ null, null ];
    // if ( processInstanceBody?.validationId ) {
    //   [ isValid, error ] = await this.validationService.validateParameters( processInstanceBody?.validationId, processInstanceBody?.parameters );
    //   if ( !( isValid ) ) {
    //     throw new CustomError( HttpStatus.BAD_REQUEST, error );
    //   }
    // }
    const newInstanceId = new Types.ObjectId();
    this.runFlow({
      // validationId: processInstanceBody?.validationId,
      _compiledDefinition: workflow._compiledDefinition
    }, newInstanceId, processInstanceBody);
    if (grpcCall) {
      return new CustomGrpcResponse(mapHttpStatusToGrpcStatus(HttpStatus.CREATED), CustomMessages.PROCESS_INSTANCE_RUNNING, { _id: newInstanceId });
    }
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING, { _id: newInstanceId });
  }

  /**
   * Generic function to run a process instance
   * @param workflow {object} - compiled process definition
   * @param newInstanceId {object} - _id for the instance in object form
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   */
  async runFlow(workflow, newInstanceId, processInstanceBody) {
    // const [isValid, error] = this.execute.validateParameters(workflow.properties, processInstanceBody?.parameters);
    // if (!(isValid && workflow._compiledDefinition)) {
    //   // If flow is started by the API call
    //   throw new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition');
    // }

    const now = Date.now();

    workflow._compiledDefinition._id = newInstanceId;
    workflow._compiledDefinition.rootProcessInstanceId = newInstanceId.valueOf();
    workflow._compiledDefinition.timeActivated = now;
    workflow._compiledDefinition.timeStarted = now;
    workflow._compiledDefinition.stages[workflow._compiledDefinition._startIndex].timeActivated = now;; // status of start stage

    const data = await this.processInstanceRepositoryImpl.create(workflow._compiledDefinition as any);
    this.execute.startFlow(data, processInstanceBody);
    // this.webhook.callWebhook(Webhooks.CREATE_INSTANCE, data);
  }

  /**
   * Get stage wise stats
   * @param query 
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getStageStats(query: GetProcessInstanceStageStatsQueryDto): Promise<CustomResponse | CustomError> {
    const definitionCond = { ...(query.processDefinitionId && { _id: query.processDefinitionId }), ...(query.processDefinitionKey && { key: query.processDefinitionKey }), ...(query.version && { version: query.version }) };
    let workflow = await this.processDefinitionRepositoryImpl.findOne(definitionCond, { name: 1, key: 1, version: 1, 'stages.key': 1, 'stages.name': 1 }, { version: -1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }

    const instanceCond = { ...(query.processDefinitionId && { processDefinitionId: query.processDefinitionId }), ...(query.processDefinitionKey && { processDefinitionKey: query.processDefinitionKey }), version: workflow.version };
    const pipeline = [
      {
        $match: instanceCond
      }, {
        $unwind: {
          path: '$stages',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $project: {
          key: '$stages.key',
          status: '$stages.status',
          name: '$stages.name'
        }
      }, {
        $group: {
          _id: '$key',
          waiting_count: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          started_count: { $sum: { $cond: [{ $eq: ['$status', 'started'] }, 1, 0] } },
          active_count: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          error_count: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } }

        }
      }];
    const stats = await this.processInstanceRepositoryImpl.aggregate(pipeline);
    const parsedWorkflow = JSON.parse(JSON.stringify(workflow));
    parsedWorkflow.stages.forEach(stage => {
      stage['count'] = stats.find(obj => {
        if (obj._id === stage.key)
          return {
            waiting_count: obj.waiting_count,
            started_count: obj.started_count,
            active_count: obj.active_count,
            completed_count: obj.completed_count,
            error_count: obj.error_count
          };
      });
      return stage;
    })
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, parsedWorkflow);
  }




  /**
   * optimizing the sortworkflow function ...
   */



  sortWorkflow(keyWithNextKeyTwo: any[]) {

    const sortedWorkflow = [];
    const nextStageMap = new Map();
    keyWithNextKeyTwo.forEach((stage, index) => {
      nextStageMap.set(stage.key, stage);
    })
    let startingStage = null;
    nextStageMap.forEach((stage, key) => {
      if (stage.subType === 'start') {
        startingStage = stage;
        return;
      }
    })
    if (!startingStage) {
      throw new Error('Starting stage not found');
    }

    let currentStage = startingStage;
    while (currentStage) {
      sortedWorkflow.push(currentStage);
      if (currentStage.type === 'gateway' && currentStage.status === 'completed') {
        currentStage = nextStageMap.get(currentStage.onTrueNextStage);
      }
      else {
        currentStage = nextStageMap.get(currentStage.nextStages[0]);
      }
    }
    return sortedWorkflow;

  }




  helperConverter(element: any[]) {
    let helperModified = [];

    for (let i = 0; i < element.length; i++) {
      let stageObjectFiltered = {
        key: element[i].key,
        name: element[i].name,
        type: element[i].type,
        nextStages: element[i].nextStages,
        subType: element[i].subType,
        status: element[i].status,
        onTrueNextStage: null
      }
      if (element[i].conditions.length > 0) {
        stageObjectFiltered.onTrueNextStage = element[i].conditions[0].onTrueNextStage
      }
      helperModified.push(
        stageObjectFiltered
      )
    }
    return helperModified
  }





  keepNameofStages(sortedProcessInstancesStages) {
    let result = [];
    let key;
    sortedProcessInstancesStages.forEach((element) => {
      key = element.key;
      result.push(key);
    });
    return result;
  }

  async mostFollowedPath(processDefinitionId: string): Promise<CustomResponse | CustomError> {
    try {
      let processInstancesStages = await this.getInstancesByDefinitionIdPathFinder(processDefinitionId);
      let sortedStagesNamesProcessInstances = [];
      let sortedProcessInstancesStages = [];
      for (let i = 0; i < processInstancesStages.length; i++) {
        let keyWithNextKeyTwo = this.helperConverter(processInstancesStages[i]);
        let sortedWorkflowFromWorkflows = this.sortWorkflow(keyWithNextKeyTwo);
        let sortedStagesNames = this.keepNameofStages(
          sortedWorkflowFromWorkflows,
        );
        sortedStagesNamesProcessInstances.push(sortedStagesNames);
        sortedProcessInstancesStages.push(sortedWorkflowFromWorkflows);
      }


      const pathCounts = new Map<string, number>();

      // Count the occurrences of each path
      sortedStagesNamesProcessInstances.forEach((path) => {
        const pathString = path.join(' > ');
        if (pathCounts.has(pathString)) {
          pathCounts.set(pathString, pathCounts.get(pathString)! + 1);
        } else {
          pathCounts.set(pathString, 1);
        }
      });
      // Find the most followed path
      let mostFollowedPath = '';
      let highestCount = 0;

      pathCounts.forEach((count, path) => {
        if (count > highestCount) {
          highestCount = count;
          mostFollowedPath = path;
        }
      });
      return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { mostFollowedPath });
    } catch (err) {
      this.logger.error(err);
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST);
    }
  }


  async getInstancesByDefinitionIdPathFinder(processDefinitionId: string): Promise<any> {
    let condition = { processDefinitionId };
    let requiredData = await this.findInstancesForPath(condition)
    let onlyStagesInstanceId = [];
    requiredData.forEach((element) => {
      onlyStagesInstanceId.push(
        element.stages
      )
    })
    return onlyStagesInstanceId;
  }


  async findInstancesForPath(rootCondition: any): Promise<any> {
    let condition: any = { $and: [] };
    let sort = null;

    condition.$and.push(rootCondition);
    const defaultProjection = { _startIndex: 0, _endIndex: 0, _flags: 0, _stageIndexJSON: 0 };
    const data = await this.processInstanceRepositoryImpl.find(condition, defaultProjection, sort || { $natural: -1 });
    return data;
  }
}
