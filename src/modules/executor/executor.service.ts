import { HttpStatus, Logger, Injectable, Inject, OnModuleInit, Scope } from '@nestjs/common';
import { _ } from 'lodash';
import * as moment from 'moment';

import { Constants } from 'src/common/const/constants';
import CustomError from 'src/common/exceptions';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { Compiler } from '../process-instances/providers';
import { WebhookConnector } from 'src/modules/webhooks/providers/webhook.connector';
import { Webhooks } from 'src/common/const/enums';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { KafkaConnector } from 'src/shared/connectors/kafka.connector';
import { SoapResponseParser } from 'src/common/utils';
import { ConnectorRepositoryImpl } from 'src/models/connectors/repository/connectors.repository.impl';
import { ConnectorEvaluate } from 'src/modules/connectors/providers/connector-evaluate';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MysqlConnector } from 'src/shared/connectors/mysql.connector';
import { PostgresConnector } from 'src/shared/connectors/postgres.connector';
import { ref } from 'joi';
import { DataTransformer } from './providers/data-transformer';
import { status } from '@grpc/grpc-js';

@Injectable()
export class ExecutorService implements OnModuleInit {
    private readonly logger: Logger = new Logger(ExecutorService.name);
    instances = {};
    constructor (
        private userTaskRepositoryImpl: UserTasksRepositoryImpl,
        private processInstanceRepositoryImpl: ProcessInstanceRepositoryImpl,
        private processDefinitionRepositoryImpl: ProcessDefinitionRepositoryImpl,
        private http: HttpConnector,
        private grpc: GrpcConnector,
        private compiler: Compiler,
        private webhook: WebhookConnector,
        private soap: SoapConnector,
        private kafka: KafkaConnector,
        private connectorRepositoryImpl: ConnectorRepositoryImpl,
        private connectorEvaluate: ConnectorEvaluate,
        private schedulerRegistry: SchedulerRegistry,
        private mysql: MysqlConnector,
        private postgres: PostgresConnector,
        private dataTransformer: DataTransformer,
        @Inject(REQUEST) private readonly request: Request
    ) { }

    onModuleInit() { }

    updateLocalInstance(instanceData, stageData, processInstanceId, stageKey?) {
        if (stageKey) {
            Object.assign(this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]], stageData);
        }
        if (instanceData) {
            Object.assign(this.instances[processInstanceId], instanceData);
        }
    }

    /**
     * Replace the value reference by the actual value 
     * e.g.change this string "My name is $[stages.<key>.firstName]" to "My name is Sudhir"
     * @param dataString {string} - input data string in which values to be replaced
     * @param processInstance {object} - Process instance data
     * @returns {promise} - datastring wrapped in promise
     */
    async parseAndReplaceValue(dataString: string, processInstanceId, arrayIndices = {}) {

        // temporary fix
        dataString = dataString.replace(/[\n\t]/g, match => {
            if (match === '\n') return '\\n';
            if (match === '\t') return '\\t';
        });

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        this.instances[processInstanceId]['user'] = this.request.headers.authorization;
        this.instances[processInstanceId]['admin'] = this.request.headers['admin-authorization'];
        const regex = /\$\[(.*?)\]\$?/; // match substrings starts with $[ and ends with ]
        // if (dataString.length <= 3000) {
        let match = dataString.match(regex);
        while (match !== null) {
            let replacePattern = match[0];
            let replacePatternWithoutQuote = null;
            let path = match[0];
            if (match[0].endsWith('$')) {
                path = match[0].slice(0, -1);
                replacePattern = `"${match[0]}"`;
            }
            let value = await this.valueLocator(processInstanceId, path, null, arrayIndices);
            // temporary fix
            if (typeof value === 'string') {
                value = value.replace(/[\n\t]/g, match => {
                    if (match === '\n') return '\\n';
                    if (match === '\t') return '\\t';
                });
            }
            let valueWithoutQuote = value;
            if (value === null || typeof value === 'number' || typeof value === 'boolean') {
                replacePattern = `"${match[0]}"`;
                replacePatternWithoutQuote = match[0];
            }
            if (typeof value === 'object') {
                replacePattern = `"${match[0]}"`;
                replacePatternWithoutQuote = match[0];
                // valueWithoutQuote = value;
                const stringifiedValue = JSON.stringify(value);
                if (Array.isArray(value)) {
                    valueWithoutQuote = value;
                } else {
                    valueWithoutQuote = encodeURIComponent(stringifiedValue);
                }
                value = stringifiedValue;
            }


            dataString = dataString.replaceAll(replacePattern, value);
            if (replacePatternWithoutQuote) {
                dataString = dataString.replaceAll(replacePatternWithoutQuote, valueWithoutQuote);
            }

            const matchInd = match?.index;
            match = dataString.match(regex);
            if (matchInd === match?.index) {
                break;
            }
        }
        // }
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
        return parentProcessInstance;
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
    async valueLocator(processInstanceId, path: any, gateway?, arrayIndices = {}) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        // '$[parameters.value]'
        let processInstance = this.instances[processInstanceId];
        if (typeof path === 'string' && path.startsWith('$[') && path.endsWith(']')) {
            let remoteDefinitionKey = null;
            path = path.slice(2, -1).split('=>'); // Input => "$[parameters.firstName=>toUppercase]" Output => ['parameters.firstName', 'toUppercase']
            let _path = path[0].split('.');

            // if value comes in round brackets e.g.(process definition key) it must be other workflow instance
            if (_path[0] && _path[0].startsWith('(') && _path[0].endsWith(')')) {
                remoteDefinitionKey = _path[0].slice(1, -1);
                _path.shift(); // remove process defintion key from array
                if (remoteDefinitionKey !== processInstance.processDefinitionKey) {
                    if (this.instances[`${remoteDefinitionKey}_${processInstance.rootProcessInstanceId}`]) {
                        processInstance = this.instances[`${remoteDefinitionKey}_${processInstance.rootProcessInstanceId}`];
                    } else {
                        processInstance = this.instances[`${remoteDefinitionKey}_${processInstance.rootProcessInstanceId}`] = await this.instanceLocator(remoteDefinitionKey, processInstance.rootProcessInstanceId);
                    }
                }
            }
            if (!processInstance) {
                return null;
            }
            let dependencyCondition = { _id: processInstanceId };
            const newPath = _path.map((keyword, index) => {
                // if value comes in brackets <> e.g.< stage key or stage index > it must be an stage index or stage key
                if ((keyword.startsWith('<') && keyword.endsWith('>')) || (keyword.startsWith('<:') && keyword.endsWith(':>'))) {
                    keyword = keyword.slice(1, -1);
                    if (!keyword) { // if <> is empty, then check if external index is provided
                        keyword = arrayIndices[_path[index - 1]];
                        return keyword;
                    }
                    // if (!isNaN(keyword as any) && !isNaN(parseFloat(keyword))) {
                    //     return parseFloat(keyword);
                    // }
                    dependencyCondition['stages.key'] = keyword;
                    return processInstance?._stageIndexJSON[keyword];
                }
                return keyword;
            });
            if (gateway && gateway.subType === Constants.STAGE_SUB_TYPES.DEPENDENCY) {
                const dependency = {
                    processDefinitionKey: processInstance.processDefinitionKey,
                    stageKey: gateway.key
                };
                // TODO check if defin key is same as current one, then update the instance
                let setValues = dependencyCondition['stages.key'] ? { $addToSet: { 'stages.$.dependencies': dependency } } : { $addToSet: { dependencies: dependency } };
                this.processInstanceRepositoryImpl.updateOne(dependencyCondition, setValues);
            }

            const refValue = _.get(processInstance, newPath);
            if (path[1]) { // if transformation function is present
                return this.dataTransformer.transformData(path[1], refValue);
            }
            return refValue;
        }
        return path;
    }

    /**
     * Evaluate the conditions and return the same array
     * @param processInstance {object} - process instance object
     * @param gateway {object} - gateway stage object
     * @returns {object} - returns an array with evaluated conditions
     */
    conditionEvaluator(processInstanceId, gateway) {

        try {

            //get the conditions
            return gateway.conditions.map(async condition => {

                const variables = { ...condition.variables };
                const variableKeys = Object.keys(variables);

                for (const key of variableKeys) {
                    const value = variables[key];
                    variables[key] = await this.valueLocator(processInstanceId, value, gateway);
                }

                gateway['customParams']['gatewayConditionVariables'][`${condition.name}`] = variables;

                const expression = await this.replaceVariables(condition.expression, variables);
                condition._valid = Function("return " + expression)();;
                return condition;

            });
        } catch (err) {
            this.logger.error(err);
            return gateway.conditions;
        }
    }

    /**
     * replace condition expression variables with variables 
     * @param expression 
     * @param inputObject 
     * @returns 
     */
    replaceVariables(expression, inputObject) {
        const variableNames = expression.match(/(?:[a-zA-Z$_][a-zA-Z$_0-9]*|'(?:true|false|null|undefined)')/g) || [];
        const cleanedVariableNames = variableNames.map(varName => varName.startsWith("'") ? varName.slice(1, -1) : varName);
        const filteredVariableNames = cleanedVariableNames.filter(varName => !['true', 'false', 'null', 'undefined'].includes(varName));
        const dynamicFunction = new Function(...filteredVariableNames, `return ${expression};`);

        const result = dynamicFunction(...filteredVariableNames.map(varName => inputObject[varName]));
        return result;
    }

    /**
     * Evaluate a exclusive gateway conditions
     * @param processInstance {object} - process instance object
     * @param stage {object} - gateway stage object
     * @param conditions {array} - array of conditions
     */
    exclusiveHandler(processInstanceId, gateway, conditions) {
        const cond = conditions.find(cond => {
            if (cond._valid) {
                return cond;
            }
        });

        if (cond) {
            this.goToNextStage(processInstanceId, cond.onTrueNextStage, gateway.key);
        } else {
            this.iterateNextStages(processInstanceId, gateway.nextStages, gateway.key); // TODO need to be changed
        }
    }

    /**
     * Evaluate a inclusive gateway conditions
     * @param processInstance {object} - process instance object
     * @param stage {object} - gateway stage object
     * @param conditions {array} - array of conditions
     */
    inclusiveHandler(processInstanceId, gateway, conditions) {
        const onTrueStages = conditions.filter(cond => {
            if (cond._valid) {
                return cond;
            }
        }).map(obj => obj.onTrueNextStage);
        if (onTrueStages[0]) {
            this.iterateNextStages(processInstanceId, onTrueStages, gateway.key);
        } else {
            this.iterateNextStages(processInstanceId, gateway.nextStages, gateway.key);
        }
    }

    /**
     * Evaluate a dependency gateway conditions
     * @param processInstance {object} - process instance object
     * @param stage {object} - gateway stage object
     * @param conditions {array} - array of conditions
     */
    dependencyHandler(processInstanceId, stage, conditions) {
        let dependencyResolved = true;
        for (let cond of conditions) {
            if (!cond._valid) {
                dependencyResolved = false;
                break;
            }
        };
        if (dependencyResolved && stage.status !== Constants.STAGE_STATUSES.COMPLETED) {
            this.goToNextStage(processInstanceId, stage.nextStages[0], stage.key);
        }
        return dependencyResolved;
    }

    /**
    * Evaluate parallel gateway, no conditions involved.
    * @param processInstance {object} - process instance object
    * @param gateway {object} - gateway stage object
    */
    parallelHandler(processInstanceId, gateway) {
        const sourceStages = this.instances[processInstanceId].stages.filter(stage => stage.nextStages.includes(gateway.key));
        const completedStages = sourceStages.filter(stage => stage.status === Constants.STAGE_STATUSES.COMPLETED || Constants.STAGE_STATUSES.ERROR);
        if (sourceStages.length === completedStages.length) {
            for (const stageKey of gateway.nextStages) {
                this.goToNextStage(processInstanceId, stageKey, gateway.key);
            }
        }
    }

    /**
     * Hop to the next stages attached to a stage 
     * @param processInstance {object} - process instance object
     * @param nextStages {array} - array of stage keys, e.g. ["k1", "k2"]
     */
    async iterateNextStages(processInstanceId, nextStages, currentStageKey?) {
        if (nextStages.length) {
            for (const stageKey of nextStages) {
                this.goToNextStage(processInstanceId, stageKey, currentStageKey);
            }
        } else {
            // const getInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { 'stages.type': 1, 'stages.status': 1, 'stages.mandatory': 1, 'stages._flags': 1 });
            this.updateFlowFlagStatuses(processInstanceId);
            if (this.instances[processInstanceId].status !== Constants.STAGE_STATUSES.COMPLETED) {
                const [isValid, status] = this.validateCriteria(this.instances[processInstanceId].criteria, this.instances[processInstanceId]._flags);
                // Set instance status as error if task as showError = true & status = error;
                if (status === Constants.STAGE_STATUSES.ERROR) {
                    this.instances[processInstanceId]._flags['_error'] = true;
                }
                if (isValid && this.instances[processInstanceId]._endIndex >= 0) {
                    this.makeFlowEnd(processInstanceId, this.instances[processInstanceId].stages[this.instances[processInstanceId]._endIndex].key);
                }
            }
        }
    }

    /**
     * Switch for the multiple gateways based on the subtype
     * @param processInstance {object} - process instance object
     * @param gateway {object} - gateway stage object
     */
    async gatewayHandler(processInstanceId, gatewayKey) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        let gateway = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[gatewayKey]];

        gateway['customParams'] = {
            'gatewayConditionVariables': {}
        };
        const gatewayConditions = await Promise.all(this.conditionEvaluator(processInstanceId, gateway));
        this.logger.debug(`gateway conditions...`, gatewayConditions);

        let complete = true;
        this.logger.debug(`Evaluating [${gateway.subType}] gateway...`);
        switch (gateway.subType) {
            case Constants.STAGE_SUB_TYPES.SWITCH_CASE:
                break;
            case Constants.STAGE_SUB_TYPES.EXCLUSIVE:
                this.exclusiveHandler(processInstanceId, gateway, gatewayConditions);
                break;
            case Constants.STAGE_SUB_TYPES.INCLUSIVE:
                this.inclusiveHandler(processInstanceId, gateway, gatewayConditions);
                break;
            case Constants.STAGE_SUB_TYPES.DEPENDENCY:
                complete = this.dependencyHandler(processInstanceId, gateway, gatewayConditions);
                break;
            case Constants.STAGE_SUB_TYPES.PARALLEL:
                this.parallelHandler(processInstanceId, gateway);
                break;
        }

        const condition = {
            _id: processInstanceId,
            'stages._id': gateway._id
        };

        const setValues = {
            ...(complete && { 'stages.$.status': Constants.STAGE_STATUSES.COMPLETED, 'stages.$.timeCompleted': Date.now() }),
            ...(!complete && { 'stages.$.status': Constants.STAGE_STATUSES.ACTIVE, 'stages.$.timeActivated': Date.now() }),
            'stages.$.conditions': gatewayConditions,
            'stages.$.prevStages': gateway.prevStages,
            'stages.$.customParams': gateway.customParams,
        };
        const setValuesLocal = {
            ...(complete && { status: Constants.STAGE_STATUSES.COMPLETED, timeCompleted: Date.now() }),
            ...(!complete && { status: Constants.STAGE_STATUSES.ACTIVE, timeActivated: Date.now() }),
            conditions: gatewayConditions,
        };

        this.updateLocalInstance(null, setValuesLocal, processInstanceId, gateway.key);
        this.logger.debug(`Evaluated gateway...`, setValues);

        this.processInstanceRepositoryImpl.updateOne(condition, setValues);

    }


    /************************************************************************* GATEWAY END ********************************************************************** */

    /************************************************************************* COMPOUND TASKS START ********************************************************************** */

    /**
     * Re-open the process instance attached to a compound task if the task(stage) is revisited
     * @param processInstanceId {string} - _id of the process instance document
     */
    async reopenProcessInstance(processInstanceId) {
        if (!this.instances[processInstanceId]) {
            this.instances[processInstanceId] = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
        }
        // let processInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { stages: 1, isParallel: 1 });
        if (this.instances[processInstanceId].isParallel) {
            // check for already started parallel flow is to be added, currently it is making all tasks active on API hit
            // remove start and end stage
            // compiledProcessDefinition.stages = compiledProcessDefinition.stages.filter(stage => (stage.subType !== 'start' && stage.subType !== 'end'));

            let skipStages = this.instances[processInstanceId].stages.map(obj => {
                if (obj.type === Constants.STAGE_TYPES.ACTIVITY) {
                    return obj.nextStages;
                }
                if (obj.type === Constants.STAGE_TYPES.GATEWAY) {
                    return obj.conditions.map(cond => [cond.onTrueNextStage, obj.nextStages[0]]);
                }
            }).flat(Infinity).filter(stage => stage);
            const activeStages = this.instances[processInstanceId].stages.map(_stage => {
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

            this.instances[processInstanceId].stages = activeStages;
            this.instances[processInstanceId].status = Constants.STAGE_STATUSES.ACTIVE;

            this.makeMultipleStagesActive(processInstanceId);
            this.iterateNextStages(processInstanceId, this.instances[processInstanceId].stages[this.instances[processInstanceId]._startIndex].nextStages, this.instances[processInstanceId].stages[this.instances[processInstanceId]._startIndex].key);
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
            // this.goToNextStage(response._id, response.stages[response._startIndex].nextStages);

        } else {
            const condition = {
                _id: processInstanceId,
            };
            const setValues = {
                status: Constants.STAGE_STATUSES.ACTIVE,
            };
            this.instances[processInstanceId].status = Constants.STAGE_STATUSES.ACTIVE;

            this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            this.iterateNextStages(processInstanceId, this.instances[processInstanceId].stages[this.instances[processInstanceId]._startIndex].nextStages, this.instances[processInstanceId].stages[this.instances[processInstanceId]._startIndex].key);
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
            // this.goToNextStage(response._id, response.stages[response._startIndex].nextStage);

        }
    }

    /**
     * Create and run a child process instance on activation of the compound task
     * @param parentProcessInstance {object} - parent process instance in which compound task resides
     * @param parentTask {object} - parent stage (compound task) object
     * @returns {undefined|boolean} - returns undefined or false
     */
    async createChildProcessInstance(parentProcessInstanceId, parentStageKey) {
        let parentProcessInstance = this.instances[parentProcessInstanceId];
        let parentTask = parentProcessInstance.stages[this.instances[parentProcessInstanceId]._stageIndexJSON[parentStageKey]];
        try {
            let workflow = null;
            if (parentTask.processDefinitionId) {
                workflow = await this.processDefinitionRepositoryImpl.findOne({ _id: parentTask.processDefinitionId }, { name: 1, description: 1, isParallel: 1, stages: 1, key: 1, version: 1 });
            } else {
                workflow = await this.processDefinitionRepositoryImpl.findOne({ key: parentTask.processDefinitionKey, default: true }, { name: 1, description: 1, isParallel: 1, stages: 1, key: 1, version: 1 });
                if (!workflow) {
                    workflow = await this.processDefinitionRepositoryImpl.findOne({ key: parentTask.processDefinitionKey }, { name: 1, description: 1, isParallel: 1, stages: 1, key: 1, version: 1 }, { version: -1 });
                }
            }
            if (!workflow) {
                this.logger.error(`Error in creating child process instance -> Workflow does not exists for key [${parentTask.processDefinitionKey}]`);
                return false;
            }
            const compiledWorkflow = this.compiler.compile(workflow, parentProcessInstance.rootProcessInstanceId, parentProcessInstance._id, parentTask._id);
            const childProcessInstance = await this.processInstanceRepositoryImpl.create(compiledWorkflow);
            const childProcessInstanceId = childProcessInstance._id.toString();
            // this.instances[childProcessInstanceId] = childProcessInstance;
            // const [isValid, error, parameters] = this.validateParameters(parentTask.properties, parentTask?.parameters);
            // if (!isValid && !payload?.parentProcessInstanceId) {
            //     // If flow is started by the API call
            //     throw new CustomError(HttpStatus.BAD_REQUEST, error);
            // }
            await this.startFlow(childProcessInstance, { parentProcessInstanceId: parentProcessInstance._id, parameters: { ...parentTask?.parameters, ...parentProcessInstance.parameters } });
            this.logger.debug(`Child process instantiated: Parent Instance [${parentProcessInstance._id}] -> Parent Task [${parentTask._id}] -> Current Instance [${childProcessInstance.name}]`);
            const condition = {
                _id: parentProcessInstance._id,
                'stages._id': parentTask._id
            };

            const setValues = {
                'stages.$.processInstanceId': childProcessInstanceId
            };
            parentTask.processInstanceId = childProcessInstanceId;
            this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        } catch (err) {
            this.logger.error(`Error in creating child process instance for key [${parentTask.processDefinitionKey}] -> `, err);
        }
    }

    /************************************************************************* COMPOUND TASKS END ********************************************************************** */

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

                status = Constants.STAGE_STATUSES.COMPLETED;
                return [bool, status];
            }

            if (criteria.anyCompleted !== undefined && criteria.anyCompleted && flags?._anyCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED;
                return [bool, status];
            }

            if (criteria.allActivitiesCompleted !== undefined && criteria.allActivitiesCompleted && flags?._allActivitiesCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED;
                return [bool, status];
            }

            if (criteria.anyActivitiesCompleted !== undefined && criteria.anyActivitiesCompleted && flags?._anyActivitiesCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED;
                return [bool, status];
            }
            if (criteria.mandatoryCompleted !== undefined && criteria.mandatoryCompleted && flags?._mandatoryCompleted) {

                status = Constants.STAGE_STATUSES.COMPLETED;
                return [bool, status];
            }
            return [bool, status];
        }
        return [true, Constants.STAGE_STATUSES.COMPLETED];
    }

    /**
    * Find the connector by connectorId
    * @param connectorId {string} - get connector by connector id
    * @returns {object} - {connector data}, e.g. {}
    */
    async evalConnector(connector, processInstanceId) {
        //let connector = await this.connectorRepositoryImpl.findOne( { _id: connectorId } );
        if (connector) {
            let evaluatedParams = {};
            let params = connector?.config?.variables;
            for (const key in params) {
                const value = params[key];
                evaluatedParams[key] = await this.valueLocator(processInstanceId, value);
            };
            connector.config.variables = evaluatedParams;
            connector = await this.connectorEvaluate.replaceParametersInConnector(connector);
        }
        return connector;
    }

    /**
     * Call the connector client based on the type
     * @param isExternal {boolean} - true means the connector is passed in the input payload
     * @param processInstance {object} - process instance object
     * @param connector {object} - connector configuration with data, e.g. {type: "rest", config: {}}
     * @returns {array} - [object, object, object], e.g. [error, data, connector]
     */
    async callConnector(connector, parameters) {
        this.logger.debug(`[${connector.type}] connector call`, connector);
        let [err, data] = [null, null];
        switch (connector?.type) {
            case 'rest':
                if (connector?.config.method?.toLowerCase() === 'post' || connector?.config.method?.toLowerCase() === 'put' || connector?.config.method?.toLowerCase() === 'patch') {
                    connector.config.data = { ...connector.config.data };
                }

                if (connector?.config?.query) {
                    connector.config['params'] = connector.config.query;
                }
                [err, data] = await this.http.call(connector.config);
                break;
            case 'grpc':
                connector.config.methodOptions['message'] = { ...connector.config.methodOptions.message, ...parameters };
                [err, data] = await this.grpc.call(connector.config);
                break;
            case 'javascript':
                connector.config.data = { ...connector.config.data, ...parameters };
                [err, data] = await this.http.call(connector.config);
                break;
            case 'soap':
                // connector.config['data'] = parameters;
                [err, data] = await this.soap.call(connector.config);
                break;
            case 'kafka':
                connector.config['data'] = JSON.stringify(parameters);
                [err, data] = await this.kafka.call(connector.config);
                break;
            case 'python':
                connector.config.data = { ...connector.config.data, ...parameters };
                [err, data] = await this.http.call(connector.config);
                break;
            case 'mysql':
                // connector.config.data = { ...connector.config.data, ...parameters };
                [err, data] = await this.mysql.call(connector.config);

                break;
            case 'postgresql':
                [err, data] = await this.postgres.call(connector.config);

                break;
            default:
                connector.config.data = { ...connector.config.data, ...parameters };
                [err, data] = await this.http.call(connector.config);
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
    async makeMultipleStagesActive(processInstanceId) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        const condition = {
            _id: processInstanceId
        };
        await this.processInstanceRepositoryImpl.updateOne(condition, { stages: this.instances[processInstanceId].stages });
        for (const stage of this.instances[processInstanceId].stages) {
            if (stage.status === Constants.STAGE_STATUSES.ACTIVE && stage.type === Constants.STAGE_TYPES.ACTIVITY) {
                this.logger.debug(`${processInstanceId} - [makeMultipleStagesActive Stage Active] ${stage._id}:${stage.name}:${stage.subType}`);

                this.onStageActive(processInstanceId, stage.key);
            }
        };
    }

    timerDuration(processInstanceId: string, timer) {
        const callback = () => {
            const now = Date.now();
            this.logger.warn(`[Timer running] - [${timer.name}]`);

            this.makeTimerEventEndV2(processInstanceId, timer, now);

        };
        const stamp = Date.now();
        const timeout = setTimeout(callback, timer.estimatedTimeDuration);
        console.log("timeout---------->", timeout);
        this.schedulerRegistry.addTimeout(`${processInstanceId}_${timer.key}_${stamp}`, timeout);
    }

    /**
     * Make the status of a given stage as active
     * @param processInstance {object} - process instance data
     * @param task {object} - activity stage object
     */
    async makeStageActive(processInstanceId, stageKey) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];
        if (task.status === Constants.STAGE_STATUSES.ACTIVE) {
            return;
        }
        this.logger.debug(`${this.instances[processInstanceId].name} - [In function makeStageActive] ${task.name}:${task.status}`);

        if (task && this.instances[processInstanceId]) {
            const condition = {
                _id: processInstanceId,
                'stages._id': task._id
            };
            const now = Date.now();
            let setValues = {
                'stages.$.status': Constants.STAGE_STATUSES.ACTIVE,
                'stages.$.timeActivated': now,
                ...(task.subType === Constants.STAGE_SUB_TYPES.TIMER && { 'stages.$.expToCompleteAt': now + task.estimatedTimeDuration }),
            };

            task.status = Constants.STAGE_STATUSES.ACTIVE;
            task.timeActivated = now;
            task.expToCompleteAt = task.subType === Constants.STAGE_SUB_TYPES.TIMER ? now + task.estimatedTimeDuration : 0;

            if (task.status !== Constants.STAGE_STATUSES.WAITING && task.status !== Constants.STAGE_STATUSES.RUNNING) { // re-open condition
                task.history.push({
                    status: task.status,
                    timeActivated: task.timeActivated,
                    parameters: task.parameters,
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
                        'stages.$.expToCompleteAt': now + task.estimatedTimeDuration,
                        'stages.$.prevStages': task.prevStages,
                    }
                };

                task.status = Constants.STAGE_STATUSES.ACTIVE;
                task.parameters = null;
                task.timeStarted = -1;
                task.timeCompleted = -1;
                task._flags = {};
                task._error = null;
                task._data = null;
                task.expToCompleteAt = now + task.estimatedTimeDuration;
            }

            if (task.subType === Constants.STAGE_SUB_TYPES.TIMER) {
                this.timerDuration(processInstanceId, task);
            }
            this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);

            this.logger.debug(`${processInstanceId} - [makeStageActive Stage Active] ${task._id}:${task.subType}`);
            this.onStageActive(processInstanceId, stageKey);
        }
    }
    async retry(processInstanceId, stageKey, { retries = 2, retryIntervalMs = 2000 }: { retries: number; retryIntervalMs: number; }) {
        try {
            return await this.caller(processInstanceId, stageKey);
        } catch (error) {
            if (retries <= 0) {
                return;
            }
            await this.sleep(retryIntervalMs);
            return this.retry(processInstanceId, stageKey, { retries: retries - 1, retryIntervalMs });
        }
    }

    async sleep(ms = 0) { return new Promise((resolve) => setTimeout(resolve, ms)); }

    async caller(processInstanceId, stageKey) {
        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];

        if (task.connector) {
            task.connector = await this.evalConnector(task.connector, processInstanceId);
            const [err, data, parsedConnector] = await this.callConnector(task.connector, task.parameters);
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
            this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]] = task;
            if (task?.criteria?.retry && err) {
                throw new Error(err);
            }
        }
        // return task;
    }

    async iterateTaskMultiple(processInstanceId, stageKey, task) {
        try {
            let stringifiedParameters = JSON.stringify(task?.parameters);
            stringifiedParameters = await this.parseAndReplaceValue(stringifiedParameters, processInstanceId);
            task.parameters = JSON.parse(stringifiedParameters);
            this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]] = task;
            task.connector.config.url = decodeURIComponent(task.connector.config.url);
            if (task.parameters.iterationValues && Array.isArray(task.parameters.iterationValues)) {
                const iterations = task.parameters.iterationValues.length;
                task.iterationsCount = iterations;

                const iterationResponses = [];
                for (let ind = 0; ind < iterations; ind++) {
                    let stringifiedConnector = JSON.stringify(task.connector);
                    stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstanceId, { iterationValues: ind });
                    let connector = JSON.parse(stringifiedConnector);
                    connector = await this.evalConnector(connector, processInstanceId);
                    const [err, data, parsedConnector] = await this.callConnector(connector, task.parameters);
                    if (err) {
                        iterationResponses.push(err);
                    }
                    if (data) {
                        iterationResponses.push(data);
                    }
                }
                task['_data'] = iterationResponses;

            } else {
                task._flags['_error'] = true;
                task['_error'] = { message: 'Iteration value must of type Array' };
            }


        } catch (e) {
            this.logger.error('Error while parsing the connector => ', e);
            task._flags['_error'] = true;
            task['_error'] = { message: 'Error while parsing the connector' };
        }
        this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]] = task;

    }

    async iterateTaskOnce(processInstanceId, stageKey, task) {

        try {
            let stringifiedParameters = JSON.stringify(task?.parameters);
            stringifiedParameters = await this.parseAndReplaceValue(stringifiedParameters, processInstanceId);
            task.parameters = JSON.parse(stringifiedParameters);

            task.connector.config.url = decodeURIComponent(task.connector.config.url);
            let stringifiedConnector = JSON.stringify(task.connector);
            stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstanceId);
            task.connector = JSON.parse(stringifiedConnector);
            this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]] = task;
        } catch (e) {
            this.logger.error('Error while parsing the connector => ', e);
        }

        if (task?.criteria?.retry) {
            await this.retry(processInstanceId, stageKey, { retries: task?.criteria?.retries, retryIntervalMs: task?.criteria?.retryIntervalMs });
            // }
        } else {
            await this.caller(processInstanceId, stageKey);
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
    async makeTaskComplete(processInstanceId, stageKey, taskData?, assignee?) {
        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];
        let isValid = true;
        let status = Constants.STAGE_STATUSES.COMPLETED;

        // if ( task.subType !== Constants.STAGE_SUB_TYPES.COMPOUND_TASK && ( taskData?.validationId || taskData?.parameters ) ) {

        //     [isValid, error] = await this.validationService.validateParameters(taskData?.validationId, taskData?.parameters);
        //     if (!isValid) {
        //         if (task.subType !== Constants.STAGE_SUB_TYPES.USER_TASK && task.auto) { // internal method call
        //             this.logger.error(error);
        //             return;
        //         } else {
        //             throw new CustomError(HttpStatus.BAD_REQUEST, error);
        //         }
        //     }
        // }
        task.parameters = task.parameters || { ...this.instances[processInstanceId].parameters, ...taskData?.parameters };
        [isValid, status] = this.validateCriteria(this.instances[processInstanceId].criteria, task._flags);

        // Set instance status as error if task as showError = true & status = error;
        let errorStatus = null;
        if (task.criteria?.showError === true && status === Constants.STAGE_STATUSES.ERROR) {
            this.instances[processInstanceId]._flags['_error'] = true;
            this.instances[processInstanceId].criteria['showError'] = true;
            this.instances[processInstanceId].status = status;
            errorStatus = status;
        }
        if (!isValid) {
            if (task.subType !== Constants.STAGE_SUB_TYPES.USER_TASK && task.auto) {
                this.logger.error(`Task could not be completed: Parent Instance [${processInstanceId}] -> Task [${task._id}]`);
                return;
            } else {
                throw new CustomError(HttpStatus.BAD_REQUEST, 'Task could not be completed');
            }
        }
        try {
            // let connector = await this.connectorRepositoryImpl.findOne({ _id: task.connectorId });
            // let params = connector.variables;
            // let evaluatedParams = {};
            // for (const key in params) {
            //     const value = params[key];
            //     evaluatedParams[key] = await this.valueLocator(processInstanceId, value);
            // };
            // connector.variables = evaluatedParams;
            // connector = await this.connectorEvaluate.replaceParametersInConnector(connector);
            // console.log("config 1 ======> ", task.connector.config)
            // if(task?.connector?.config?.url) {
            //     task.connector.config.url = decodeURIComponent(task.connector.config.url);
            // }
            // console.log("config 2 ======> ", task.connector.config)
            // let stringifiedConnector = JSON.stringify(task.connector);
            // stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstanceId);
            // task.connector = JSON.parse(stringifiedConnector);
            // this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]] = task;
        } catch (e) {
            this.logger.error('Error while parsing the connector => ', e);
        }

        if (task.connector) {
            if (task.isIterative) {
                await this.iterateTaskMultiple(processInstanceId, stageKey, task);
            } else {
                await this.iterateTaskOnce(processInstanceId, stageKey, task);
            }
            task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];
        }

        //////////////
        [isValid, status] = this.validateCriteria(this.instances[processInstanceId]?.criteria || task.criteria, task._flags);

        // Set instance status as error if task as showError = true & status = error;
        if (task.criteria?.showError === true && status === Constants.STAGE_STATUSES.ERROR) {
            this.instances[processInstanceId]._flags['_error'] = true;
            this.instances[processInstanceId].criteria['showError'] = true;
            this.instances[processInstanceId].status = status;
            errorStatus = status;
        }
        const condition = {
            _id: processInstanceId,
            'stages._id': task._id
        };
        const setValues = {
            ...(errorStatus !== null && { status: errorStatus, 'criteria._error': true }), // if the task showError is true and return status is error
            'stages.$.parameters': task.parameters,
            'stages.$.status': status,
            'stages.$.timeActivated': task.timeActivated,
            'stages.$.timeCompleted': Date.now(),
            'stages.$._error': task._error,
            'stages.$._data': task._data,
            'stages.$._flags': task._flags,
            'stages.$.connector': task.connector,
            'stages.$.iterationsCount': task.iterationsCount,
            'stages.$.prevStages': task.prevStages,
        };

        task.status = status;
        task.timeCompleted = Date.now();

        this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        this.logger.debug(`Task updated: Parent Instance [${processInstanceId}] -> Task [${task._id}:${task.subType}] -> Status [${status}]`);

        this.updateFlowFlagStatuses(processInstanceId);
        if (task.subType === Constants.STAGE_SUB_TYPES.USER_TASK) {
            this.updateUserTask(processInstanceId, task.key, assignee);
        }
        if (isValid) {
            this.iterateNextStages(processInstanceId, task.nextStages, task.key);
        }

        // Revisit this logic (dependency gateway)
        const dependencies = _.pullAllWith(_.unionWith(this.instances[processInstanceId]?.dependencies, task?.dependencies, _.isEqual), [{ processDefinitionKey: this.instances[processInstanceId]?.processDefinitionKey, stageKey: task.nextStages[0] }], _.isEqual);
        if (dependencies.length) {
            this.triggerDependencyGateway(this.instances[processInstanceId].rootProcessInstanceId, dependencies);
        }

        if (task._flags._error) {
            this.webhook.callWebhook(Webhooks.FAILURE_INSTANCE, { processDefinitionId: this.instances[processInstanceId].processDefinitionId, processInstanceId, status: this.instances[processInstanceId].status, task });
        } else {
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
        }

    }

    /**
     * Change the task's assignee
     * @param processInstanceId {string} - _id of process instance document
     * @param task {object} - activity stage object
     * @param assignee {string} - assignee
     * @param watchers {array} - array of strings, e.g ["UID1", "UID2"]
     */

    // make the task complete
    async changeTaskAssignee(processInstanceId, task, assignee, watchers,) {
        const condition = {
            _id: processInstanceId,
            'stages._id': task._id
        };
        const setValues = {
            'stages.$.watchers': watchers
        };
        this.processInstanceRepositoryImpl.updateOne(condition, setValues);
        this.logger.log(`User Tasks updated for the task stage [${JSON.stringify(condition)}]`);

        const setValuesTask = { assignee, watchers };
        const condition1 = { processInstanceId, taskId: task._id };
        this.logger.log(`User Tasks updating for condition1 [${JSON.stringify(condition1)}]`);
        this.userTaskRepositoryImpl.updateOne(condition1, setValuesTask).then(response => {
            this.logger.log(`User Tasks updated for the task [${JSON.stringify(response)}]`);
        }).catch(err => {
            this.logger.error(err);
        });

    }


    async triggerDependencyGateway(rootProcessInstanceId, dependencies) {
        dependencies.forEach(async gateway => {
            const instance = await this.processInstanceRepositoryImpl.findOne({ rootProcessInstanceId, processDefinitionKey: gateway.processDefinitionKey, 'stages.key': gateway.stageKey });
            if (instance) {
                let gatewayStage = instance.stages[instance._stageIndexJSON[gateway.stageKey]];
                if (gatewayStage.status === Constants.STAGE_STATUSES.ACTIVE) {
                    this.goToNextStage(instance._id.toString(), gateway.stageKey, gatewayStage.key);
                }
            }
        });
    }

    /**
    * Create a user task in a separate tasks collection
    * @param processInstance {object} - process instance object
    * @param task {object} - activity stage object
    * @param parameters {object} - input parameters
    * @returns {promise}
    */
    async createUserTasks(processInstanceId, stageKey) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];

        const userTask = {
            processDefinitionId: this.instances[processInstanceId].processDefinitionId,
            processDefinitionKey: this.instances[processInstanceId].processDefinitionKey,
            rootProcessInstanceId: this.instances[processInstanceId].rootProcessInstanceId,
            processInstanceId: this.instances[processInstanceId]._id,
            parameters: this.instances[processInstanceId].parameters,
            taskId: task._id,
            formId: task.formId,
            key: task.key,
            summary: task.name,
            description: task.description,
            expStartDate: moment().startOf('day').valueOf(),
            expEndDate: moment().add(task.estimatedTimeDuration, 'ms').endOf('day').valueOf(),
            priority: task.priority,
            assignee: task.assignee,
            watchers: task.watchers,
            customParams: task.customParams,
            createdBy: {
                userId: 'system'
            }
        };
        this.webhook.callWebhook(Webhooks.CREATE_TASK, userTask);

        const userTaskDB = await this.userTaskRepositoryImpl.findOne({
            rootProcessInstanceId: this.instances[processInstanceId].rootProcessInstanceId,
            processInstanceId,
            taskId: task._id,
            key: task.key,
        });
        if (!task.assignee && this.instances[processInstanceId].assigneeConnector) {
            try {
                this.instances[processInstanceId].assigneeConnector.config.url = decodeURIComponent(this.instances[processInstanceId].assigneeConnector.config.url);
                let stringifiedConnector = JSON.stringify(this.instances[processInstanceId].assigneeConnector);
                stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstanceId);
                this.instances[processInstanceId].assigneeConnector = JSON.parse(stringifiedConnector);
            } catch (e) {
                this.logger.error('Error while parsing the assignee connector => ', e);
            }

            let connector = await this.evalConnector(this.instances[processInstanceId].assigneeConnector, processInstanceId);
            // connector = this.instances[processInstanceId].assigneeConnector;
            // connector = JSON.parse(JSON.stringify(connector));
            // connector.config['data'] = {};
            this.logger.debug(`[${connector.type}] connector called in createUserTasks `);

            const [err, data] = await this.callConnector(connector, userTask);

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
    async updateUserTask(processInstanceId, stageKey, assignee) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];
        const setValues = {
            status: task.status === 'completed' ? 'done' : task.status,
            timeCompleted: task.timeCompleted,
            completedBy: {
                userId: assignee
            }
        };
        this.webhook.callWebhook(Webhooks.UPDATE_TASK, setValues);
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
    async onStageActive(processInstanceId, stageKey) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        // activities when task becomes active
        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];

        this.logger.debug(`[Stage Active] ${processInstanceId}:${task._id}:${task.subType}`);
        this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
        // this.updateFlowFlagStatuses(processInstanceId);
        if (task.type === Constants.STAGE_TYPES.ACTIVITY) {
            switch (task.subType) {
                case Constants.STAGE_SUB_TYPES.USER_TASK:
                    await this.createUserTasks(processInstanceId, stageKey);
                    // const [isValid, status] = this.validateCriteria({ mandatoryCompleted: true }, updatedInstance._flags);
                    // if (isValid) {
                    //     this.makeFlowEnd(updatedInstance, updatedInstance.stages[updatedInstance._endIndex]);
                    // }
                    break;
                case Constants.STAGE_SUB_TYPES.SCRIPT_TASK:
                case Constants.STAGE_SUB_TYPES.SYSTEM_TASK:
                    if (task.auto) {
                        this.makeTaskComplete(processInstanceId, stageKey);
                    }
                    break;

                case Constants.STAGE_SUB_TYPES.COMPOUND_TASK:
                case Constants.STAGE_SUB_TYPES.CALL_ACTIVITY:
                    if (task.processDefinitionKey) {
                        if (task.processInstanceId) { // re-open check
                            this.reopenProcessInstance(task.processInstanceId);
                        } else {
                            this.createChildProcessInstance(processInstanceId, stageKey);
                        }
                    } else {
                        this.makeTaskComplete(processInstanceId, stageKey);
                    }
                    break;
                default:
                    this.makeTaskComplete(processInstanceId, stageKey);
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
        const processInstanceId = processInstance._id.toString();
        this.instances[processInstanceId] = processInstance;
        const startStage = processInstance.stages[processInstance._startIndex];
        if (startStage.status === Constants.STAGE_STATUSES.STARTED) {
            if (payload?.parentProcessInstanceId) {
                this.logger.error(`Already ${startStage.status}`);
                return;
            }
            throw new CustomError(HttpStatus.BAD_REQUEST, `Already ${startStage.status}`);
        };
        const now = Date.now();
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
                    stage.timeCompleted = now;
                }

                if (stage.type === Constants.STAGE_TYPES.ACTIVITY && stage.status === Constants.STAGE_STATUSES.WAITING && !skipStages.includes(stage.key)) {
                    stage.status = Constants.STAGE_STATUSES.ACTIVE;
                    stage.timeActivated = now;
                    stage.parentProcessInstanceId = payload?.parentProcessInstanceId;
                }
                return stage;
            });

            this.instances[processInstanceId].parameters = payload?.parameters;
            this.instances[processInstanceId].stages = activeStages;

            this.makeMultipleStagesActive(processInstanceId);
            this.iterateNextStages(processInstanceId, processInstance.stages[processInstance._startIndex].nextStages, processInstance.stages[processInstance._startIndex].key);
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
            // this.goToNextStage(response._id, response.stages[response._startIndex].nextStage);

        } else {

            const condition = {
                _id: processInstance._id,
                'stages._id': startStage._id
            };
            const setValues = {
                parameters: payload?.parameters,
                'stages.$.parentProcessInstanceId': payload?.parentProcessInstanceId,
                'stages.$.status': Constants.STAGE_STATUSES.STARTED,
                'stages.$.timeActivated': now,
                'stages.$.timeCompleted': now
            };

            startStage.parentProcessInstanceId = payload?.parentProcessInstanceId;
            startStage.status = Constants.STAGE_STATUSES.STARTED;
            startStage.timeActivated = now;
            startStage.timeCompleted = now;

            this.instances[processInstanceId].parameters = payload?.parameters;

            this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            this.iterateNextStages(processInstanceId, startStage.nextStages, startStage.key);
            this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
            // this.goToNextStage(response._id, response.stages[response._startIndex].nextStage);

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
    async makeFlowEnd(processInstanceId, stageKey, taskData?, assignee?) {

        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        const now = Date.now();
        let errorStatus = null;
        const condition = {
            _id: processInstanceId,
        };

        this.instances[processInstanceId].status = this.instances[processInstanceId].criteria?.showError && this.instances[processInstanceId]._flags?._error ? Constants.STAGE_STATUSES.ERROR : Constants.STAGE_STATUSES.COMPLETED;
        this.instances[processInstanceId].timeCompleted = now;

        const setValues = {
            status: this.instances[processInstanceId].status,
            timeCompleted: now
        };


        let task = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[stageKey]];
        if (task) {
            condition['stages._id'] = task._id;
            setValues['stages.$.status'] = Constants.STAGE_STATUSES.COMPLETED;
            setValues['stages.$.timeCompleted'] = now;

            task.status = Constants.STAGE_STATUSES.COMPLETED;
            task.timeCompleted = now;
        }
        setValues[`stages.${this.instances[processInstanceId]._stageIndexJSON}.status`] = Constants.STAGE_STATUSES.COMPLETED;
        const activeStage = this.instances[processInstanceId].stages.find(obj => obj.status === Constants.STAGE_STATUSES.ACTIVE);
        if (activeStage) {
            const setValues = {
                status: this.instances[processInstanceId].status,
                'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
                'stages.$.timeCompleted': now
            };
            this.processInstanceRepositoryImpl.updateOne(condition, setValues);
            return;
        } else {
            const [isValid, status] = this.validateCriteria(this.instances[processInstanceId].criteria, this.instances[processInstanceId]._flags);
            // Set instance status as error if task as showError = true & status = error;

            if (task.criteria?.showError === true && status === Constants.STAGE_STATUSES.ERROR) {
                this.instances[processInstanceId]._flags['_error'] = true;
                this.instances[processInstanceId].criteria['showError'] = true;
                this.instances[processInstanceId].status = status;
                errorStatus = status;
            }

            if (isValid) {
                const setValues = {
                    status: errorStatus || Constants.STAGE_STATUSES.COMPLETED,
                    timeCompleted: now,
                    'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
                    'stages.$.timeCompleted': now
                };

                this.processInstanceRepositoryImpl.updateOne(condition, setValues);
                this.webhook.callWebhook(Webhooks.UPDATE_INSTANCE, this.instances[processInstanceId]);
                this.onFlowEnd(processInstanceId, assignee);
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
    async onFlowEnd(processInstanceId, assignee?) {
        try {

            if (!this.instances[processInstanceId]) {
                const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
                this.instances[processInstanceId] = parentProcessInstance;
            }

            // check if the parent task present, if yes then update the status of parent instance
            this.logger.debug(`[Flow end] ${processInstanceId}`);

            if (this.instances[processInstanceId].parentTaskId) {
                let parentProcessInstance = this.instances[this.instances[processInstanceId].parentProcessInstanceId]; //await this.processInstanceRepositoryImpl.findOne({ _id: this.instances[processInstanceId].parentProcessInstanceId, 'stages._id': processInstance.parentTaskId }, { _stageIndexJSON: 1, 'stages.$': 1 });
                if (parentProcessInstance) {
                    const stage = parentProcessInstance.stages.find(obj => obj._id.toString() === this.instances[processInstanceId].parentTaskId);
                    let compoundTask = parentProcessInstance.stages[parentProcessInstance._stageIndexJSON[stage.key]];
                    compoundTask._flags = this.instances[processInstanceId]._flags;
                    this.makeTaskComplete(this.instances[processInstanceId].parentProcessInstanceId, compoundTask.key, null, assignee);
                } else {
                    parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: this.instances[processInstanceId].parentProcessInstanceId });
                    this.instances[this.instances[processInstanceId].parentProcessInstanceId] = parentProcessInstance;
                }
                const stage = parentProcessInstance.stages.find(obj => obj._id.valueOf() === this.instances[processInstanceId].parentTaskId);
                let compoundTask = parentProcessInstance.stages[parentProcessInstance._stageIndexJSON[stage.key]];
                compoundTask._flags = this.instances[processInstanceId]._flags;
                this.makeTaskComplete(this.instances[processInstanceId].parentProcessInstanceId, compoundTask.key, null, assignee);

            }
            // delete this.instances[processInstanceId];

        } catch (err) {
            this.logger.error("err in onflow end", err);
        }
    }

    /**
     * Move the flow control to the next stage
     * @param inProcessInstance {object} - process instance object
     * @param nextStageKey {string} - next stage key to which control to be shifted
     * @returns {undefined}
     */
    async goToNextStage(processInstanceId, nextStageKey, currentStageKey?) {
        this.logger.log(`Moving from stage [${currentStageKey}] to [${nextStageKey}]`);
        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }

        if (this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[nextStageKey]].status === Constants.STAGE_STATUSES.RUNNING) {
            return;
        }
        this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[nextStageKey]].status = Constants.STAGE_STATUSES.RUNNING;
        this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[nextStageKey]].prevStages.push(currentStageKey);
        // const getInstanceStart = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { 'stages.type': 1, 'stages.status': 1, 'stages.mandatory': 1, 'stages._flags': 1 });
        this.updateFlowFlagStatuses(processInstanceId);
        if (nextStageKey) {
            let nextStage = this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[nextStageKey]];

            switch (nextStage?.type) {
                case Constants.STAGE_TYPES.EVENT:
                    switch (nextStage.subType) {
                        case Constants.STAGE_SUB_TYPES.END:
                            // const [isValid, status] = this.validateCriteria({ mandatoryCompleted: true }, processInstance._flags);
                            // if (isValid) {
                            this.makeFlowEnd(processInstanceId, nextStage.key);
                            // } else {
                            //     this.makeStageActive(processInstance, nextStage);
                            // }
                            break;
                        case Constants.STAGE_SUB_TYPES.TIMER:
                            this.makeStageActive(processInstanceId, nextStage.key);
                            break;
                    }
                    break;
                case Constants.STAGE_TYPES.ACTIVITY:
                    switch (nextStage.subType) {
                        case Constants.STAGE_SUB_TYPES.USER_TASK:
                            this.makeStageActive(processInstanceId, nextStage.key);
                            break;
                        case Constants.STAGE_SUB_TYPES.SCRIPT_TASK:
                        case Constants.STAGE_SUB_TYPES.SYSTEM_TASK:
                        case Constants.STAGE_SUB_TYPES.TASK:
                            if (nextStage.auto) {
                                // mark current task as complete
                                nextStage.timeActivated = Date.now();
                                this.makeTaskComplete(processInstanceId, nextStage.key);
                            } else {
                                this.makeStageActive(processInstanceId, nextStage.key);
                            }
                            break;
                        case Constants.STAGE_SUB_TYPES.COMPOUND_TASK:
                        case Constants.STAGE_SUB_TYPES.CALL_ACTIVITY:
                            this.makeStageActive(processInstanceId, nextStage.key);
                            break;
                        default:
                            nextStage.timeActivated = Date.now();
                            this.makeTaskComplete(processInstanceId, nextStage.key);
                            break;
                    }
                    break;
                case Constants.STAGE_TYPES.GATEWAY:
                    // await this.makeStageActive(processInstance, nextStage);
                    await this.gatewayHandler(processInstanceId, nextStage.key);
                    break;
                default:
                    const [isValid, status] = this.validateCriteria(this.instances[processInstanceId].criteria, this.instances[processInstanceId]._flags);
                    // Set instance status as error if task as showError = true & status = error;
                    if (status === Constants.STAGE_STATUSES.ERROR) {
                        this.instances[processInstanceId]._flags['_error'] = true;
                    }
                    if (isValid && this.instances[processInstanceId]._endIndex >= 0) {
                        this.makeFlowEnd(processInstanceId, nextStage.key);
                    } else {
                        this.makeStageActive(processInstanceId, nextStage.key);
                    }
                    break;
            }
            return;
        }
        // const getInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId }, { 'stages.type': 1, 'stages.status': 1, 'stages.mandatory': 1, 'stages._flags': 1 });
        // await this.updateFlowFlagStatuses(processInstanceId);
        if (this.instances[processInstanceId].status !== Constants.STAGE_STATUSES.COMPLETED) {
            const [isValid, status] = this.validateCriteria(this.instances[processInstanceId].criteria, this.instances[processInstanceId]._flags);
            // Set instance status as error if task as showError = true & status = error;

            if (status === Constants.STAGE_STATUSES.ERROR) {
                this.instances[processInstanceId]._flags['_error'] = true;
            }
            if (isValid && this.instances[processInstanceId]._endIndex >= 0) {
                this.makeFlowEnd(processInstanceId, this.instances[processInstanceId].stages[this.instances[processInstanceId]._endIndex].key);
            }
        }
        // throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.NEXT_STAGE_NOT_AVAILABLE)
    }

    /**
     * Derive the values for the pre-defined flags
     * @param processInstance {object} - process instance object
     * @returns {promise} - updated process instance object
     */
    async updateFlowFlagStatuses(processInstanceId) {
        if (!this.instances[processInstanceId]) {
            const parentProcessInstance = await this.processInstanceRepositoryImpl.findOne({ _id: processInstanceId });
            this.instances[processInstanceId] = parentProcessInstance;
        }
        const _flags = {
            ...{
                _error: false,
                _allCompleted: false,
                _anyCompleted: false,
                _allActivitiesCompleted: false,
                _anyActivitiesCompleted: false,
                _allSuccess: false,
                _anySuccess: false,
                _mandatoryCompleted: false
            }, ... this.instances[processInstanceId]._flags
        };
        const count = {
            all: 0,
            allActivities: 0,
            allMandatoryActivities: 0,
            completed: 0,
            completedActivities: 0,
            successActivities: 0,
            completedMandatoryActivities: 0,
        };

        this.instances[processInstanceId].stages.forEach(stage => {
            count.all += 1;
            if (stage.type === Constants.STAGE_TYPES.ACTIVITY) {
                count.allActivities += 1;
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
            _flags._allCompleted = true;
        }

        if (count.allActivities === count.completedActivities) {
            _flags._allActivitiesCompleted = true;
        }

        if (count.allActivities === count.successActivities) {
            _flags._allSuccess = true;
        }

        if (count.allMandatoryActivities === count.completedMandatoryActivities) {
            _flags._mandatoryCompleted = true;
        }
        const condition = { _id: processInstanceId };
        const setValues = { _flags };
        this.instances[processInstanceId]._flags = _flags;
        this.processInstanceRepositoryImpl.updateOne(condition, setValues);
    }

    /**
     * make the status of the flow as on-hold
     * if the status for task is hold then mark all the active tasks as on-hold so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowHold(processInstanceId) {
        if (!this.instances[processInstanceId]) {
            return;
        }
        const condition = {
            rootProcessInstanceId: this.instances[processInstanceId].rootProcessInstanceId,
            status: Constants.STAGE_STATUSES.ACTIVE
        };
        const setValues = {
            status: Constants.STAGE_STATUSES.ON_HOLD,
            timeOnhold: Date.now()
        };
        this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * make the status of the flow as cancelled
     *  if the status for task is cancel the task's status is on-hold then mark all the active/on-hold tasks as cancelled so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowCancel(processInstanceId) {
        const condition = {
            rootProcessInstanceId: this.instances[processInstanceId].rootProcessInstanceId,
            // status: Constants.STAGE_STATUSES.CANCELLED
        };
        const setValues = {
            status: Constants.STAGE_STATUSES.CANCELLED,
            timeCancelled: Date.now()
        };
        this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * Resume the flow
     * if the status for task is resume and the task's status is on-hold then mark all the on-hold tasks as active so the instance
     * @param processInstance {object} - process instance object
     */
    async makeFlowResume(processInstanceId) {
        const condition = {
            rootProcessInstanceId: this.instances[processInstanceId].rootProcessInstanceId,
            status: Constants.STAGE_STATUSES.ON_HOLD
        };
        const setValues = {
            status: Constants.STAGE_STATUSES.ACTIVE,
            timeResumed: Date.now()
        };
        this.processInstanceRepositoryImpl.updateMany(condition, setValues);
    }

    /**
     * Save the input parameters
     * @param processInstance {object} - process instance object
     * @param taskData {object} - input parameters
     * @param assignee {string} - assignee
     */
    async saveParams(processInstanceId, taskData, assignee?) {

        if (taskData?.connector) {
            taskData.connector = await this.evalConnector(taskData?.connector, processInstanceId);
            try {
                let stringifiedConnector = JSON.stringify(taskData.connector);

                stringifiedConnector = await this.parseAndReplaceValue(stringifiedConnector, processInstanceId);
                taskData.connector = JSON.parse(stringifiedConnector);
                this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[taskData.key]] = taskData;
            } catch (e) {
                this.logger.error('Error while parsing the connector => ', e);
            }
            this.logger.debug(`[${taskData.connector.type}] connector called in saveParams `, taskData.connector);
            this.callConnector(taskData.connector, taskData.parameters);
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
            const _taskDetails = this.instances[processInstanceId].stages.find(obj => obj._id.toString() === taskData.taskId);
            let setValues = { ..._taskDetails?.parameters, ...taskData.parameters };

            this.processInstanceRepositoryImpl.updateOne({ _id: processInstanceId, 'stages._id': taskData.taskId }, { 'stages.$.parameters': setValues });
            this.userTaskRepositoryImpl.updateOne({ processInstanceId, taskId: taskData.taskId }, { updatedBy: { userId: assignee } });
        } else {

            let setValues = {
                parameters: { ...this.instances[processInstanceId].parameters, ...taskData.parameters }
            };
            this.processInstanceRepositoryImpl.updateOne({ _id: processInstanceId }, setValues);
        }

    }

    async makeTimerEventEnd(headers) {
        this.logger.debug(`Executing timer for tenant [${headers['x-tenant-id']}] ...`);
        const now = Date.now();
        const condition = {
            stages: { $elemMatch: { subType: Constants.STAGE_SUB_TYPES.TIMER, status: Constants.STAGE_STATUSES.ACTIVE, expToCompleteAt: { $lte: now } } }
        };
        const instances = await this.processInstanceRepositoryImpl.find(condition);

        const setValues = {
            'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
            'stages.$.timeCompleted': now
        };

        await this.processInstanceRepositoryImpl.updateMany(condition, setValues);
        for (const instance of instances) {

            const processInstanceId = instance._id.toString();
            this.instances[processInstanceId] = instance;
            const timer = instance.stages.find(obj => obj.subType === Constants.STAGE_SUB_TYPES.TIMER && obj.status === Constants.STAGE_STATUSES.ACTIVE && obj.expToCompleteAt < now);
            this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[timer.key]].status = timer.status = Constants.STAGE_STATUSES.COMPLETED;
            this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[timer.key]].timeCompleted = now;
            this.iterateNextStages(processInstanceId, timer.nextStages, timer.key);
        };

    }

    async makeTimerEventEndV2(processInstanceId, timer, now) {
        const condition = {
            _id: processInstanceId,
            'stages._id': timer._id
        };

        const setValues = {
            'stages.$.status': Constants.STAGE_STATUSES.COMPLETED,
            'stages.$.timeCompleted': now
        };

        await this.processInstanceRepositoryImpl.updateMany(condition, setValues);



        this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[timer.key]].status = timer.status = Constants.STAGE_STATUSES.COMPLETED;
        this.instances[processInstanceId].stages[this.instances[processInstanceId]._stageIndexJSON[timer.key]].timeCompleted = now;
        this.iterateNextStages(processInstanceId, timer.nextStages, timer.key);


    }
}
