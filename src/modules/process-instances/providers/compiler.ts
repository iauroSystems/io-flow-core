import { HttpStatus, Logger, Injectable } from "@nestjs/common";
import { Types } from 'mongoose';
import { Constants } from "src/common/const/constants";
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";



// import { Executor } from "src/modules/tasks/providers/executor";

@Injectable()
export class Compiler {
  private readonly logger: Logger = new Logger();
  constructor(
    private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
  ) { }

  compile ( processDefinition, rootProcessInstanceId?, parentProcessInstanceId?, parentTaskId?) {
    const now = Date.now();

    let compiledProcessDefinition = JSON.parse( JSON.stringify( processDefinition ) );

    // Check if start stage is present, check for multiple stages
    const startIndex = compiledProcessDefinition.stages.findIndex( stage => stage.subType === Constants.STAGE_SUB_TYPES.START );
    const endIndex = compiledProcessDefinition.stages.findIndex( stage => stage.subType === Constants.STAGE_SUB_TYPES.END );

    compiledProcessDefinition._startIndex = startIndex;
    compiledProcessDefinition._endIndex = endIndex;

    if ( startIndex !== -1 ) {
      compiledProcessDefinition.stages[ startIndex ].status = Constants.STAGE_STATUSES.ACTIVE; // status of start stage
      compiledProcessDefinition.stages[ startIndex ].timeActivated = now;; // status of start stage
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
    compiledProcessDefinition.stages = compiledProcessDefinition.stages.map( ( task, index ) => {
      stageIndexJSON[ task.key ] = index; // create JSON for keys and indexes
      task.stageId = task._id;
      delete task._id;
      // skip already active task
      if ( task.status !== Constants.STAGE_STATUSES.ACTIVE ) {

        // in case of parallel tasks skip the stages whose keys are present in other task's nextStage
        // if (task.type === Constants.STAGE_TYPES.ACTIVITY && skipStages.length && !skipStages.includes(task.key)) {
        //   task.status = Constants.STAGE_STATUSES.ACTIVE;
        //   task.timeActivated = now;
        // } else { //if (index !== startIndex) {
        task.status = Constants.STAGE_STATUSES.WAITING;
        // }
      }
      return task;
    } );
    compiledProcessDefinition._stageIndexJSON = stageIndexJSON;
    return compiledProcessDefinition;
  }

  async compileV2 ( processDefinition ) {
    const now = Date.now();

    let compiledProcessDefinition = JSON.parse( JSON.stringify( processDefinition ) );

    // Check if start stage is present, check for multiple stages
    const startIndex = compiledProcessDefinition.stages.findIndex( stage => stage.subType === Constants.STAGE_SUB_TYPES.START );
    const endIndex = compiledProcessDefinition.stages.findIndex( stage => stage.subType === Constants.STAGE_SUB_TYPES.END );

    compiledProcessDefinition._startIndex = startIndex;
    compiledProcessDefinition._endIndex = endIndex;

    if ( startIndex !== -1 ) {
      compiledProcessDefinition.stages[ startIndex ].status = Constants.STAGE_STATUSES.ACTIVE; // status of start stage
      compiledProcessDefinition.stages[ startIndex ].timeActivated = now;; // status of start stage
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
    compiledProcessDefinition.stages = compiledProcessDefinition.stages.map( ( task, index ) => {
      stageIndexJSON[ task.key ] = index; // create JSON for keys and indexes
      task.stageId = task._id;
      delete task._id;
      // skip already active task
      if ( task.status !== Constants.STAGE_STATUSES.ACTIVE ) {

        // in case of parallel tasks skip the stages whose keys are present in other task's nextStage
        // if (task.type === Constants.STAGE_TYPES.ACTIVITY && skipStages.length && !skipStages.includes(task.key)) {
        //   task.status = Constants.STAGE_STATUSES.ACTIVE;
        //   task.timeActivated = now;
        // } else { //if (index !== startIndex) {
        task.status = Constants.STAGE_STATUSES.WAITING;
        // }
      }
      return task;
    } );

    compiledProcessDefinition._stageIndexJSON = stageIndexJSON;

    //compiledProcessDefinition = await this.addDependencies( processDefinition, compiledProcessDefinition );

    return compiledProcessDefinition;
  }

  // async addDependencies ( processDefinition, compiledProcessDefinition ) {
  //   let stages = processDefinition.stages;
  //   for ( let i = 0; i < stages.length; i++ ) {
  //     let stage = stages[ i ];
  //     if ( stage.subType === 'dependency' ) {

  //       const conditionVariables = stage.conditions.reduce( ( accumulator, condition ) => {
  //         return { ...accumulator, ...condition.variables };
  //       }, {} );

  //       let dependencyLocations = await this.getDependencyKeyFromVaribles( conditionVariables );

  //       for ( let i = 0; i < dependencyLocations.length; i++ ) {

  //         let location = dependencyLocations[ i ];

  //         if ( location.includesDefinitionKey ) {
  //           const getProcessDefinitionByKey = await this.processDefinitionRepositoryImpl.findOne( { key: location.path.split( '.' )[ 0 ] } );
  //           const stageIndex = getProcessDefinitionByKey._compiledDefinition[ '_stageIndexJSON' ][ location.path.split( '.' )[ 2 ] ];
  //           if ( !getProcessDefinitionByKey._compiledDefinition?.[ 'stages' ]?.[ stageIndex ]?.[ 'dependencies' ] ) {
  //             getProcessDefinitionByKey._compiledDefinition[ 'stages' ][ stageIndex ][ 'dependencies' ] = [];
  //           }
  //           getProcessDefinitionByKey._compiledDefinition[ 'stages' ][ stageIndex ].dependencies.push( { processDefinitionKey: processDefinition.key, stageKey: stage.key } );
  //           const condition = {
  //             key: getProcessDefinitionByKey.key
  //           };

  //           const updateObject = {
  //             description: getProcessDefinitionByKey.description,
  //             criteria: getProcessDefinitionByKey.criteria,
  //             stages: getProcessDefinitionByKey.stages,
  //             assigneeConnector: getProcessDefinitionByKey.assigneeConnector,
  //             _compiledDefinition: getProcessDefinitionByKey._compiledDefinition,
  //             createdBy: getProcessDefinitionByKey.createdBy

  //           };
  //           const updateProcessDefinition = await this.processDefinitionRepositoryImpl.update( condition, { _compiledDefinition: getProcessDefinitionByKey._compiledDefinition, } );
  //         }
  //         else {
  //           const stageIndex = compiledProcessDefinition._stageIndexJSON[ location.path.split( '.' )[ 1 ] ];
  //           if ( !compiledProcessDefinition.stages?.[ stageIndex ]?.[ 'dependencies' ] ) {
  //             compiledProcessDefinition.stages[ stageIndex ][ 'dependencies' ] = [];
  //           }
  //           compiledProcessDefinition.stages[ stageIndex ][ 'dependencies' ].push( { processDefinitionKey: processDefinition.key, stageKey: stage.key } );
  //         }
  //       }

  //     }
  //   }
  //   return compiledProcessDefinition;
  // }


  /*example input value -
      const value = "$[(processDefKey).stages.<key>.parameters.name]";
      const value='$[stages.<activity_GzQud7lk>.status]';
  */
  async getDependencyKeyFromVaribles ( conditionVariables ) {
    let variableValues = Object.values( conditionVariables );
    let dependencyLocations = [];
    variableValues.forEach( ( value: string ) => {
      let includesDefinitionKey = false;
      let finalPath = '';
      let keyIndex = 1;
      if ( value.startsWith( '$[' ) && value.endsWith( ']' ) ) {
        let path = value.slice( 2, -1 ).split( '.' );

        if ( path[ 0 ] && path[ 0 ].startsWith( '(' ) && path[ 0 ].endsWith( ')' ) ) {
          path[ 0 ] = path[ 0 ].slice( 1, -1 );
          keyIndex = 2;
          includesDefinitionKey = true;
        }
        if ( ( ( path[ keyIndex ].startsWith( '<' ) ) && ( path[ keyIndex ].endsWith( '>' ) ) ) || ( ( path[ keyIndex ].startsWith( '<:' ) && path[ keyIndex ].endsWith( ':>' ) ) ) ) {
          path[ keyIndex ] = path[ keyIndex ].slice( 1, -1 );
        }

        finalPath = keyIndex == 1 ? `${ path[ 0 ] }.${ path[ 1 ] }` : `${ path[ 0 ] }.${ path[ 1 ] }.${ path[ 2 ] }`;
        // Check if the path and definitionKey is already present in the dependencyLocations array
        let dependencyLocationObj = { path: finalPath, includesDefinitionKey: includesDefinitionKey };
        const isDuplicate = dependencyLocations.some( ( item ) => {
          return item.path === dependencyLocationObj.path && item.includesDefinitionKey === dependencyLocationObj.includesDefinitionKey;
        } );
        if ( !isDuplicate ) {
          dependencyLocations.push( { path: finalPath, includesDefinitionKey: includesDefinitionKey } );
        }
      }

    } );
    return dependencyLocations;
  }

}
