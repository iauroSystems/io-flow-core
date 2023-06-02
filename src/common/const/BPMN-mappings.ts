export class Mappings {
    static StageMappings = {
        'bpmn:startEvent': {
            key: '',
            name: '',
            description: '',
            type: 'event',
            subType: 'start',
            nextStages: []
        },
        'bpmn:endEvent': {
            key: '',
            name: '',
            description: '',
            type: 'event',
            subType: 'end',
            nextStages: []
        },
        'bpmn:intermediateCatchEvent': {
            key: '',
            name: 'Timer',
            description: 'timer',
            type: 'event',
            subType: 'timer',
            estimatedTimeDuration: 0,
            nextStages: []
        },
        'bpmn:exclusiveGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'exclusive',
            nextStages: []
        },
        'bpmn:parallelGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'parallel',
            nextStages: []
        },
        'bpmn:eventBasedGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'timer',
            nextStages: []
        },
        'bpmn:task': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:sendTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'send-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:receiveTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'receive-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:userTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            mandatory: true,
            subType: 'user-task',
            nextStages: [],
            properties: [],
            assignee: ''

        },
        'bpmn:manualTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'manual-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:businessRuleTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'business-rule-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:serviceTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'service-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:scriptTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'script-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn:callActivity': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'call-activity',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null,
            processDefinitionKey: ''
        },
        'bpmn:subProcess': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'sub-process',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },



    }
}