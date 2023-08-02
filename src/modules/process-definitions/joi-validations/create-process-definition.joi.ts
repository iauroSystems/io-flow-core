const Joi = require('joi');

const connectorOpenAISchema = Joi.object({
    type: Joi.string().required().valid('openai'),
    config: Joi.object({
        prompt: Joi.string().required(),
        apiKey: Joi.string().required(),
        data: Joi.object().optional(),
    }).required()
});

const connectorKafkaSchema = Joi.object({
    type: Joi.string().required().valid('kafka'),
    config: Joi.object({
        operation: Joi.string().required(),
        clientId: Joi.string().required(),
        broker: Joi.string().required(),
        topic: Joi.string().required(),
        message: Joi.string().optional(),
        data: Joi.object().optional(),
    }).required()
});

const connectorRestSchema = Joi.object({
    type: Joi.string().required().valid('rest'),
    config:Joi.object({
        url: Joi.string().required(),
        timeout: Joi.number().default(5000),
        method: Joi.string().required(),
        headers: Joi.object().optional(),
        params: Joi.object().optional(),
        query: Joi.object().optional(),
        data: Joi.object().optional(),
}).required()
})

const connectorGrpcSchema = Joi.object({
    type: Joi.string().required().valid('grpc'),
    config: Joi.object({
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
}).required()
});


const expressionSchema = Joi.object({
    lhs: Joi.string().required(),
    op: Joi.string().valid('==', '!=', '>', '<', '>=', '<=', '===').required(),
    rhs: Joi.any().required(),
});

const conditionSchema = Joi.object({
    name: Joi.string().required(),
    op: Joi.string().valid('and', 'or').insensitive().required(),
    expressions: Joi.array().items(expressionSchema).required(),
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



    "user-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        mandatory: Joi.boolean().required(),
        subType: Joi.string().valid('user-task').required(),
        nextStages: Joi.array().items(Joi.string()).required(),
        estimatedTimeDuration: Joi.number().integer(),
        properties: Joi.array().items(
            Joi.object({
                key: Joi.string().required(),
                value: Joi.object({
                    type: Joi.string().required(),
                    default: Joi.any().required(),
                    required: Joi.boolean().required(),
                    enum: Joi.array().items(Joi.any()).optional(),
                }).required(),
            }).optional()
        ),
        assignee: Joi.string().allow('').optional(),
        criteria: criteriaSchema.allow(null).optional(),
        connector:Joi.alternatives().try(
                connectorRestSchema,
                connectorGrpcSchema,
                connectorKafkaSchema,
                connectorOpenAISchema,
        ).allow(null).optional(),

        formId: Joi.string().optional(),
        customParams: Joi.object().optional()
    }),

    "system-task": Joi.object({
        key: Joi.string().required(),
        name: Joi.string().required(),
        displayName: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('activity').required(),
        subType: Joi.string().valid('system-task').required(),
        auto: Joi.boolean().default(true),
        mandatory: Joi.boolean().required().default(true),
        nextStages: Joi.array().items(Joi.string()).required(),
        properties: Joi.array().items(
            Joi.object({
                key: Joi.string().required(),
                value: Joi.object({
                    type: Joi.string().required(),
                    default: Joi.any().required(),
                    required: Joi.boolean().required(),
                    enum: Joi.array().items(Joi.any()).optional(),
                }).required(),
            }).optional()
        ),
        criteria: criteriaSchema.allow(null).optional(),
        connector: Joi.alternatives().try(
                connectorRestSchema,
                connectorGrpcSchema,
                connectorKafkaSchema,
                connectorOpenAISchema,
        ).allow(null).optional(),
        customParams: Joi.object().optional()
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
        properties: Joi.array().items(
            Joi.object({
                key: Joi.string().required(),
                value: Joi.object({
                    type: Joi.string().required(),
                    default: Joi.any().required(),
                    required: Joi.boolean().required(),
                    enum: Joi.array().items(Joi.any()).optional(),
                }).required(),
            }).optional()
        ),
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
    })

};


