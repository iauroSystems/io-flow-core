import { HttpStatus, Injectable, Logger, Scope, UseFilters } from '@nestjs/common';
import * as moment from 'moment';

import { CompleteTaskBody, CompleteTaskParams, GetTasksQueryDto, CompleteTasksHeadersDto, GetTasksParamsDto, GetMyTasksHeadersDto, GetMyTasksParamsDto, GetMyTasksQueryDto, ReAssignTaskBody } from './dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { Constants } from 'src/common/const/constants'
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { Executor } from './providers/executor';
import { CommonHeadersDto } from 'src/shared/dtos';
import { GetProcessInstanceStatsQueryDto } from '../process-instances/dtos';
import { InputStatuses } from 'src/common/const/enums';
import * as _ from 'lodash';
@Injectable()
export class TasksService {
  private readonly logger: Logger = new Logger(TasksService.name);

  constructor (
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
    private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
    private userTaskRepositoryImpl: UserTasksRepositoryImpl,
    private execute: Executor
  ) { }

  /**
   * Exposed method to complete the task
   * @param params {object} - Defined query params
   * @param completeTaskDto {object} - Input parameters to complete the task
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async completeTask(headers: CompleteTasksHeadersDto, params: CompleteTaskParams, taskData: CompleteTaskBody): Promise<CustomResponse | CustomError> {
    try {
      // Check if the user who has assigned the task is performing the activity
      // const userTask = await this.userTaskRepositoryImpl.findOne({ taskId: taskData.taskId, assignee: headers['user-id'] });
      // if (!userTask) {
      //   throw new CustomError(HttpStatus.FORBIDDEN, CustomMessages.UNAUTHORIZED_ACTIVITY);
      // }
      const condition = {
        _id: params.processInstanceId
      };
      if (taskData.taskId) {
        condition['stages._id'] = taskData.taskId;
        condition['stages.type'] = Constants.STAGE_TYPES.ACTIVITY;
      }
      const processInstance = await this.processInstanceRepositoryImpl.findOne(condition);
      if (!processInstance) {
        throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST);
      }

      switch (taskData.status) {
        case InputStatuses.COMPLETE:
          if (!(taskData.taskId || taskData.taskKey)) {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'task not found');

          }
          const taskDetails = processInstance.stages.find(obj => {
            if (taskData.taskId) {
              return obj._id.toString() === taskData.taskId
            }
            if (taskData.taskKey) {
              return obj.key.toString() === taskData.taskKey
            }
          });

          if (taskDetails.status === Constants.STAGE_STATUSES.COMPLETED || taskDetails.status === Constants.STAGE_STATUSES.STARTED) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${taskDetails.status}`);
          }
          if (processInstance.status === Constants.STAGE_STATUSES.ON_HOLD || processInstance.status === Constants.STAGE_STATUSES.CANCELLED) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `The flow is in ${processInstance.status} state`);
          }

          if (taskDetails.status !== Constants.STAGE_STATUSES.ACTIVE && taskDetails.status !== Constants.STAGE_STATUSES.ERROR) {
            throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.TASK_NOT_ACTIVE);
          }

          if (taskDetails.subType === Constants.STAGE_SUB_TYPES.END) {
            // mark current task as complete
            await this.execute.makeFlowEnd(processInstance, taskDetails, taskData, headers['user-id']);
            return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_ENDED);
          }

          if (taskDetails.subType === Constants.STAGE_SUB_TYPES.SUB_PROCESS && taskDetails.processInstanceId) {
            const childProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: taskDetails.processInstanceId, status: Constants.STAGE_STATUSES.COMPLETED });
            if (!childProcessInstance) {
              throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.CHILD_PROCESS_INSTANCE_NOT_COMPLETED);
            }
          }
          // mark current task as complete
          await this.execute.makeTaskComplete(processInstance, taskDetails, taskData, headers['user-id']);
          break;
        case InputStatuses.HOLD:
          if (processInstance.status === Constants.STAGE_STATUSES.ON_HOLD) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstance.status}`);
          }

          await this.execute.makeFlowHold(processInstance);
          break;
        case InputStatuses.CANCEL:
          if (processInstance.status === Constants.STAGE_STATUSES.CANCELLED) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstance.status}`);
          }
          await this.execute.makeFlowCancel(processInstance);

          break;
        case InputStatuses.RESUME:
          if (processInstance.status === Constants.STAGE_STATUSES.ACTIVE) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstance.status}`);
          }
          if (processInstance.status !== Constants.STAGE_STATUSES.ON_HOLD) {
            throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.FLOW_NOT_ON_HOLD);
          }
          await this.execute.makeFlowResume(processInstance);
          break;
        default:
          if (processInstance.status === Constants.STAGE_STATUSES.ON_HOLD || processInstance.status === Constants.STAGE_STATUSES.CANCELLED) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `The flow is in ${processInstance.status} state`);
          }
          await this.execute.saveParams(processInstance, taskData, headers['user-id']);
          break;
      }
      return new CustomResponse(HttpStatus.OK, CustomMessages.TASK_UPDATED);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  /**
   * Re-assigne the task
   * @param headers {object} - Defined request headers  
   * @param params {object} - Defined query params
   * @param taskData {object} - Input parameters
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async reassignTask(headers: CompleteTasksHeadersDto, params: CompleteTaskParams, taskData: ReAssignTaskBody): Promise<CustomResponse | CustomError> {
    try {

      const condition = {
        _id: params.processInstanceId
      };
      if (taskData.taskId) {
        condition['stages._id'] = taskData.taskId;
        condition['stages.type'] = Constants.STAGE_TYPES.ACTIVITY;
      }
      if (!(taskData.assignee && taskData.watchers)) {
        throw new CustomError(HttpStatus.BAD_REQUEST, 'assignee and watchers must be specified');
      }
      const processInstance = await this.processInstanceRepositoryImpl.findOne(condition);
      if (!processInstance) {
        throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST);
      }

      if (!(taskData.taskId || taskData.taskKey)) {
        throw new CustomError(HttpStatus.BAD_REQUEST, 'task not found');
      }

      const taskDetails = processInstance.stages.find(obj => {
        if (taskData.taskId) {
          return obj._id.toString() === taskData.taskId
        }
        if (taskData.taskKey) {
          return obj.key.toString() === taskData.taskKey
        }
      });
      // change task assignee
      await this.execute.changeTaskAssignee(processInstance.id, taskDetails, taskData.assignee, taskData.watchers);


      return new CustomResponse(HttpStatus.OK, CustomMessages.TASK_UPDATED);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  // async update(id: string, updateUserTaskDto: UpdateUserTaskDto): Promise<CustomResponse | CustomError> {
  //   const workflow = await this.userTaskRepositoryImpl.findOne({ id: id });
  //   if (!workflow) {
  //     throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
  //   }
  //   updateUserTaskDto['version'] = workflow.version + 1;
  //   // const updatedUserTask = { ...updateUserTaskDto, ...workflow };
  //   const data = [] //await this.userTaskRepositoryImpl.create(updatedUserTask);
  //   return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, data);
  // }

  /**
   * Find all tasks assigned to an assignee
   * @param headers {object} - Defined request headers  
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAllUserAssignedTasks(headers: CommonHeadersDto, query: GetMyTasksQueryDto): Promise<CustomResponse | CustomError> {
    let condition = { $and: [] };
    let customFilters = null;
    let filters = null;
    let sort = null;

    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        switch (customFilters['filterBy']) {
          case 'overdue':
            condition.$and.push({ $and: [{ expEndDate: { $ne: -1 } }, { expEndDate: { $lt: Date.now() } }] })
            break;
          case 'today':
            condition.$and.push({ $and: [{ expEndDate: { $gt: moment().startOf('day').valueOf() } }, { expEndDate: { $lte: moment().endOf('day').valueOf() } }] })
            break;
          case 'upcoming':
            condition.$and.push({ $or: [{ expEndDate: { $gt: moment().endOf('day').valueOf() } }, { expEndDate: -1 }] })
            break;
        }
        if (customFilters.expEndDate) {
          condition.$and.push({ $and: [{ expEndDate: { $gt: moment(customFilters.expEndDate).startOf('day').valueOf() } }, { expEndDate: { $lte: moment(customFilters.expEndDate).endOf('day').valueOf() } }] })
        }
        if (customFilters.startDate && customFilters.endDate) {
          condition.$and.push({ createdAt: { $gt: moment(customFilters.startDate).startOf('day'), $lte: moment(customFilters.endDate).endOf('day') } })
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

      throw new CustomError(HttpStatus.BAD_REQUEST, ` [filters or customFilters] ${CustomMessages.INVALID_JSON}`);
    }
    condition.$and.push({ assignee: { $ne: null } });
    condition.$and.push({ $or: [{ assignee: headers['user-id'] }, { watchers: headers['user-id'] }] });
    const count = await this.userTaskRepositoryImpl.count(condition);
    const data = await this.userTaskRepositoryImpl.find(condition, {}, query.page, query.size, sort || { $natural: -1 });
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
  }

  /**
   * Find all the tasks
   * @param headers {object} - Defined request headers  
   * @param query {object} - Defined query params
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findTasks(headers: CommonHeadersDto, query: GetTasksQueryDto): Promise<CustomResponse | CustomError> {
    let condition: any = { $and: [] };
    let customFilters = null;
    let sort = null;
    let filters = null;

    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        switch (customFilters['filterBy']) {
          case 'overdue':
            condition.$and.push({ $and: [{ expEndDate: { $ne: -1 } }, { expEndDate: { $lt: Date.now() } }] })
            break;
          case 'today':
            condition.$and.push({ $and: [{ expEndDate: { $gt: moment().startOf('day').valueOf() } }, { expEndDate: { $lte: moment().endOf('day').valueOf() } }] })
            break;
          case 'upcoming':
            condition.$and.push({ $or: [{ expEndDate: { $gt: moment().endOf('day').valueOf() } }, { expEndDate: -1 }] })
            break;
        }
        if (customFilters.expEndDate) {
          condition.$and.push({ $and: [{ expEndDate: { $gt: moment(customFilters.expEndDate).startOf('day').valueOf() } }, { expEndDate: { $lte: moment(customFilters.expEndDate).endOf('day').valueOf() } }] })
        }
        if (customFilters.startDate && customFilters.endDate) {
          condition.$and.push({ createdAt: { $gt: moment(customFilters.startDate).startOf('day'), $lte: moment(customFilters.endDate).endOf('day') } })
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
    if (!condition.$and.length) {
      condition = {};
    }

    const count = await this.userTaskRepositoryImpl.count(condition);
    const data = await this.userTaskRepositoryImpl.find(condition, {}, query.page, query.size, sort || { $natural: -1 });

    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
  }

  /**
   * 
   * @param headers {object} - Defined request headers  
   * @param query {object} - Defined query params
   * @param myStats {boolean} if true, fetch the stats for logged in user
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async getTasksStats(headers: CommonHeadersDto, query: GetProcessInstanceStatsQueryDto, myStats: boolean): Promise<CustomResponse | CustomError> {
    let condition: any = { $and: [] };
    let customFilters = null;
    let filters = null;

    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.customFilters) {
        customFilters = JSON.parse(query.customFilters);
        switch (customFilters['filterBy']) {
          case 'overdue':
            condition.$and.push({ $and: [{ expEndDate: { $ne: -1 } }, { expEndDate: { $lt: Date.now() } }] })
            break;
          case 'today':
            condition.$and.push({ $and: [{ expEndDate: { $gt: moment().startOf('day').valueOf() } }, { expEndDate: { $lte: moment().endOf('day').valueOf() } }] })
            break;
          case 'upcoming':
            condition.$and.push({ $or: [{ expEndDate: { $gt: moment().endOf('day').valueOf() } }, { expEndDate: -1 }] })
            break;
        }
        if (customFilters.expEndDate) {
          condition.$and.push({ $and: [{ expEndDate: { $gt: moment(customFilters.expEndDate).startOf('day').valueOf() } }, { expEndDate: { $lte: moment(customFilters.expEndDate).endOf('day').valueOf() } }] })
        }
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

      throw new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`);
    }
    if (myStats) {
      condition.$and.push({ assignee: { $ne: null } });
      condition.$and.push({ $or: [{ assignee: headers['user-id'] }, { watchers: headers['user-id'] }] });
    }
    if (!condition.$and.length) {
      condition = {};
    }
    const pipeline = [
      {
        $match: condition
      },
      {
        $group: {
          _id: null,
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $and: [{ $ne: ['$expEndDate', -1] }, { $lt: ['$expEndDate', Date.now()] }] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          all: { $sum: 1 },
        },
      }];

    const stats = await this.userTaskRepositoryImpl.aggregate(pipeline);
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, stats[0]);
  }

}