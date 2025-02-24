import { ConsoleLogger, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { CustomMessages } from "src/common/const/custom-messages";

@Injectable()
export class DataflowConversionService {
  private readonly logger: Logger = new Logger(DataflowConversionService.name);
  constructor () {
  }
  /**
   * Aisha: Take data-flow JSON as input and sends workflow JSON as output
   * @param createDataflowConversionDto 
   * @returns workflowJSON
   */
  create(createDataflowConversionDto) {
    try {
      let nodesArray = createDataflowConversionDto.nodes;

      // Workflow JSON - add available values
      const workflowJSON = {
        name: createDataflowConversionDto.name,
        key: createDataflowConversionDto._id,
        criteria: createDataflowConversionDto.criteria ? createDataflowConversionDto.criteria : {},
        assigneeConnector: createDataflowConversionDto.assigneeConnector ? createDataflowConversionDto.assigneeConnector : {},
        formId: createDataflowConversionDto.formId,
      };
      if (createDataflowConversionDto.parameters) {
        try {
          workflowJSON['parameters'] = JSON.parse(createDataflowConversionDto.parameters);
        } catch (e) {
          this.logger.error(' workflowJSON.parameters', e);
        }
      }

      const keyStageMapping = {};
      const stagesArray = [];
      nodesArray.forEach((node) => {
        //const stage = node?.properties.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});
        const stage = node?.properties.reduce((obj, item) => {
          if (item.key !== 'properties') {
            obj[item.key] = item.value;
          }
          return obj;
        }, {});

        if (stage.tags) {
          try {
            stage.tags = JSON.parse(stage.tags);
          } catch (e) {
            stage.tags = [];
            this.logger.error('[stage.tags]', e);
          }
        }

        keyStageMapping[node.node_id] = stage; // temporary mapping
      });
      nodesArray.forEach((node) => {
        const stage = keyStageMapping[node.node_id];

        const stagesObject = {
          key: stage.key,
          name: stage.name,
          displayName: stage.displayName,
          description: stage.description,
          type: node.type,
          subType: stage.subType,
          nextStages: [],
          nodeId: node.node_id,
          ...(stage.mandatory !== undefined && { mandatory: (stage.mandatory?.toLowerCase() === 'true') }),
          ...(stage.auto !== undefined && { auto: (stage.auto?.toLowerCase() === 'true') }),
          ...(stage.assignee && { assignee: stage.assignee }),
          ...(stage.processDefinitionKey && { processDefinitionKey: stage.processDefinitionKey }),
          ...(stage.processDefinitionId && { processDefinitionId: stage.processDefinitionId }),
          // ...( stage.connectorConfiguration && { connectorId: {} } ),
          ...(stage.connectorConfiguration && { connector: {} }),
          ...(stage.estimatedTimeDuration && { estimatedTimeDuration: stage.estimatedTimeDuration }),
          ...(stage.formId && { formId: stage.formId }),
          ...(stage.customParams && { customParams: {} }),
          ...(stage.criteria && { criteria: {} }),
          ...(stage.isIterative !== undefined && { isIterative: (stage.isIterative?.toLowerCase() === 'true') }),
        };

        // if (stage.properties) {
        //   try {
        //     if (stage.subType === 'start') {
        //       workflowJSON.properties = JSON.parse(stage.properties);
        //     } else {
        //       stagesObject['properties'] = JSON.parse(stage.properties);
        //     }
        //   } catch (e) {
        //     // stagesObject.properties = [];
        //     this.logger.error('[stage.properties]', e);
        //   }
        // }

        if (stage.connectorConfiguration) {
          try {
            stagesObject.connector['config'] = JSON.parse(stage.connectorConfiguration);
            stagesObject.connector['type'] = stage.connectorType;
          } catch (e) {
            // stagesObject.connector = null;
            this.logger.error('[stage.connectorConfiguration]', e);
          }
        }

        if (stage.parameters) {
          try {
            stagesObject['parameters'] = JSON.parse(stage.parameters);
          } catch (e) {
            this.logger.error(' stagesObject.parameters', e);
          }
        }

        if (stage.criteria) {
          try {
            stagesObject.criteria = JSON.parse(stage.criteria);

          } catch (e) {
            // stagesObject.connector = null;
            this.logger.error('[stage.connectorConfiguration]', e);
          }
        }
        if (stage.customParams) {
          try {
            stagesObject['customParams'] = JSON.parse(stage.customParams);
          } catch (e) {
            // stagesObject.connector = null;
            this.logger.error('[stage.customParams]', e);
          }
        }
        if (node.type === 'gateway' && stage.config) {
          let conditions = [];
          try {
            conditions = JSON.parse(stage.config);
          } catch (e) {

            this.logger.error('[stage.config]', e);
          }

          stagesObject['conditions'] = conditions.map(obj => {
            obj.onTrueNextStage = keyStageMapping[obj?.onTrueNextStage]?.key;
            delete obj.key;
            return obj;
          });
        }
        stagesArray.push(stagesObject);

        // stagesObject = {}
      });

      nodesArray.forEach(node => {

        keyStageMapping[node.node_id].tags.forEach(nodeId => {
          const ind = stagesArray.findIndex(obj => obj.nodeId === nodeId);
          stagesArray[ind]?.nextStages.push(keyStageMapping[node.node_id].key);
        });

      });

      stagesArray.forEach(obj => {
        delete obj.nodeId;
      });
      workflowJSON['stages'] = stagesArray;
      return new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_CREATED, workflowJSON);
    } catch (err) {
      this.logger.error(err);
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.FAILURE, err);
    }
  }

}
