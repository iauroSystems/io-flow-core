const Joi = require('joi');

const connectorSoapSchema = Joi.object({
    url: Joi.string().optional(),
    method: Joi.string().required(),
    data: Joi.any().optional(),
    headers: Joi.object().optional(),
    timeout: Joi.number().default(0),
    variables: Joi.object()
}).required();

const connectorKafkaSchema = Joi.object({
    operation: Joi.string().required(),
    clientId: Joi.string().required(),
    broker: Joi.string().required(),
    topic: Joi.string().required(),
    message: Joi.string().optional(),
    data: Joi.object().optional(),
    variables: Joi.object().optional
}).required();

const connectorRestSchema = Joi.object({
    url: Joi.string().required(),
    timeout: Joi.number().default(5000),
    method: Joi.string().required(),
    headers: Joi.object().optional(),
    params: Joi.object().optional(),
    query: Joi.object().optional(),
    data: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
    variables: Joi.object().optional(),
}).required();

const connectorGraphqlSchema = Joi.object({
    url: Joi.string().required(),
    timeout: Joi.number().default(5000),
    headers: Joi.object().optional(),
    data: Joi.object({
        query: Joi.string().required()
    }).required(),
    variables: Joi.object().optional
}).required();

const connectorGrpcSchema = Joi.object({
    serviceOptions: Joi.object({
        protoPath: Joi.string().required(),
        serviceName: Joi.string().required(),
        packageName: Joi.string().required(),
        url: Joi.string().required(),
    }).required(),
    methodOptions: Joi.object({
        methodName: Joi.string().required(),
        message: Joi.object().optional(),
        metadata: Joi.object().optional(),
    }).required(),
    variables: Joi.object().optional
}).required();

const connectorJavascriptSchema = Joi.object({
    url: Joi.string().required(),
    timeout: Joi.number().default(5000),
    method: Joi.string().required(),
    headers: Joi.object().optional(),
    params: Joi.object().optional(),
    query: Joi.object().optional(),
    data: Joi.object({
        script: Joi.string(),
        url: Joi.string(),
        parameters: Joi.object({}).optional()
    }).xor('script', 'url'),
    variables: Joi.object().optional
}).required();

const connectorPythonSchema = Joi.object({
    url: Joi.string().required(),
    timeout: Joi.number().default(5000),
    method: Joi.string().required(),
    headers: Joi.object().optional(),
    params: Joi.object().optional(),
    query: Joi.object().optional(),
    data: Joi.object({
        script: Joi.string(),
        url: Joi.string(),
        parameters: Joi.object({}).optional()
    }).xor('script', 'url'),
    variables: Joi.object().optional
}).required();

const connectorMysqlSchema = Joi.object({
    hostname: Joi.string().required(),
    port: Joi.number().default(3306).required(),
    user: Joi.string().optional(),
    password: Joi.string().optional().allow(null, ''),
    encryptedPassword: Joi.string().optional().allow(null, ''),
    databaseName: Joi.string().required(),
    query: Joi.string().optional().allow(null, ''),
    encryptedQuery: Joi.string().optional().allow(null, ''),
}).required();

const connectorPostgresSchema = Joi.object({
    hostname: Joi.string().required(),
    port: Joi.number().default(5432).required(),
    user: Joi.string().optional(),
    password: Joi.string().optional().allow(null, ''),
    encryptedPassword: Joi.string().optional().allow(null, ''),
    databaseName: Joi.string().required(),
    query: Joi.string().optional().allow(null, ''),
    encryptedQuery: Joi.string().optional().allow(null, ''),
}).required();

const conditionSchema = Joi.object({
    name: Joi.string().required(),
    variables: Joi.object().required(),
    expression: Joi.string().required(),
    onTrueNextStage: Joi.string().optional(),
    onFalseNextStage: Joi.string().optional(),
});

const criteriaSchema = Joi.object({
    allCompleted: Joi.boolean().optional(),
    anyCompleted: Joi.boolean().optional(),
    allActivitiesCompleted: Joi.boolean().optional(),
    anyActivitiesCompleted: Joi.boolean().optional(),
    allSuccess: Joi.boolean().optional(),
    anySuccess: Joi.boolean().optional(),
    onErrorComplete: Joi.boolean().optional(),
    showError: Joi.boolean().optional(),
    retry: Joi.boolean().optional(),
    retries: Joi.number().optional(),
    retryIntervalMs: Joi.number().optional(),
});

export const StagesSchema = {

    "start": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('event').required(),
        subType: Joi.string().valid('start').required(),
        nextStages: Joi.array().items(Joi.string()).length(1).required()
    }),

    "end": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('event').required(),
        subType: Joi.string().valid('end').required()
    }),

    "timer": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('event').required(),
        subType: Joi.string().valid('timer').required(),
        estimatedTimeDuration: Joi.number().integer().required(),
        nextStages: Joi.array().items(Joi.string()).required(),
    }),

    "user-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        mandatory: Joi.boolean().required(),
        isIterative: Joi.boolean().default(false),
        subType: Joi.string().valid('user-task').required(),
        nextStages: Joi.array().items(Joi.string()).required(),
        estimatedTimeDuration: Joi.number().integer(),
        assignee: Joi.string().allow('').optional(),
        criteria: criteriaSchema.allow(null).optional(),
        connector: Joi.object({
            type: Joi.string().required().valid('soap', 'rest', 'kafka', 'grpc', 'javascript', 'python', 'graphql', 'mysql', 'postgresql'),
            connectorId: Joi.string().optional(),
            config: Joi.alternatives().try(
                connectorRestSchema,
                connectorGrpcSchema,
                connectorKafkaSchema,
                connectorSoapSchema,
                connectorJavascriptSchema,
                connectorPythonSchema,
                connectorGraphqlSchema,
                connectorMysqlSchema,
                connectorPostgresSchema
            ).required(),
        }).allow(null).optional(),
        formId: Joi.string().optional(),
        customParams: Joi.object().optional(),
        parameters: Joi.object().optional()
    }),

    "system-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        subType: Joi.string().valid('system-task').required(),
        auto: Joi.boolean().default(true),
        mandatory: Joi.boolean().default(true),
        isIterative: Joi.boolean().default(false),
        nextStages: Joi.array().items(Joi.string()).required(),
        criteria: criteriaSchema.allow(null).optional(),
        connector: Joi.object({
            type: Joi.string().required().valid('soap', 'rest', 'kafka', 'grpc', 'javascript', 'python', 'mysql', 'postgresql'),
            connectorId: Joi.string().optional(),
            config: Joi.alternatives().try(
                connectorRestSchema,
                connectorGrpcSchema,
                connectorKafkaSchema,
                connectorSoapSchema,
                connectorJavascriptSchema,
                connectorPythonSchema,
                connectorMysqlSchema,
                connectorPostgresSchema
            ).required(),
        }).allow(null).optional(),
        customParams: Joi.object().optional(),
        parameters: Joi.object().optional()
    }),
    "script-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        subType: Joi.string().valid('script-task').required(),
        auto: Joi.boolean().default(true),
        mandatory: Joi.boolean().required().default(true),
        isIterative: Joi.boolean().default(false),
        nextStages: Joi.array().items(Joi.string()).required(),
        criteria: criteriaSchema.allow(null).optional(),
        connector: Joi.object({
            type: Joi.string().required().valid('soap', 'rest', 'kafka', 'grpc', 'javascript', 'python', 'openai'),
            connectorId: Joi.string().optional(),
            config: Joi.alternatives().try(
                connectorRestSchema,
                connectorGrpcSchema,
                connectorKafkaSchema,
                connectorSoapSchema,
                connectorJavascriptSchema,
                connectorPythonSchema
            ).required(),
        }).allow(null).optional(),
        customParams: Joi.object().optional(),
        parameters: Joi.object().optional()
    }),

    "compound-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        subType: Joi.string().valid('compound-task').required(),
        mandatory: Joi.boolean().required().default(true),
        nextStages: Joi.array().items(Joi.string()).required(),
        criteria: criteriaSchema.allow(null).optional(),
        processDefinitionKey: Joi.string().allow(null, ''),   //either of the processDefinitionKey , processDefinitionId is required
        processDefinitionId: Joi.string().length(24).allow(null, '')
    }).xor('processDefinitionKey', 'processDefinitionId'),

    "exclusive": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('gateway').required(),
        subType: Joi.string().valid('exclusive').required(),
        nextStages: Joi.array().items(Joi.string()).max(1).required(),
        conditions: Joi.array().items(conditionSchema).required(),
    }),
    "inclusive": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('gateway').required(),
        subType: Joi.string().valid('inclusive').required(),
        nextStages: Joi.array().items(Joi.string()).max(1).required(),
        conditions: Joi.array().items(conditionSchema).required(),
    }),

    "dependency": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('gateway').required(),
        subType: Joi.string().valid('dependency').required(),
        nextStages: Joi.array().items(Joi.string()).max(1).required(),
        conditions: Joi.array().items(conditionSchema).required(),
    })

};


