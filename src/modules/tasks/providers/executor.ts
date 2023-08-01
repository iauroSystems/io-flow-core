import { HttpStatus, Logger, Injectable, Inject, OnModuleInit, Scope } from '@nestjs/common';
import { Types } from 'mongoose';
import { _ } from 'lodash';
import * as moment from 'moment';

import { CustomMessages } from 'src/common/const/custom-messages';
import { Constants } from 'src/common/const/constants';
import CustomError from 'src/common/exceptions';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { Compiler } from '../../process-instances/providers';
import { Webhooks } from 'src/common/const/enums';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class Executor implements OnModuleInit {
    private readonly logger: Logger = new Logger(Executor.name);

    constructor (
        private userTaskRepositoryImpl: UserTasksRepositoryImpl,
        private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
        private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
        private http: HttpConnector,
        private grpc: GrpcConnector,
        private compiler: Compiler,
        @Inject(REQUEST) private readonly request: Request
    ) { }
    onModuleInit() { }

    /**
     * Replace the value reference by the actual value 
     * e.g.change this string "My name is $[stages.<key>.firstName]" to "My name is Sudhir"
     * @param dataString {string} - input data string in which values to be replaced
     * @param processInstance {object} - Process instance data
     * @returns {promise} - datastring wrapped in promise
     */
    async parseAndReplaceValue(dataString: string, processInstance) {
        processInstance['user'] = this.request.headers.authorization;
        processInstance['admin'] = this.request.headers['admin-authorization'];
        const regex = /\$\[(.*?)\]\$?/; // match substrings starts with $[ and ends with ]
        if (dataString.length <= 2000) {
            let match = dataString.match(regex);
            while (match !== null) {
                let replacePattern = match[0];
                let path = match[0];
                if (match[0].endsWith('$')) {
                    path = match[0].slice(0, -1);
                    replacePattern = `"${match[0]}"`;
                }
                let value = await this.valueLocator(processInstance, path);

                if (value === null) {
                    replacePattern = `"${match[0]}"`;
                }
                if (typeof value === 'object') {
                    replacePattern = `"${match[0]}"`;
                    value = JSON.stringify(value);
                }
                dataString = dataString.replaceAll(replacePattern, value);

                match = dataString.match(regex);
            }
        }
        return dataString;
    }

    /************************************************************************* GATEWAY START ********************************************************************** */

    /**
     * Find a process instance by using process definition key and root process instance id
     * @param processDefinitionKey {string} - process definition key
     * @param rootProcessInstanceId {string} - root process instance id
     * @returns {promise} - process instance object wrapped in promise
     */
    async instanceLocator(processDefinitionKey, rootProcessInstanceId) {
        const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ rootProcessInstanceId, processDefinitionKey }, {}, { $natural: -1 });
        return parentProcessInstance || {};
    }

    // value reference 
    // parameters.value - workflow level parameters
    // <key>.parameters.value - stage level parameters
    // <key>._data.value
    // <key>._error.value

    /**
     * Find the value referenced in the value reference expression
     * @param processInstance {object} - process instance object
     * @param path {string} - value reference expression, e.g. "$[(processDefKey).stages.<key>.parameters.name]"
     * @param gateway {object} - optional gateway object
     * @returns {promise} - referenced value wrapped in promise
     */
    async valueLocator(processInstance, path: any, gateway?) {
        // '$[parameters.value]'
        if (typeof path === 'string' && path.startsWith('$[') && path.endsWith(']')) {
            let remoteDefinitionKey = null;
            let _path = path.slice(2, -1).split('.');

            // if value comes in round brackets e.g.(process definition key) it must be other workflow instance
            if (_path[0] && _path[0].startsWith('(') && _path[0].endsWith(')')) {
                remoteDefinitionKey = _path[0].slice(1, -1);
                _path.shift(); // remove process defintion key from array
                if (remoteDefinitionKey !== processInstance.processDefinitionKey) {
                    processInstance = await this.instanceLocator(remoteDefinitionKey, processInstance.rootProcessInstanceId);
                }
            }
            const newPath = _path.map(keyword => {
                // if value comes in brackets <> e.g.< stage key or stage index > it must be an stage index or stage key
                if (keyword.startsWith('<') && keyword.endsWith('>')) {
                    keyword = keyword.slice(1, -1);

                    // if (!isNaN(keyword as any) && !isNaN(parseFloat(keyword))) {
                    //     return parseFloat(keyword);
                    // }

                    return processInstance._stageIndexJSON[keyword];
                }
                return keyword;
            });

            return _.get(processInstance, newPath);
        }
        return path;
    }

    // evaluate the conditions and return the same array
    /**
     * 
     * @param processInstance {object} - process instance object
     * @param gateway {object} - gateway stage object
     * @returns {object} - returns an array with evaluated conditions
     */
    conditionEvaluator ( processInstance, gateway ) {
        try {
            //get the conditions
            return gateway.conditions.map( async condition => {

                const expVariables = condition.expVariables;
                const expVariableKeys = Object.keys( expVariables );

                for ( const key of expVariableKeys ) {
                    const value = expVariables[ key ];
                    expVariables[ key ] = await this.valueLocator( processInstance, value, gateway );
                }
                const expresssion = await this.replaceVariables( condition.expression, expVariables );
                condition._valid = eval( expresssion );
                return condition;
            } );
        } catch ( err ) {
            this.logger.error( err );
            return gateway.conditions;
        }
    }

        /**
     * replace condition expression variables with expvariables 
     * @param expression 
     * @param inputObject 
     * @returns 
     */
    replaceVariables ( expression, inputObject ) {
        return expression.replace( /([a-zA-Z$_][a-zA-Z$_0-9]*)/g, ( match, varName ) => {
            return inputObject[ varName ] !== undefined ? JSON.stringify( inputObject[ varName ] ) : match;
        } );
    }


    /**
     * Evaluate a exclusive gateway conditions
     * @param processInstance {object} - process instance object
     * @param stage {object} - gateway stage object
     * @param conditions {array} - array of conditions
     */
    exclusiveHandler ( processInstance, nextStages, conditions ) {
        const cond = conditions.find( cond => {
            if ( cond._valid ) {
                return cond;
            }
        } );
        if ( cond ) {
            this.goToNextStage( processInstance._id, cond.onTrueNextStage );
        } else {
            this.iterateNextStages( processInstance, nextStages ); // TODO need to be changed
        }
    }

    /**
    * Evaluate a inclusive gateway conditions
    * @param processInstance {object} - process instance object
    * @param stage {object} - gateway stage object
    * @param conditions {array} - array of conditions
    */
    inclusiveHandler ( processInstance, stage, conditions ) {
        const onTrueStages = conditions.filter( cond => {
            if ( cond._valid ) {
                return cond;
            }
        } ).map( obj => obj.onTrueNextStage );
        if ( onTrueStages[ 0 ] ) {
            this.iterateNextStages( processInstance, onTrueStages );
        } else {
            this.iterateNextStages( processInstance, stage.nextStages );
        }
    }

    /**
     * Evaluate parallel gateway, no conditions involved.
     * @param processInstance {object} - process instance object
     * @param gateway {object} - gateway stage object
     */
    parallelHandler(processInstance, gateway) {
        const sourceStages = processInstance.stages.filter(stage => stage.nextStages.includes(gateway.key));
        const completedStages = sourceStages.filter(stage => stage.status === Constants.STAGE_STATUSES.COMPLETED || Constants.STAGE_STATUSES.ERROR);
        if (sourceStages.length === completedStages.length) {
            for (const stageKey of gateway.nextStages) {
                this.goToNextStage(processInstance, stageKey);
            }
        }
    }

    /**
     * Hop to the next stages attached to a stage 
     * @param processInstance {object} - process instance object
     * @param nextStages {array} - array of stage keys, e.g. ["k1", "k2"]
     */
    async iterateNextStages(processInstance, nextStages) {
        if (nextStages.length) {
            for (const stageKey of nextStages) {
                this.goToNextStage(processInstance, stageKey);
            }
        } else {
            const getInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstance._id });
            const updated = await this.updateFlowFlagStatuses(getInstance);
            if (processInstance.status !== Constants.STAGE_STATUSES.COMPLETED) {
                const [isValid] = this.validateCriteria(updated.criteria, updated._flags);
                if (isValid) {
                    await this.makeFlowEnd(updated, updated.stages[updated._endIndex]);
                }
            }
        }
    }

    /**
     * Switch for the multiple gateways based on the subtype
     * @param processInstance {object} - process instance object
     * @param gateway {object} - gateway stage object
     */
    async gatewayHandler(processInstance, gateway) {
        const gatewayConditions = await Promise.all(this.conditionEvaluator(processInstance, gateway));
        let complete = true;
        this.logger.debug(`Evaluating [${gateway.subType}] gateway...`);
        switch (gateway.subType) {
            case Constants.STAGE_SUB_TYPES.SWITCH_CASE:
                break;
            case Constants.STAGE_SUB_TYPES.EXCLUSIVE:
                this.exclusiveHandler(processInstance, gateway, gatewayConditions);
                break;
            case Constants.STAGE_SUB_TYPES.PARALLEL:
                this.parallelHandler(processInstance, gateway);
                break;
        }

        const condition = {
            _id: processInstance._id,
            'stages._id': gateway._id
        };

        const setValues = {
            ...(complete && { 'stages.$.status': Constants.STAGE_STATUSES.COMPLETED, 'stages.$.timeCompleted': Date.now() }),
            ...(!complete && { 'stages.$.status': Constants.STAGE_STATUSES.ACTIVE, 'stages.$.timeActivated': Date.now() }),
            'stages.$.conditions': gatewayConditions,
        }
        await this.processInstanceRepositoryImpl.updateOne(condition, setValues);

    }


    /************************************************************************* GATEWAY END ********************************************************************** */

    /************************************************************************* COMPOUND TASKS START ********************************************************************** */

    /**
     * Re-open the process instance attached to a compound task if the task(stage) is revisited
     * @param processInstanceId {string} - _id of the process instance document
     */
    async reopenProcessInstance(processInstanceId) {
        let processInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { stages: 1, isParallel: 1 });
        if (processInstance.isParallel) {
            // check for already started parallel flow is to be added, currently it is making all tasks active on API hit
            // remove start and end stage
            // compiledProcessDefinition.stages = compiledProcessDefinition.stages.filter(stage => (stage.subType !== 'start' && stage.subType !== 'end'));

            let skipStages = processInstance.stages.map(obj => {
                if (obj.type === Constants.STAGE_TYPES.ACTIVITY) {
                    return obj.nextStages;
                }
                if (obj.type === Constants.STAGE_TYPES.GATEWAY) {
                    return obj.conditions.map(cond => [cond.onTrueNextStage, obj.nextStages[0]]);
                }
            }).flat(Infinity).filter(stage => stage);
            const activeStages = processInstance.stages.map(_stage => {
                const stage = JSON.parse(JSON.stringify(_stage));
                if (stage.type === Constants.STAGE_TYPES.ACTIVITY && !skipStages.includes(stage.key)) {

                    const history = {
                        status: stage.status,
                        timeActivated: stage.timeActivated,
                        parameters: stage.parameters,
                        timeStarted: stage.timeStarted,
                        timeCompleted: stage.timeCompleted,
                        _flags: stage._flags,
                        _error: stage._error,
                        _data: stage._data,
                    };
                    stage.status = Constants.STAGE_STATUSES.ACTIVE;
                    stage.timeActivated = Date.now();
                    stage.parameters = null;
                    stage.timeStarted = -1;
                    stage.timeCompleted = -1;
                    stage._flags = {};
                    stage._error = null;
                    stage._data = null;
                    stage.history.push(history);
                }
                return stage;
            });
            const setValues = {
                stages: activeStages,
                status: Constants.STAGE_STATUSES.ACTIVE
            }
            const response = await this.makeMultipleStagesActive(processInstance._id, setValues);
            this.iterateNextStages(response, response.stages[response._startIndex].nextStages);
            // this.goToNextStage(response, response.stages[response._startIndex].nextStages);

        } else {
            const condition = {
                _id: processInstanceId,
            };
            const setValues = {
                status: Constants.STAGE_STATUSES.ACTIVE,
            };
            const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);

            this.iterateNextStages(response, response.stages[response._startIndex].nextStages);
            // this.goToNextStage(response, response.stages[response._startIndex].nextStage);

        }
    }

    /**
     * Create and run a child process instance on activation of the compound task
     * @param parentProcessInstance {object} - parent process instance in which compound task resides
     * @param parentTask {object} - parent stage (compound task) object
     * @returns {undefined|boolean} - returns undefined or false
     */
    async createChildProcessInstance(parentProcessInstance, parentTask) {
        try {
            const defCond = {
                ...(parentTask.processDefinitionKey && { key: parentTask.processDefinitionKey }),
                ...(parentTask.processDefinitionId && { _id: parentTask.processDefinitionId })
            }
            let workflow = await this.processDefinitionRepositoryImpl.findOne(defCond, { name: 1, description: 1, isParallel: 1, stages: 1, key: 1, version: 1 }, { version: -1 });
            if (!workflow) {
                this.logger.error(`Error in creating child process instance -> Workflow does not exists for key [${parentTask.processDefinitionKey}]`);
                return false;
            }
            const compiledWorkflow = this.compiler.compile(workflow, parentProcessInstance.rootProcessInstanceId, parentProcessInstance._id, parentTask._id);
            const childProcessInstance = await this.processInstanceRepositoryImpl.create(compiledWorkflow);
            const [isValid, error, parameters] = this.validateParameters(parentTask.properties, parentTask?.parameters);
            // if (!isValid && !payload?.parentProcessInstanceId) {
            //     // If flow is started by the API call
            //     throw new CustomError(HttpStatus.BAD_REQUEST, error);
            // }
            await this.startFlow(childProcessInstance, { parentProcessInstanceId: parentProcessInstance._id, parameters: { ...parameters, ...parentProcessInstance.parameters } });
            this.logger.debug(`Child process instantiated: Parent Instance [${parentProcessInstance.name}] -> Parent Task [${parentTask.name}] -> Current Instance [${childProcessInstance.name}]`)
            const condition = {
                _id: parentProcessInstance._id,
                'stages._id': parentTask._id
            }

            const setValues = {
                'stages.$.processInstanceId': childProcessInstance['_id']
            }
            await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        } catch (err) {
            this.logger.error(`Error in creating child process instance for key [${parentTask.processDefinitionKey}] -> `, err);
        }
    }

    /************************************************************************* COMPOUND TASKS END ********************************************************************** */

    /**
     * 
     * @param properties {array} - the input parameters schema for a workflow or a stage in the form of array of objects 
     * @param parameters {object} - input parameters required for a workflow or a stage
     * @param error {string} - error string
     * @returns {array} - [boolean, string], e.g. [false, '[firstName] must be of type [string]']
     */
    validateParameters(properties, parameters = {}, error = '') {
        let isValid = true;
        let _error = error;
        for (let field of properties) {
            let fieldData = parameters[field.key]
            if (fieldData === undefined) {
                if (field?.value?.default !== undefined) {
                    parameters[field.key] = field?.value?.default;
                } else if (field?.value?.required === true || 'true') {
                    [isValid, error] = [false, `[${field.key}] must be present.`];
                    break
                }
            }
            else if (field.value.type === 'object' && fieldData?.toString() === '[object Object]') {
                [isValid, error, parameters] = this.validateParameters(field.value.properties, fieldData, `[${field.key}]`)
            }
            else if (field.value.type == 'array' && Array.isArray(fieldData)) {
                if (field.value.arrayOf == 'number' || 'string' || 'boolean') {
                    for (let j = 0; j < fieldData.length; j++) {
                        if (field.value.arrayOf !== typeof fieldData[j]) {
                            [isValid, error] = [false, `[${field.key}] must be of an array of type [${field.value.arrayOf}].`];
                            break;
                        }
                    }
                    if (!isValid) {
                        break;
                    }
                }
                if (field.value.arrayOf == 'object') {
                    for (let index = 0; index < fieldData.length; index++) {
                        [isValid, error, parameters] = this.validateParameters(field.value.properties, fieldData[index], `[${field.key}]`);
                        if (!isValid) {
                            break;
                        }
                    }
                }

            }
            else if (field.value.type !== typeof fieldData && fieldData !== null) {
                [isValid, error] = [false, `[${field.key}] must be of type [${field.value.type}].`];
                break;
            }
            if (!isValid) {
                break;
            }
        }
        return [isValid, `${_error}.${error}`, parameters];

    }

    /**
     * Validate the definded criteria against the set flags during the process execution
     * @param criteria {object} - object of boolean values, e.g. {showError: true}
     * @param flags {object} - object of boolean values, e.g. {_error: true}
     * @returns {array} - [boolean, string], e.g. [false, 'error']
     */
    validateCriteria(criteria, flags): [boolean, string] {
        if (criteria) {
            let [bool, status] = [true, Constants.STAGE_STATUSES.COMPLETED];

            // for task level criteria
            if (criteria.showError !== undefined) {

                if (criteria.showError && flags?._error) {
                    status = Constants.STAGE_STATUSES.ERROR;
                } else {
                    status = Constants.STAGE_STATUSES.COMPLETED;
                }
                // return [bool, status];
            }
            if (criteria.onErrorComplete !== undefined) {

                if (!criteria.onErrorComplete && flags?._error) {
                    bool = false;
                    // status = Constants.STAGE_STATUSES.ERROR;
                }
                // else {
                //     status = Constants.STAGE_STATUSES.COMPLETED;
                // }
                return [bool, status];
            }

            if (criteria.allCompleted !== undefined && criteria.allCompleted && flags?._allCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED
                return [bool, status];
            }

            if (criteria.anyCompleted !== undefined && criteria.anyCompleted && flags?._anyCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED
                return [bool, status];
            }

            if (criteria.allActivitiesCompleted !== undefined && criteria.allActivitiesCompleted && flags?._allActivitiesCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED
                return [bool, status];
            }

            if (criteria.anyActivitiesCompleted !== undefined && criteria.anyActivitiesCompleted && flags?._anyActivitiesCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED
                return [bool, status];
            }
            if (criteria.mandatoryCompleted !== undefined && criteria.mandatoryCompleted && flags?._mandatoryCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED
                return [bool, status];
            }
            return [bool, status];
        }
        return [true, Constants.STAGE_STATUSES.COMPLETED];
    }

    /**
     * Call the connector client based on the type
     * @param isExternal {boolean} - true means the connector is passed in the input payload
     * @param processInstance {object} - process instance object
     * @param iconnector {object} - connector configuration with data, e.g. {type: "rest", config: {}}
     * @returns {array} - [object, object, object], e.g. [error, data, connector]
     */
    async callConnector(isExternal, processInstance, iconnector) {
        const { parameters } = processInstance;
        let connector = iconnector;
        try {
            let stringifiedConnector = JSON.stringify(iconnector);
            stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstance);
            connector = JSON.parse(stringifiedConnector);
        } catch (e) {
            this.logger.error('Error while parsing the connector => ', e);
        }
        this.logger.debug(`[${connector.type}] connector call`, connector);
        let [err, data] = [null, null];
        switch (connector?.type) {
            case 'rest':
                if (!isExternal && _.isEmpty(connector?.config?.data)) {
                    connector.config.data = parameters;
                }

                if (!_.isEmpty(connector?.config?.query)) {
                    connector.config['params'] = connector.config.query;
                }
                [err, data] = await this.http.call(connector.config);
                break;
            case 'grpc':
                if (!isExternal && _.isEmpty(connector?.config?.methodOptions?.message)) {
                    connector.config.methodOptions.message = parameters;
                }
                [err, data] = await this.grpc.call(connector.config);
                break;
        }
        if (err) {
            this.logger.error('[Connector Response Error] ', err);
        }
        return [err, data, connector];
    }

    // make the multiple tasks active
    /**
     * Make the status 'active' for multiple stages
     * @param processInstanceId {string} - process instance id
     * @param setValues {object} - status data to be updated
     * @returns {object} - updated process instance data wrapped in promise
     */
    async makeMultipleStagesActive(processInstanceId, setValues) {
        const condition = {
            _id: processInstanceId
        }
        const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        for (const stage of response.stages) {
            if (stage.status === Constants.STAGE_STATUSES.ACTIVE && stage.type === Constants.STAGE_TYPES.ACTIVITY) {
                this.logger.debug(`${processInstanceId} - [makeMultipleStagesActive Stage Active] ${stage._id}:${stage.name}:${stage.subType}`);

                this.onStageActive(response, stage);
            }
        };
        return response;
    }

    /**
     * Make the status of a given stage as active
     * @param processInstance {object} - process instance data
     * @param task {object} - activity stage object
     */
    async makeStageActive(processInstance, task) {
        this.logger.debug(`${processInstance.name} - [In function makeStageActive] ${task.name}:${task.status}`);

        if (task && processInstance) {
            const valueReplacedProperties = await this.parseAndReplaceValue(JSON.stringify(task.properties), processInstance);
            const condition = {
                _id: processInstance._id,
                'stages._id': task._id
            };
            const now = Date.now();
            let setValues = {
                'stages.$.status': Constants.STAGE_STATUSES.ACTIVE,
                'stages.$.properties': JSON.parse(valueReplacedProperties),
                'stages.$.timeActivated': now,
                ...(task.subType === Constants.STAGE_SUB_TYPES.TIMER && { 'stages.$.expToCompleteAt': now + task.estimatedTimeDuration }),
            };
            if (task.status !== Constants.STAGE_STATUSES.WAITING) { // re-open condition
                task.history.push({
                    status: task.status,
                    timeActivated: task.timeActivated,
                    parameters: task.parameters,
                    properties: task.properties,
                    timeStarted: task.timeStarted,
                    timeCompleted: task.timeCompleted,
                    _flags: task._flags,
                    _error: task._error,
                    _data: task._data,
                });
                setValues = {
                    ...{
                        'stages.$.status': Constants.STAGE_STATUSES.ACTIVE,
                        'stages.$.timeActivated': now,
                        'stages.$.parameters': null,
                        'stages.$.properties': task.properties,
                        'stages.$.timeStarted': -1,
                        'stages.$.timeCompleted': -1,
                        'stages.$._flags': {},
                        'stages.$._error': null,
                        'stages.$._data': null,
                        'stages.$.history': task.history,
                        'stages.$.expToCompleteAt': now + task.estimatedTimeDuration
                    }
                }
            }

            const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            let stage = response.stages[processInstance._stageIndexJSON[task.key]];

            // let stages = response.stages.filter(stage => stage._id.valueOf() === task._id.valueOf());
            this.logger.debug(`${processInstance.name} - [makeStageActive Stage Active] ${task.name}:${task.subType}`);

            await this.onStageActive(response, stage);
        }
    }

    /**
     * if the task(stage) is active, perform the actions defined for it and make the task status as completed
     * @param processInstance {object} - process instance object
     * @param task {object} - activity stage object
     * @param taskData {object} - input data to complete the task
     * @param assignee {string} - assginee name/id
     * @returns {undefined}
     */
    async makeTaskComplete(processInstance, task, taskData?, assignee?) {
        // if (task.status === Constants.STAGE_STATUSES.COMPLETED || task.status === Constants.STAGE_STATUSES.ON_HOLD) {
        //     this.logger.error(`Task already completed: Parent Instance [${processInstance._id}] -> Task [${task._id}]`);
        //     // this.goToNextStage(processInstance, task.nextStage);
        //     return;
        // }
        let isValid = true;
        let status = Constants.STAGE_STATUSES.COMPLETED;
        let error = '';
        let parameters = {};
        [isValid, error, parameters] = this.validateParameters(task.properties, taskData?.parameters);
        if (!isValid) {
            if (task.subType !== Constants.STAGE_SUB_TYPES.USER_TASK && task.auto) { // internal method call
                this.logger.error(error);
                return;
            } else {
                throw new CustomError(HttpStatus.BAD_REQUEST, error);
            }
        }
        parameters = { ...parameters, ...taskData?.parameters };
        [isValid, status] = this.validateCriteria(task.criteria || processInstance.criteria, task._flags);

        if (!isValid) {
            if (task.subType !== Constants.STAGE_SUB_TYPES.USER_TASK && task.auto) {
                this.logger.error(`Task could not be completed: Parent Instance [${processInstance.name}] -> Task [${task.name}]`);
                return;
            } else {
                throw new CustomError(HttpStatus.BAD_REQUEST, 'Task could not be completed');
            }
        }

        if (taskData?.connector || task.connector) {
            const connector = taskData?.connector || task.connector;
            const isExternal = taskData?.connector ? true : false;
            const [err, data, parsedConnector] = await this.callConnector(isExternal, processInstance, connector);
            if (err) {
                // this.logger.error(`[${connector.type}] connector error => `, connector);
                task._flags['_error'] = true;
                task['_error'] = err;
            }
            if (data) {
                // this.logger.debug(`[${connector.type}] connector success`, connector);
                task['_data'] = data;
                task._flags['_error'] = false;
            }
            task.connector = parsedConnector;
            [isValid, status] = this.validateCriteria(task.criteria || processInstance.criteria, task._flags);
        }

        const condition = {
            _id: processInstance._id,
            'stages._id': task._id
        }
        const setValues = {
            'stages.$.parameters': parameters,
            'stages.$.status': status,
            'stages.$.timeCompleted': Date.now(),
            'stages.$._error': task._error,
            'stages.$._data': task._data,
            'stages.$._flags': task._flags,
            'stages.$.connector': task.connector
        }
        const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        this.logger.debug(`Task updated: Parent Instance [${response.name}] -> Task [${task.name}:${task.subType}] -> Status [${status}]`)

        const updated = await this.updateFlowFlagStatuses(response);
        let stage = updated.stages.find(stage => stage._id.valueOf() === task._id.valueOf());
        if (stage.subType === Constants.STAGE_SUB_TYPES.USER_TASK) {
            this.updateUserTask(processInstance._id, stage, assignee);
        }
        if (isValid) {
            this.iterateNextStages(updated, stage.nextStages);
        }

    }

    /**
     * Change the task's assignee
     * @param processInstanceId {string} - _id of process instance document
     * @param task {object} - activity stage object
     * @param assignee {string} - assignee
     * @param watchers {array} - array of strings, e.g ["UID1", "UID2"]
     */
    async changeTaskAssignee(processInstanceId, task, assignee, watchers,) {
        // if (task.status === Constants.STAGE_STATUSES.COMPLETED || task.status === Constants.STAGE_STATUSES.ON_HOLD) {
        //     this.logger.error(`Task already completed: Parent Instance [${processInstance._id}] -> Task [${task._id}]`);
        //     // this.goToNextStage(processInstance, task.nextStage);
        //     return;

        const condition = {
            _id: processInstanceId,
            'stages._id': task._id
        };
        const setValues = {
            'stages.$.watchers': watchers
        };
        await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        this.logger.log(`User Tasks updated for the task stage [${JSON.stringify(condition)}]`);

        const setValuesTask = { assignee, watchers };
        const condition1 = { processInstanceId, taskId: task._id }
        this.logger.log(`User Tasks updating for condition1 [${JSON.stringify(condition1)}]`);
        this.userTaskRepositoryImpl.updateOne(condition1, setValuesTask).then(response => {
            this.logger.log(`User Tasks updated for the task [${JSON.stringify(response)}]`);
        }).catch(err => {
            this.logger.error(err);
        });

    }

    /**
     * Create a user task in a separate tasks collection
     * @param processInstance {object} - process instance object
     * @param task {object} - activity stage object
     * @param parameters {object} - input parameters
     * @returns {promise}
     */
    async createUserTasks(processInstance, task, parameters?) {
        const userTask = {
            processDefinitionId: processInstance.processDefinitionId,
            processDefinitionKey: processInstance.processDefinitionKey,
            rootProcessInstanceId: processInstance.rootProcessInstanceId,
            processInstanceId: processInstance._id,
            parameters,
            taskId: task._id,
            key: task.key,
            properties: task.properties,
            summary: task.name,
            description: task.description,
            expStartDate: moment().startOf('day').valueOf(),
            expEndDate: moment().add(task.estimatedTimeDuration, 'ms').endOf('day').valueOf(),
            priority: task.priority,
            assignee: task.assignee,
            watchers: task.watchers,
            createdBy: {
                userId: 'system'
            }
        };
        const userTaskDB = await this.userTaskRepositoryImpl.findOne({
            rootProcessInstanceId: processInstance.rootProcessInstanceId,
            processInstanceId: processInstance._id,
            taskId: task._id,
            key: task.key,
        });

        if (!task.assignee && processInstance.assigneeConnector) {
            let connector = JSON.parse(JSON.stringify(processInstance.assigneeConnector));
            connector.config['data'] = userTask;
            this.logger.debug(`[${connector.type}] connector called in createUserTasks `);

            const [err, data] = await this.callConnector(false, processInstance, connector);


            if (data) {
                userTask.assignee = data?.data.assignee;
                userTask.watchers = data?.data.watchers;
                this.logger.debug(`[${connector.type}] connector success`);
            }

            if (userTaskDB) {
                return this.userTaskRepositoryImpl.updateOne({ _id: userTaskDB._id }, { status: 'todo', assignee: userTask.assignee, watchers: userTask.watchers }).then(response => {
                    this.logger.log(`User Task reopened for the task [${task.name}]`);
                }).catch(err => {
                    this.logger.error(err);
                });

            }
            return this.userTaskRepositoryImpl.create(userTask).then(response => {
                this.logger.log(`User Tasks added for the task [${task.name}]`);
            }).catch(err => {
                this.logger.error(err);
            });
        } else {
            if (userTaskDB) {
                return this.userTaskRepositoryImpl.updateOne({ _id: userTaskDB._id }, { status: 'todo' }).then(response => {
                    this.logger.log(`User Task reopened for the task [${task.name}]`);
                }).catch(err => {
                    this.logger.error(err);
                });

            }
            return this.userTaskRepositoryImpl.create(userTask).then(response => {
                this.logger.log(`User Tasks added for the task [${task.name}]`);
            }).catch(err => {
                this.logger.error(err);
            });
        }
    }

    /**
     * Update the user task in tasks collection
     * @param processInstanceId {string} - _id of process instance document
     * @param task {object} - activity stage object
     * @param assignee {string} - assignee
     */
    updateUserTask(processInstanceId, task, assignee) {
        const setValues = {
            status: task.status === 'completed' ? 'done' : task.status,
            timeCompleted: task.timeCompleted,
            completedBy: {
                userId: assignee
            }
        };
        this.userTaskRepositoryImpl.updateOne({ processInstanceId, taskId: task._id }, setValues).then(response => {
            this.logger.log(`User Tasks updated for the task [${task._id}]`);
        }).catch(err => {
            this.logger.error(err);
        });
    }

    /**
     * Switch for the actions to be performed after the stage become active
     * @param processInstance {object} - process instance object
     * @param task {object} - activity stage object
     */
    async onStageActive(processInstance, task) {
        // activities when task becomes active
        this.logger.debug(`[Stage Active] ${processInstance.name}:${task.name}:${task.subType}`);
        const updatedInstance = await this.updateFlowFlagStatuses(processInstance);
        if (task.type === Constants.STAGE_TYPES.ACTIVITY) {
            switch (task.subType) {
                case Constants.STAGE_SUB_TYPES.USER_TASK:
                    await this.createUserTasks(updatedInstance, task, updatedInstance.parameters);
                    // const [isValid, status] = this.validateCriteria({ mandatoryCompleted: true }, updatedInstance._flags);
                    // if (isValid) {
                    //     this.makeFlowEnd(updatedInstance, updatedInstance.stages[updatedInstance._endIndex]);
                    // }
                    break;
                case Constants.STAGE_SUB_TYPES.SYSTEM_TASK:
                    if (task.auto) {
                        this.makeTaskComplete(updatedInstance, task);
                    }
                    break;

                case Constants.STAGE_SUB_TYPES.COMPOUND_TASK:
                case Constants.STAGE_SUB_TYPES.CALL_ACTIVITY:
                    if (task.processDefinitionKey) {
                        if (task.processInstanceId) { // re-open check
                            await this.reopenProcessInstance(task.processInstanceId);
                        } else {
                            await this.createChildProcessInstance(updatedInstance, task);
                        }
                    } else {
                        await this.makeTaskComplete(updatedInstance, task);
                    }
                    break;
                default:
                    this.makeTaskComplete(updatedInstance, task);
                    break;
            }
        }
    }

    /**
     * Start the process instance by taking input parameters
     * @param processInstance {object} - process instance object
     * @param payload {object} - input parameters
     * @returns {promise}
     */
    async startFlow(processInstance, payload) {

        const startStage = processInstance.stages[processInstance._startIndex];
        if (startStage.status === Constants.STAGE_STATUSES.STARTED) {
            if (payload?.parentProcessInstanceId) {
                this.logger.error(`Already ${startStage.status}`);
                return;
            }
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${startStage.status}`);
        };

        // TODO split this function for parallel execution and sequential executuion
        if (processInstance.isParallel) {
            // check for already started parallel flow is to be added, currently it is making all tasks active on API hit
            // remove start and end stage
            // compiledProcessDefinition.stages = compiledProcessDefinition.stages.filter(stage => (stage.subType !== 'start' && stage.subType !== 'end'));

            let skipStages = processInstance.stages.map(obj => {
                if (obj.type === Constants.STAGE_TYPES.ACTIVITY) {
                    return obj.nextStage;
                }
                if (obj.type === Constants.STAGE_TYPES.GATEWAY) {
                    return obj.conditions.map(cond => [cond.onTrueNextStage, ...obj.nextStages]);
                }
            }).flat(Infinity).filter(stage => stage);
            const activeStages = processInstance.stages.map(_stage => {
                const stage = JSON.parse(JSON.stringify(_stage));
                // mark start stage as started
                if (stage.status === Constants.STAGE_STATUSES.ACTIVE) {
                    stage.status = Constants.STAGE_STATUSES.STARTED;
                    stage.timeCompleted = Date.now();
                }

                if (stage.type === Constants.STAGE_TYPES.ACTIVITY && stage.status === Constants.STAGE_STATUSES.WAITING && !skipStages.includes(stage.key)) {
                    stage.status = Constants.STAGE_STATUSES.ACTIVE;
                    stage.timeActivated = Date.now();
                    stage.parentProcessInstanceId = payload?.parentProcessInstanceId;
                }
                return stage;
            });
            const setValues = {
                parameters: payload?.parameters,
                stages: activeStages,
            };
            const response = await this.makeMultipleStagesActive(processInstance._id, setValues);
            this.iterateNextStages(response, response.stages[response._startIndex].nextStages);
            // this.goToNextStage(response, response.stages[response._startIndex].nextStage);

        } else {

            const condition = {
                _id: processInstance._id,
                'stages._id': startStage._id
            };
            const setValues = {
                parameters: payload?.parameters,
                'stages.$.parentProcessInstanceId': payload?.parentProcessInstanceId,
                'stages.$.status': Constants.STAGE_STATUSES.STARTED,
                'stages.$.timeCompleted': Date.now()
            }
            const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            this.iterateNextStages(response, response.stages[response._startIndex].nextStages);
            // this.goToNextStage(response, response.stages[response._startIndex].nextStage);

        }
    }

    /**
     * Make the workflow(process instance) end
     * @param processInstance {object} - process instance object
     * @param task {object} - stage object
     * @param taskData {object} - input parameters
     * @param assignee {string} - assignee
     * @returns {undefined}
     */
    async makeFlowEnd(processInstance, task, taskData?, assignee?) {

        const condition = {
            _id: processInstance._id,
        }
        const setValues = {
            status: Constants.STAGE_STATUSES.COMPLETED,
            timeCompleted: Date.now(),
        };
        if (task) {
            condition['stages._id'] = task._id;
            setValues['stages.$.status'] = Constants.STAGE_STATUSES.COMPLETED;
            setValues['stages.$.timeCompleted'] = Date.now();
        }
        setValues[`stages.${processInstance._stageIndexJSON}.status`] = Constants.STAGE_STATUSES.COMPLETED;
        const activeStage = processInstance.stages.find(obj => obj.status === Constants.STAGE_STATUSES.ACTIVE);
        if (activeStage) {
            const setValues = {
                'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
                'stages.$.timeCompleted': Date.now()
            };

            await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            return;
        } else {
            const [isValid, status] = this.validateCriteria(processInstance.criteria, processInstance._flags);
            if (isValid) {
                const setValues = {
                    status: Constants.STAGE_STATUSES.COMPLETED,
                    timeCompleted: Date.now(),
                    'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
                    'stages.$.timeCompleted': Date.now()
                };
                const response = await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
                this.onFlowEnd(response, assignee);
                return;
            }
            this.logger.log('Flow couldn\'t completed');
        }
        // setValues[`stages.${processInstance._stageIndexJSON}.status`] = Constants.STAGE_STATUSES.COMPLETED;



    }

    /**
     * Actions to be performed after the end of the flow
     * @param processInstance {object} - process instance object
     * @param assignee {string} - assignee
     */
    async onFlowEnd(processInstance, assignee?) {
        try {
            // check if the parent task present, if yes then update the status of parent instance
            if (processInstance.parentTaskId) {
                let parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstance.parentProcessInstanceId, 'stages._id': processInstance.parentTaskId }, { _stageIndexJSON: 1, 'stages.$': 1 });
                if (parentProcessInstance) {
                    let compoundTask = JSON.parse(JSON.stringify(parentProcessInstance.stages[0]));
                    compoundTask._flags = processInstance._flags;
                    this.makeTaskComplete(parentProcessInstance, compoundTask, null, assignee);
                }

            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    /**
     * Move the flow control to the next stage
     * @param inProcessInstance {object} - process instance object
     * @param nextStageKey {string} - next stage key to which control to be shifted
     * @returns {undefined}
     */
    async goToNextStage(inProcessInstance, nextStageKey) {
        const getInstanceStart = await this.processInstanceRepositoryImpl.findOne({ _id: inProcessInstance._id });
        const processInstance = await this.updateFlowFlagStatuses(getInstanceStart);
        if (nextStageKey) {
            let nextStage = processInstance.stages[processInstance._stageIndexJSON[nextStageKey]];
            switch (nextStage?.type) {
                case Constants.STAGE_TYPES.EVENT:
                    switch (nextStage.subType) {
                        case Constants.STAGE_SUB_TYPES.END:
                            // const [isValid, status] = this.validateCriteria({ mandatoryCompleted: true }, processInstance._flags);
                            // if (isValid) {
                            this.makeFlowEnd(processInstance, nextStage);
                            // } else {
                            //     this.makeStageActive(processInstance, nextStage);
                            // }
                            break;
                        case Constants.STAGE_SUB_TYPES.TIMER:
                            this.makeStageActive(processInstance, nextStage);
                            break;
                    }
                    break;
                case Constants.STAGE_TYPES.ACTIVITY:
                    switch (nextStage.subType) {
                        case Constants.STAGE_SUB_TYPES.USER_TASK:
                            this.makeStageActive(processInstance, nextStage);
                            break;
                        case Constants.STAGE_SUB_TYPES.SYSTEM_TASK:
                        case Constants.STAGE_SUB_TYPES.TASK:
                            if (nextStage.auto) {
                                // mark current task as complete
                                this.makeTaskComplete(processInstance, nextStage);
                            } else {
                                this.makeStageActive(processInstance, nextStage);
                            }
                            break;
                        case Constants.STAGE_SUB_TYPES.COMPOUND_TASK:
                        case Constants.STAGE_SUB_TYPES.CALL_ACTIVITY:
                            this.makeStageActive(processInstance, nextStage);
                            break;
                        default:
                            this.makeTaskComplete(processInstance, nextStage);
                            break;
                    }
                    break;
                case Constants.STAGE_TYPES.GATEWAY:
                    // await this.makeStageActive(processInstance, nextStage);
                    await this.gatewayHandler(processInstance, nextStage);
                    break;
                default:
                    const [isValid, status] = this.validateCriteria(processInstance.criteria, processInstance._flags);
                    if (isValid) {
                        this.makeFlowEnd(processInstance, nextStage);
                    } else {
                        this.makeStageActive(processInstance, nextStage);
                    }
                    break;
            }
            return;
        }
        const getInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstance._id });
        const updated = await this.updateFlowFlagStatuses(getInstance);
        if (processInstance.status !== Constants.STAGE_STATUSES.COMPLETED) {
            const [isValid] = this.validateCriteria(updated.criteria, updated._flags);
            if (isValid) {
                this.makeFlowEnd(updated, updated.stages[updated._endIndex]);
            }
        }
        // throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.NEXT_STAGE_NOT_AVAILABLE)
    }

    /**
     * Derive the values for the pre-defined flags
     * @param processInstance {object} - process instance object
     * @returns {promise} - updated process instance object
     */
    async updateFlowFlagStatuses(processInstance) {
        const _flags = {
            _error: false,
            _allCompleted: false,
            _anyCompleted: false,
            _allActivitiesCompleted: false,
            _anyActivitiesCompleted: false,
            _allSuccess: false,
            _anySuccess: false,
            _mandatoryCompleted: false
        };
        const count = {
            all: 0,
            allActivities: 0,
            allMandatoryActivities: 0,
            completed: 0,
            completedActivities: 0,
            successActivities: 0,
            completedMandatoryActivities: 0,
        }
        processInstance.stages.forEach(stage => {
            count.all += 1;
            if (stage.type === Constants.STAGE_TYPES.ACTIVITY) {
                count.allActivities += 1
                if (stage.status === Constants.STAGE_STATUSES.ACTIVE && stage.mandatory) {
                    count.allMandatoryActivities += 1;
                }
                if (stage.status === Constants.STAGE_STATUSES.COMPLETED) {
                    count.completedActivities += 1;
                    _flags._anyActivitiesCompleted = true;
                    if (stage.mandatory) {
                        count.completedMandatoryActivities += 1;
                    }
                    if (!stage._flags?._error) {
                        _flags._anySuccess = true;
                        count.successActivities += 1;
                    }
                }
            }
            if (stage.status === Constants.STAGE_STATUSES.COMPLETED) {
                count.completed += 1;
                _flags._anyCompleted = true;
            }
        });
        if (count.all === count.completed) {
            _flags._allCompleted = true
        }

        if (count.allActivities === count.completedActivities) {
            _flags._allActivitiesCompleted = true
        }

        if (count.allActivities === count.successActivities) {
            _flags._allSuccess = true
        }

        if (count.allMandatoryActivities === count.completedMandatoryActivities) {
            _flags._mandatoryCompleted = true
        }
        const condition = { _id: processInstance._id };
        const setValues = { _flags };
        return await this.processInstanceRepositoryImpl.updateOne(condition, setValues);
    }

    /**
     * make the status of the flow as on-hold
     * if the status for task is hold then mark all the active tasks as on-hold so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowHold(processInstance) {
        const condition = {
            rootProcessInstanceId: processInstance.rootProcessInstanceId,
            status: Constants.STAGE_STATUSES.ACTIVE
        }
        const setValues = {
            status: Constants.STAGE_STATUSES.ON_HOLD,
            timeOnhold: Date.now()
        };
        const response = await this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * make the status of the flow as cancelled
     *  if the status for task is cancel the task's status is on-hold then mark all the active/on-hold tasks as cancelled so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowCancel(processInstance) {
        const condition = {
            rootProcessInstanceId: processInstance.rootProcessInstanceId,
            // status: Constants.STAGE_STATUSES.CANCELLED
        }
        const setValues = {
            status: Constants.STAGE_STATUSES.CANCELLED,
            timeCancelled: Date.now()
        };
        const response = await this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * Resume the flow
     * if the status for task is resume and the task's status is on-hold then mark all the on-hold tasks as active so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowResume(processInstance) {
        const condition = {
            rootProcessInstanceId: processInstance.rootProcessInstanceId,
            status: Constants.STAGE_STATUSES.ON_HOLD
        }
        const setValues = {
            status: Constants.STAGE_STATUSES.ACTIVE,
            timeResumed: Date.now()
        };
        const response = await this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * Save the input parameters
     * @param processInstance {object} - process instance object
     * @param taskData {object} - input parameters
     * @param assignee {string} - assignee
     */
    async saveParams(processInstance, taskData, assignee?) {

        if (taskData?.connector) {
            const connector = taskData?.connector;

            this.logger.debug(`[${connector.type}] connector called in saveParams `, connector);
            await this.callConnector(true, processInstance, connector);
            // if (err) {
            //     this.logger.error(`[${connector.type}] connector error => `, connector);
            //     // task._flags['_error'] = true;
            //     // task['_error'] = err;
            // }
            // if (data) {
            //     this.logger.debug(`[${connector.type}] connector success`, connector);
            //     // task['_data'] = data;
            //     // task._flags['_error'] = false;
            // }
        }

        if (taskData.taskId) {
            const _taskDetails = processInstance.stages.find(obj => obj._id.toString() === taskData.taskId);

            let setValues = { ..._taskDetails?.parameters, ...taskData.parameters };

            await this.processInstanceRepositoryImpl.updateOne({ _id: processInstance._id, 'stages._id': taskData.taskId }, { 'stages.$.parameters': setValues });
            await this.userTaskRepositoryImpl.updateOne({ processInstanceId: processInstance._id, taskId: taskData.taskId }, { updatedBy: { userId: assignee } })
        } else {

            let setValues = {
                parameters: { ...processInstance.parameters, ...taskData.parameters }
            };
            await this.processInstanceRepositoryImpl.updateOne({ _id: processInstance._id }, setValues);
        }

    }

}


