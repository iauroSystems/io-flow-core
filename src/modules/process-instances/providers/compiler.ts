import { HttpStatus, Logger, Injectable } from "@nestjs/common";
import { PromiseProvider, Types } from 'mongoose';
import { Constants } from "src/common/const/constants";


// import { Executor } from "src/modules/tasks/providers/executor";

@Injectable()
export class Compiler {
  private readonly logger: Logger = new Logger();
  constructor () { }

  compile(processDefinition, rootProcessInstanceId?, parentProcessInstanceId?, parentTaskId?) {
    const now = Date.now();

    let compiledProcessDefinition = JSON.parse(JSON.stringify(processDefinition));

    // Check if start stage is present, check for multiple stages
    const startIndex = compiledProcessDefinition.stages.findIndex(stage => stage.subType === Constants.STAGE_SUB_TYPES.START);
    const endIndex = compiledProcessDefinition.stages.findIndex(stage => stage.subType === Constants.STAGE_SUB_TYPES.END);

    compiledProcessDefinition._startIndex = startIndex;
    compiledProcessDefinition._endIndex = endIndex;

    if (startIndex !== -1) {
      compiledProcessDefinition.stages[startIndex].status = Constants.STAGE_STATUSES.ACTIVE; // status of start stage
      compiledProcessDefinition.stages[startIndex].timeActivated = now;; // status of start stage
    }

    const stageIndexJSON = {};
    compiledProcessDefinition.processDefinitionId = compiledProcessDefinition._id;
    delete compiledProcessDefinition.__v;
    // delete processDefinitionId
    delete compiledProcessDefinition._id;
    delete compiledProcessDefinition._compiledDefinition;

    compiledProcessDefinition.processDefinitionKey = compiledProcessDefinition.key;
    compiledProcessDefinition.parentProcessInstanceId = parentProcessInstanceId;

    compiledProcessDefinition.parentTaskId = parentTaskId;
    // generate processInstanceId
    compiledProcessDefinition._id = new Types.ObjectId();
    compiledProcessDefinition.status = Constants.STAGE_STATUSES.ACTIVE;
    compiledProcessDefinition.timeActivated = now;
    compiledProcessDefinition.timeStarted = now;
    compiledProcessDefinition.rootProcessInstanceId = rootProcessInstanceId ? rootProcessInstanceId : compiledProcessDefinition._id.valueOf();



    // compiledProcessDefinition.parameters = parameters; // assign input parameters
    // let skipStages = [];
    // if (compiledProcessDefinition.isParallel) {
    //   // remove start and end stage
    //   // compiledProcessDefinition.stages = compiledProcessDefinition.stages.filter(stage => (stage.subType !== 'start' && stage.subType !== 'end'));

    //   skipStages = compiledProcessDefinition.stages.map(obj => obj.nextStage).filter(stage => stage);
    // }
    compiledProcessDefinition.stages = compiledProcessDefinition.stages.map((task, index) => {
      stageIndexJSON[task.key] = index; // create JSON for keys and indexes
      task.stageId = task._id;
      delete task._id;
      // skip already active task
      if (task.status !== Constants.STAGE_STATUSES.ACTIVE) {

        // in case of parallel tasks skip the stages whose keys are present in other task's nextStage
        // if (task.type === Constants.STAGE_TYPES.ACTIVITY && skipStages.length && !skipStages.includes(task.key)) {
        //   task.status = Constants.STAGE_STATUSES.ACTIVE;
        //   task.timeActivated = now;
        // } else { //if (index !== startIndex) {
        task.status = Constants.STAGE_STATUSES.WAITING;
        // }
      }
      return task;
    });
    compiledProcessDefinition._stageIndexJSON = stageIndexJSON;
    return compiledProcessDefinition;
  }

  compileV2(processDefinition) {
    const now = Date.now();

    let compiledProcessDefinition = JSON.parse(JSON.stringify(processDefinition));

    // Check if start stage is present, check for multiple stages
    const startIndex = compiledProcessDefinition.stages.findIndex(stage => stage.subType === Constants.STAGE_SUB_TYPES.START);
    const endIndex = compiledProcessDefinition.stages.findIndex(stage => stage.subType === Constants.STAGE_SUB_TYPES.END);

    compiledProcessDefinition._startIndex = startIndex;
    compiledProcessDefinition._endIndex = endIndex;

    if (startIndex !== -1) {
      compiledProcessDefinition.stages[startIndex].status = Constants.STAGE_STATUSES.ACTIVE; // status of start stage
      compiledProcessDefinition.stages[startIndex].timeActivated = now;; // status of start stage
    }

    const stageIndexJSON = {};
    compiledProcessDefinition.processDefinitionId = compiledProcessDefinition._id;
    delete compiledProcessDefinition.__v;
    // delete processDefinitionId
    delete compiledProcessDefinition._id;
    delete compiledProcessDefinition._compiledDefinition;
    delete compiledProcessDefinition.createdAt;
    delete compiledProcessDefinition.updatedAt;

    compiledProcessDefinition.processDefinitionKey = compiledProcessDefinition.key;
    compiledProcessDefinition.parentProcessInstanceId = null;
    compiledProcessDefinition.parentTaskId = null;
    // generate processInstanceId
    compiledProcessDefinition._id = null;
    compiledProcessDefinition.status = Constants.STAGE_STATUSES.ACTIVE;
    compiledProcessDefinition.timeActivated = now;
    compiledProcessDefinition.timeStarted = now;
    compiledProcessDefinition.rootProcessInstanceId = null;



    // compiledProcessDefinition.parameters = parameters; // assign input parameters
    // let skipStages = [];
    // if (compiledProcessDefinition.isParallel) {
    //   // remove start and end stage
    //   // compiledProcessDefinition.stages = compiledProcessDefinition.stages.filter(stage => (stage.subType !== 'start' && stage.subType !== 'end'));

    //   skipStages = compiledProcessDefinition.stages.map(obj => obj.nextStage).filter(stage => stage);
    // }
    compiledProcessDefinition.stages = compiledProcessDefinition.stages.map((task, index) => {
      stageIndexJSON[task.key] = index; // create JSON for keys and indexes
      task.stageId = task._id;
      delete task._id;
      // skip already active task
      if (task.status !== Constants.STAGE_STATUSES.ACTIVE) {

        // in case of parallel tasks skip the stages whose keys are present in other task's nextStage
        // if (task.type === Constants.STAGE_TYPES.ACTIVITY && skipStages.length && !skipStages.includes(task.key)) {
        //   task.status = Constants.STAGE_STATUSES.ACTIVE;
        //   task.timeActivated = now;
        // } else { //if (index !== startIndex) {
        task.status = Constants.STAGE_STATUSES.WAITING;
        // }
      }
      return task;
    });
    compiledProcessDefinition._stageIndexJSON = stageIndexJSON;
    return compiledProcessDefinition;
  }
  private verifyParams(properties, inputParams) {
    // validate input params against the properties
  }
}
