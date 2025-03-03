import { Injectable, Logger } from '@nestjs/common';

import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { WebhookRepositoryImpl } from "src/models/webhooks/repository/webhooks.repository.impl";
import { Constants } from 'src/common/const/constants';

@Injectable()
export class WebhookConnector {
    private readonly logger: Logger = new Logger();

    constructor (
        private http: HttpConnector,
        private grpc: GrpcConnector,
        private webhookRepositoryImpl: WebhookRepositoryImpl

    ) { }

    async callWebhook(webhook, inputData) {
        try {
            if (inputData.parentProcessInstanceId) {
                return;
            }
            const split = webhook.split(':');
            let payload = {};
            if (split[0] === 'instance') {
                switch (split[1]) {
                    case 'failure':
                        payload = {
                            processDefinitionId: inputData.processDefinitionId,
                            processInstanceId: inputData.processInstanceId,
                            status: inputData.status,
                            failedStage: {
                                _id: inputData.task._id,
                                key: inputData.task.key,
                                name: inputData.task.name,
                                status: inputData.task.status,
                                type: inputData.task.type,
                                subType: inputData.task.subType,
                                connector: inputData.task.connector,
                                error: inputData.task._error
                            }
                        }
                        break;
                    default:
                        let {
                            _id,
                            processDefinitionId,
                            processDefinitionKey,
                            rootProcessInstanceId,
                            name,
                            isParallel,
                            criteria,
                            description,
                            version,
                            timeActivated,
                            estimatedTimeDuration,
                            timeStarted,
                            timeCompleted,
                            status,
                            updatedAt,
                            createdAt,
                            parameters
                        } = inputData;

                        const stages = inputData.stages.map(obj => ({ _id: obj._id, key: obj.key, status: obj.status, nextStages: obj.nextStages, prevStages: obj.prevStages, timeActivated: obj.timeActivated, timeCompleted: obj.timeCompleted }));
                        payload = {
                            _id,
                            processDefinitionId,
                            processDefinitionKey,
                            rootProcessInstanceId,
                            name,
                            version,
                            timeActivated,
                            timeStarted,
                            timeCompleted,
                            status,
                            updatedAt,
                            createdAt,
                            parameters,
                            stages
                        };
                        break;
                }

            }
            if (split[0] === 'task') {
                payload = inputData;
            }

            const hooks = await this.webhookRepositoryImpl.find({ webhook, processDefinitionId: inputData.processDefinitionId });
            hooks.forEach(async hookObj => {
                let [err, data] = [null, null];
                try {
                    let config = JSON.parse(JSON.stringify(hookObj.connector.config));

                    if (hookObj.connector.type === 'grpc') {

                        config.methodOptions['message'] = payload;
                        [err, data] = await this.grpc.call(config);
                    } else {
                        config['data'] = payload;
                        [err, data] = await this.http.call(config);
                    }
                    if (err) {
                        this.logger.error('[Webhook] Response Error => ', config, err);
                        return;
                    }
                    this.logger.debug('[Webhook] Response Success => ', config);
                } catch (err) {
                    this.logger.error('[Webhook] Catch Error: ', err);
                    return;
                }
            });

        } catch (err) {
            this.logger.error('[Webhook] Connector Error: ', err);
        }
    }
}
