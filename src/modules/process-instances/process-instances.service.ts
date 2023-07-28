import { HttpStatus, Injectable, Logger, Scope } from '@nestjs/common';
import { ProcessInstance, ProcessInstanceDocument } from 'src/models/process-instances/process-instances.schema';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto, GetProcessInstanceQueryDto, StartProcessInstanceBodyDto, GetProcessInstanceStatsQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceQueryDto } from './dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { Compiler } from './providers/compiler';
import { Constants, LogEntities, Operations } from 'src/common/const/constants';
import { Executor } from "src/modules/tasks/providers/executor";
import { Webhooks } from 'src/common/const/enums';
import { CommonHeadersDto } from 'src/shared/dtos';
import * as moment from 'moment';
import { Types } from 'mongoose';
import * as _ from 'lodash';
@Injectable()
export class ProcessInstanceService {
  private readonly logger: Logger = new Logger(ProcessInstanceService.name);

  constructor (
    private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private compiler: Compiler,
    private execute: Executor,

  ) { }

  /**
   * Create a process instance by process definition id
   * @param headers {object} - Defined request headers  
   * @param processDefinitionId {string} - _id of the process definition document
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async createByDefinitionId(headers: CommonHeadersDto, processDefinitionId: string): Promise<CustomResponse | CustomError> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: processDefinitionId }, { name: 1, key: 1, stages: 1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(compiledWorkflow);

    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
  }

  /**
   * Create a process instance by process definition key & version
   * @param headers {object} - Defined request headers
   * @param query {object} - Defined query params 
   * @param key {string} - process definition key
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async createByDefinitionKey(headers: CommonHeadersDto, query: GetOneProcessInstanceQueryDto, key: string): Promise<CustomResponse | CustomError> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ key, ...(query.version && { version: query.version }) }, { name: 1, key: 1, stages: 1, version: 1 }, { version: -1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const compiledWorkflow = this.compiler.compile(workflow, null, null);
    const data = await this.processInstanceRepositoryImpl.create(compiledWorkflow);

    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, { _id: data._id });
  }

  /**
   * Start the process instance by process instance id
   * @param processInstanceId {string} - _id of the process instance document
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async start(processInstanceId: string, processInstanceBody: StartProcessInstanceBodyDto): Promise<CustomResponse | CustomError> {
    const processInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId, status: Constants.STAGE_STATUSES.ACTIVE }, { stages: 1, _startIndex: 1, isParallel: 1, properties: 1, status: 1 });
    if (!processInstance) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.PROCESS_INSTANCE_NOT_FOUND);
    }
    const [isValid, error] = this.execute.validateParameters(processInstance.properties, processInstanceBody?.parameters);
    if (!(isValid)) {
      // If flow is started by the API call
      throw new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition');
    }

    await this.execute.startFlow(processInstance, processInstanceBody);

    // mark current task as complete
    // GoTo next stage
    // mark next task as active
    // this.execute.goToNextStage(processInstance, taskDetails.nextStage);
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
    if (query.cascade === 'true') { // if cascade true then update all the child instances including the parent
      data = await this.processInstanceRepositoryImpl.updateMany({ rootProcessInstanceId: processInstanceId }, { parameters: updatedProcessInstance });
    } else {  // if cascade false then update only the instance which matches the process instance id
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
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
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
            const safeKey = _.escapeRegExp(search[key]);
            obj[key] = { $regex: new RegExp(safeKey, 'i') }
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

    const defaultProjection = { _startIndex: 0, _endIndex: 0, _flags: 0, _stageIndexJSON: 0 };

    const count = await this.processInstanceRepositoryImpl.count(condition);
    const data = await this.processInstanceRepositoryImpl.find(condition, defaultProjection, query.page, query.size);
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
            const safeKey = _.escapeRegExp(search[key]);
            obj[key] = { $regex: new RegExp(safeKey, 'i') }
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
  async runByDefinitionId(headers: CommonHeadersDto, processDefinitionId: string, processInstanceBody: StartProcessInstanceBodyDto): Promise<CustomResponse | CustomError> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: processDefinitionId }, { _compiledDefinition: 1, properties: 1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const [isValid, error] = this.execute.validateParameters(workflow.properties, processInstanceBody?.parameters);
    if (!(isValid && workflow._compiledDefinition)) {
      // If flow is started by the API call
      throw new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition');
    }
    const newInstanceId = new Types.ObjectId();
    await this.runFlow(workflow, newInstanceId, processInstanceBody);
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
  async runByDefinitionKey(headers: CommonHeadersDto, query: GetOneProcessInstanceQueryDto, key: string, processInstanceBody: StartProcessInstanceBodyDto): Promise<CustomResponse | CustomError> {
    let workflow = await this.processDefinitionRepositoryImpl.findOne({ key, ...(query.version && { version: query.version }) }, { _compiledDefinition: 1, properties: 1, version: 1 }, { version: -1 });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS);
    }
    const newInstanceId = new Types.ObjectId();
    await this.runFlow(workflow, newInstanceId, processInstanceBody);
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING, { _id: newInstanceId });
  }

  /**
   * Generic function to run a process instance
   * @param workflow {object} - compiled process definition
   * @param newInstanceId {object} - _id for the instance in object form
   * @param processInstanceBody {object} - Input payload required to start an instance, e.g. {parameters: {}}
   */
  async runFlow(workflow, newInstanceId, processInstanceBody) {
    const [isValid, error] = this.execute.validateParameters(workflow.properties, processInstanceBody?.parameters);
    if (!(isValid && workflow._compiledDefinition)) {
      // If flow is started by the API call
      throw new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition');
    }
    const now = Date.now();

    workflow._compiledDefinition._id = newInstanceId;
    workflow._compiledDefinition.rootProcessInstanceId = newInstanceId.valueOf();
    workflow._compiledDefinition.timeActivated = now;
    workflow._compiledDefinition.timeStarted = now;
    workflow._compiledDefinition.stages[workflow._compiledDefinition._startIndex].timeActivated = now;; // status of start stage

    const data = await this.processInstanceRepositoryImpl.create(workflow._compiledDefinition as any);
    this.execute.startFlow(data, processInstanceBody);
  }

}