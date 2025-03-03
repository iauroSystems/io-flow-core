export class Mappings {
    static StageMappings = {
        'bpmn2:startEvent': {
            key: '',
            name: '',
            description: '',
            type: 'event',
            subType: 'start',
            nextStages: []
        },
        'bpmn2:endEvent': {
            key: '',
            name: '',
            description: '',
            type: 'event',
            subType: 'end',
            nextStages: []
        },
        'bpmn2:intermediateCatchEvent': {
            key: '',
            name: 'Timer',
            description: 'timer',
            type: 'event',
            subType: 'timer',
            estimatedTimeDuration: 0,
            nextStages: []
        },
        'bpmn2:exclusiveGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'exclusive',
            nextStages: []
        },
        'bpmn2:parallelGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'parallel',
            nextStages: []
        },
        'bpmn2:eventBasedGateway': {
            key: '',
            name: '',
            description: '',
            type: 'gateway',
            subType: 'timer',
            nextStages: []
        },
        'bpmn2:task': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:sendTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:receiveTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:userTask': {
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
        'bpmn2:manualTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'user-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:businessRuleTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:serviceTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:scriptTask': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },
        'bpmn2:callActivity': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'compound-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null,
            processDefinitionKey: ''
        },
        'bpmn2:subProcess': {
            key: '',
            name: '',
            description: '',
            type: 'activity',
            subType: 'system-task',
            auto: true,
            mandatory: true,
            nextStages: [],
            criteria: null,
            connector: null
        },



    }

    static NodeMappings = {
        'bpmn2:startEvent': {
            "connector_id": "event",
            "input_data_frames": [
            ],
            "is_gessa_store": false,
            "name": "start",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "start"
                },
                {
                    "key": "key",
                    "value": "event_junxypqZ"
                },
                {
                    "key": "description",
                    "value": "start"
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "start"
                },
                {
                    "key": "displayName",
                    "value": "start"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "event",
            "node_id": "66daf8b51d09a1f7ce2c238f",
            "data_frame_name": "",
            "description": "start"
        },
        'bpmn2:endEvent': {
            "connector_id": "event",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "end",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "start"
                },
                {
                    "key": "key",
                    "value": "event_junxypqZ"
                },
                {
                    "key": "description",
                    "value": "end"
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "end"
                },
                {
                    "key": "displayName",
                    "value": "end"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "event",
            "node_id": "66daf8b51d09a1f7ce2c238f",
            "data_frame_name": "",
            "description": "end"
        },
        'bpmn2:intermediateCatchEvent': {
            "connector_id": "event",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "timer",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "timer"
                },
                {
                    "key": "key",
                    "value": "event_junxypqZ"
                },
                {
                    "key": "description",
                    "value": "timer"
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "timer"
                },
                {
                    "key": "displayName",
                    "value": "timer"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "event",
            "node_id": "66daf8b51d09a1f7ce2c238f",
            "data_frame_name": "",
            "description": "timer"
        },
        'bpmn2:exclusiveGateway': {
            "connector_id": "gateway",
            "input_data_frames": [
                "[\"66daf8b71d09a1f7ce2c244f\",\"66daf8b81d09a1f7ce2c250f\"]"
            ],
            "is_gessa_store": false,
            "name": "c",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "c"
                },
                {
                    "key": "key",
                    "value": "gateway_ilMOgEOh"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "exclusive"
                },
                {
                    "key": "displayName",
                    "value": "c"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "gateway",
            "node_id": "66daf8c11d09a1f7ce2c2d43",
            "data_frame_name": ""
        },
        'bpmn2:parallelGateway': {
            "connector_id": "gateway",
            "input_data_frames": [
                "[\"66daf8b71d09a1f7ce2c244f\",\"66daf8b81d09a1f7ce2c250f\"]"
            ],
            "is_gessa_store": false,
            "name": "c",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "c"
                },
                {
                    "key": "key",
                    "value": "gateway_ilMOgEOh"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "exclusive"
                },
                {
                    "key": "displayName",
                    "value": "c"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "gateway",
            "node_id": "66daf8c11d09a1f7ce2c2d43",
            "data_frame_name": ""
        },
        'bpmn2:eventBasedGateway': {
            "connector_id": "gateway",
            "input_data_frames": [
                "[\"66daf8b71d09a1f7ce2c244f\",\"66daf8b81d09a1f7ce2c250f\"]"
            ],
            "is_gessa_store": false,
            "name": "c",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "c"
                },
                {
                    "key": "key",
                    "value": "gateway_ilMOgEOh"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "exclusive"
                },
                {
                    "key": "displayName",
                    "value": "c"
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "gateway",
            "node_id": "66daf8c11d09a1f7ce2c2d43",
            "data_frame_name": ""
        },
        'bpmn2:task': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:sendTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:receiveTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:userTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "user-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:manualTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "user-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:businessRuleTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:serviceTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:scriptTask': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:callActivity': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "compound-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },
        'bpmn2:subProcess': {
            "connector_id": "activity",
            "input_data_frames": [
                null
            ],
            "is_gessa_store": false,
            "name": "b",
            "properties": [
                {
                    "key": "tags",
                    "value": "[]"
                },
                {
                    "key": "name",
                    "value": "b"
                },
                {
                    "key": "key",
                    "value": "activity_K2YOtxEp"
                },
                {
                    "key": "description",
                    "value": ""
                },
                {
                    "key": "assignee",
                    "value": ""
                },
                {
                    "key": "subType",
                    "value": "system-task"
                },
                {
                    "key": "displayName",
                    "value": "b"
                },
                {
                    "key": "auto",
                    "value": "true"
                },
                {
                    "key": "mandatory",
                    "value": "false"
                },
                {
                    "key": "isIterative",
                    "value": ""
                },
                {
                    "key": "apiResponse",
                    "value": ""
                },
                {
                    "key": "connectorId",
                    "value": ""
                },
                {
                    "key": "connectorType",
                    "value": ""
                },
                {
                    "key": "properties",
                    "value": "[]"
                },
                {
                    "key": "config",
                    "value": ""
                },
                {
                    "key": "connectorConfiguration",
                    "value": "{\n    \"variables\": {}\n}"
                }
            ],
            "queries": [],
            "tags": [],
            "type": "activity",
            "node_id": "66daf8b81d09a1f7ce2c250f",
            "data_frame_name": ""
        },



    }

    static DiagramMapping = {
        start: {
            "id": "",
            "connector_id": "event",
            "position": {
                "x": 552,
                "y": 30
            },
            "type": "event",
            "properties": [],
            "subType": "start",
            "label": "start",
            "properType": {
                "type": "event",
                "subType": "start",
                "label": "start"
            },
            "data": {
                "component": "Be",
                "props": {
                    "leftAccent": "",
                    "showBorder": false,
                    "tag": false,
                    "text": "start",
                    "displayName": "start",
                    "subType": "start",
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4NDBfNzE3MzQpIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiIHN0cm9rZT0iIzE1QTdENiIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4NDBfNzE3MzQiPgo8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "user-task"
                    }
                }
            }
        },
        'system-task': {
            "id": "",
            "connector_id": "activity",
            "position": {
                "x": 307,
                "y": 163
            },
            "type": "activity",
            "properties": [],
            "subType": "system-task",
            "label": "system-task",
            "properType": {
                "type": "activity",
                "subType": "system-task",
                "label": "system-task"
            },
            "data": {
                "component": "Be",
                "props": {
                    "leftAccent": "",
                    "showBorder": false,
                    "tag": false,
                    "text": "a",
                    "displayName": "a",
                    "subType": "system-task",
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4NDBfNzE3NDMpIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNBQTEzOTIiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxXzE4NDBfNzE3NDMpIj4KPHBhdGggZD0iTTE2Ljc2MDcgMTIuNjI2OUMxNi43ODc0IDEyLjQyNjkgMTYuODAwNyAxMi4yMjAyIDE2LjgwMDcgMTIuMDAwMkMxNi44MDA3IDExLjc4NjkgMTYuNzg3NCAxMS41NzM2IDE2Ljc1NDEgMTEuMzczNkwxOC4xMDc0IDEwLjMyMDJDMTguMjI3NCAxMC4yMjY5IDE4LjI2MDcgMTAuMDQ2OSAxOC4xODc0IDkuOTEzNTVMMTYuOTA3NCA3LjcwMDIyQzE2LjgyNzQgNy41NTM1NSAxNi42NjA3IDcuNTA2ODkgMTYuNTE0MSA3LjU1MzU1TDE0LjkyMDcgOC4xOTM1NUMxNC41ODc0IDcuOTQwMjIgMTQuMjM0MSA3LjcyNjg5IDEzLjg0MDcgNy41NjY4OUwxMy42MDA3IDUuODczNTVDMTMuNTc0MSA1LjcxMzU1IDEzLjQ0MDcgNS42MDAyMiAxMy4yODA3IDUuNjAwMjJIMTAuNzIwN0MxMC41NjA3IDUuNjAwMjIgMTAuNDM0MSA1LjcxMzU1IDEwLjQwNzQgNS44NzM1NUwxMC4xNjc0IDcuNTY2ODlDOS43NzQwNiA3LjcyNjg5IDkuNDE0MDYgNy45NDY4OSA5LjA4NzM5IDguMTkzNTVMNy40OTQwNiA3LjU1MzU1QzcuMzQ3MzkgNy41MDAyMiA3LjE4MDcyIDcuNTUzNTUgNy4xMDA3MiA3LjcwMDIyTDUuODI3MzkgOS45MTM1NUM1Ljc0NzM5IDEwLjA1MzYgNS43NzQwNiAxMC4yMjY5IDUuOTA3MzkgMTAuMzIwMkw3LjI2MDcyIDExLjM3MzZDNy4yMjczOSAxMS41NzM2IDcuMjAwNzIgMTEuNzkzNiA3LjIwMDcyIDEyLjAwMDJDNy4yMDA3MiAxMi4yMDY5IDcuMjE0MDYgMTIuNDI2OSA3LjI0NzM5IDEyLjYyNjlMNS44OTQwNiAxMy42ODAyQzUuNzc0MDYgMTMuNzczNiA1Ljc0MDcyIDEzLjk1MzYgNS44MTQwNiAxNC4wODY5TDcuMDk0MDYgMTYuMzAwMkM3LjE3NDA2IDE2LjQ0NjkgNy4zNDA3MiAxNi40OTM2IDcuNDg3MzkgMTYuNDQ2OUw5LjA4MDcyIDE1LjgwNjlDOS40MTQwNiAxNi4wNjAyIDkuNzY3MzkgMTYuMjczNiAxMC4xNjA3IDE2LjQzMzZMMTAuNDAwNyAxOC4xMjY5QzEwLjQzNDEgMTguMjg2OSAxMC41NjA3IDE4LjQwMDIgMTAuNzIwNyAxOC40MDAySDEzLjI4MDdDMTMuNDQwNyAxOC40MDAyIDEzLjU3NDEgMTguMjg2OSAxMy41OTQxIDE4LjEyNjlMMTMuODM0MSAxNi40MzM2QzE0LjIyNzQgMTYuMjczNiAxNC41ODc0IDE2LjA2MDIgMTQuOTE0MSAxNS44MDY5TDE2LjUwNzQgMTYuNDQ2OUMxNi42NTQxIDE2LjUwMDIgMTYuODIwNyAxNi40NDY5IDE2LjkwMDcgMTYuMzAwMkwxOC4xODA3IDE0LjA4NjlDMTguMjYwNyAxMy45NDAyIDE4LjIyNzQgMTMuNzczNiAxOC4xMDA3IDEzLjY4MDJMMTYuNzYwNyAxMi42MjY5Wk0xMi4wMDA3IDE0LjQwMDJDMTAuNjgwNyAxNC40MDAyIDkuNjAwNzIgMTMuMzIwMiA5LjYwMDcyIDEyLjAwMDJDOS42MDA3MiAxMC42ODAyIDEwLjY4MDcgOS42MDAyMiAxMi4wMDA3IDkuNjAwMjJDMTMuMzIwNyA5LjYwMDIyIDE0LjQwMDcgMTAuNjgwMiAxNC40MDA3IDEyLjAwMDJDMTQuNDAwNyAxMy4zMjAyIDEzLjMyMDcgMTQuNDAwMiAxMi4wMDA3IDE0LjQwMDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTg0MF83MTc0MyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMV8xODQwXzcxNzQzIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "system-task"
                    }
                }
            }
        },
        'user-task': {
            "id": "",
            "connector_id": "activity",
            "position": {
                "x": 307,
                "y": 163
            },
            "type": "activity",
            "properties": [],
            "subType": "user-task",
            "label": "user-task",
            "properType": {
                "type": "activity",
                "subType": "user-task",
                "label": "user-task"
            },
            "data": {
                "component": "Be",
                "props": {
                    "leftAccent": "",
                    "showBorder": false,
                    "tag": false,
                    "text": "a",
                    "displayName": "a",
                    "subType": "user-task",
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4NDBfNjE5MjMpIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMwMjUxQzkiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxXzE4NDBfNjE5MjMpIj4KPHBhdGggZD0iTTEyLjAwMDcgNS4zMzMzN0M4LjMyMDY1IDUuMzMzMzcgNS4zMzM5OCA4LjMyMDA0IDUuMzMzOTggMTJDNS4zMzM5OCAxNS42OCA4LjMyMDY1IDE4LjY2NjcgMTIuMDAwNyAxOC42NjY3QzE1LjY4MDcgMTguNjY2NyAxOC42NjczIDE1LjY4IDE4LjY2NzMgMTJDMTguNjY3MyA4LjMyMDA0IDE1LjY4MDcgNS4zMzMzNyAxMi4wMDA3IDUuMzMzMzdaTTEyLjAwMDcgNy4zMzMzN0MxMy4xMDczIDcuMzMzMzcgMTQuMDAwNyA4LjIyNjcxIDE0LjAwMDcgOS4zMzMzN0MxNC4wMDA3IDEwLjQ0IDEzLjEwNzMgMTEuMzMzNCAxMi4wMDA3IDExLjMzMzRDMTAuODk0IDExLjMzMzQgMTAuMDAwNyAxMC40NCAxMC4wMDA3IDkuMzMzMzdDMTAuMDAwNyA4LjIyNjcxIDEwLjg5NCA3LjMzMzM3IDEyLjAwMDcgNy4zMzMzN1pNMTIuMDAwNyAxNi44QzEwLjMzNCAxNi44IDguODYwNjUgMTUuOTQ2NyA4LjAwMDY1IDE0LjY1MzRDOC4wMjA2NSAxMy4zMjY3IDEwLjY2NzMgMTIuNiAxMi4wMDA3IDEyLjZDMTMuMzI3MyAxMi42IDE1Ljk4MDcgMTMuMzI2NyAxNi4wMDA3IDE0LjY1MzRDMTUuMTQwNyAxNS45NDY3IDEzLjY2NzMgMTYuOCAxMi4wMDA3IDE2LjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTg0MF82MTkyMyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMV8xODQwXzYxOTIzIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "user-task"
                    }
                }
            }
        },
        exclusive: {
            "id": "",
            "connector_id": "gateway",
            "position": {
                "x": 164,
                "y": 354
            },
            "type": "gateway",
            "properties": [],
            "subType": "exclusive",
            "label": "exclusive",
            "properType": {
                "type": "gateway",
                "subType": "exclusive",
                "label": "exclusive"
            },
            "data": {
                "component": "Be",
                "props": {
                    "showBorder": false,
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjg3OTUgMTIuMjE3TDEyLjkwNDIgMi4xNTA4OUMxMi43MDU4IDEuOTQ5NTYgMTIuMjk0MiAxLjk0OTU2IDEyLjA5NTcgMi4xNTE3NkwyLjEyMDQ5IDEyLjIxNzlDMS45NTk4NCAxMi4zNzk5IDEuOTU5ODQgMTIuNjEzNiAyLjEyMDQ5IDEyLjc3NTVMMTIuMDk1OCAyMi44NDE2QzEyLjE5NDQgMjIuOTQyMiAxMi4zNDM2IDIzIDEyLjUgMjNDMTIuNjU2NSAyMyAxMi44MDU2IDIyLjk0MjIgMTIuOTA0MiAyMi44NDA3TDIyLjg3OTUgMTIuNzc0NkMyMy4wNDAyIDEyLjYxMjcgMjMuMDQwMiAxMi4zNzkgMjIuODc5NSAxMi4yMTdaTTEyLjUgMjEuODc1M0wzLjIwNTE1IDEyLjQ5NjNMMTIuNSAzLjExNzI0TDIxLjc5NDggMTIuNDk2M0wxMi41IDIxLjg3NTNaIiBmaWxsPSIjMkE5MEIwIiBzdHJva2U9IiMyQTkwQjAiIHN0cm9rZS13aWR0aD0iMC40Ii8+CjxwYXRoIGQ9Ik0xNS4yOTc5IDkuNzI5MzdMOS43MDIyIDE1LjI3MDUiIHN0cm9rZT0iIzJBOTBCMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik05LjcyOTM3IDkuNzAyMTVMMTUuMjcwNSAxNS4yOTc4IiBzdHJva2U9IiMyQTkwQjAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "exclusive"
                    },
                    "text": "",
                    "displayName": "",
                    "leftAccent": ""
                }
            }
        },
        inclusive: {
            "id": "",
            "connector_id": "gateway",
            "position": {
                "x": 249.60647276982948,
                "y": 436.1441781162917
            },
            "type": "gateway",
            "properties": [],
            "subType": "inclusive",
            "label": "inclusive",
            "properType": {
                "type": "gateway",
                "subType": "inclusive",
                "label": "inclusive"
            },
            "data": {
                "component": "Be",
                "props": {
                    "showBorder": false,
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjg3OTUgMTIuMjE3TDEyLjkwNDIgMi4xNTA4OUMxMi43MDU4IDEuOTQ5NTYgMTIuMjk0MiAxLjk0OTU2IDEyLjA5NTcgMi4xNTE3NkwyLjEyMDQ5IDEyLjIxNzlDMS45NTk4NCAxMi4zNzk5IDEuOTU5ODQgMTIuNjEzNiAyLjEyMDQ5IDEyLjc3NTVMMTIuMDk1OCAyMi44NDE2QzEyLjE5NDQgMjIuOTQyMiAxMi4zNDM2IDIzIDEyLjUgMjNDMTIuNjU2NSAyMyAxMi44MDU2IDIyLjk0MjIgMTIuOTA0MiAyMi44NDA3TDIyLjg3OTUgMTIuNzc0NkMyMy4wNDAyIDEyLjYxMjcgMjMuMDQwMiAxMi4zNzkgMjIuODc5NSAxMi4yMTdaTTEyLjUgMjEuODc1M0wzLjIwNTE1IDEyLjQ5NjNMMTIuNSAzLjExNzI0TDIxLjc5NDggMTIuNDk2M0wxMi41IDIxLjg3NTNaIiBmaWxsPSIjQzVDOTAyIiBzdHJva2U9IiNDNUM5MDIiIHN0cm9rZS13aWR0aD0iMC40Ii8+CjxjaXJjbGUgY3g9IjEyLjUiIGN5PSIxMi41IiByPSI0IiBzdHJva2U9IiNDNUM5MDIiLz4KPC9zdmc+Cg==",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "inclusive"
                    },
                    "text": "",
                    "displayName": "",
                    "leftAccent": ""
                }
            }
        },
        parallel: {
            "id": "",
            "connector_id": "gateway",
            "position": {
                "x": 145.8217317830206,
                "y": 465.5541750038482
            },
            "type": "gateway",
            "properties": [],
            "subType": "parallel",
            "label": "parallel",
            "properType": {
                "type": "gateway",
                "subType": "parallel",
                "label": "parallel"
            },
            "data": {
                "component": "Be",
                "props": {
                    "showBorder": false,
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjg3OTUgMTIuMjE3TDEyLjkwNDIgMi4xNTA4OUMxMi43MDU4IDEuOTQ5NTYgMTIuMjk0MiAxLjk0OTU2IDEyLjA5NTcgMi4xNTE3NkwyLjEyMDQ5IDEyLjIxNzlDMS45NTk4NCAxMi4zNzk5IDEuOTU5ODQgMTIuNjEzNiAyLjEyMDQ5IDEyLjc3NTVMMTIuMDk1OCAyMi44NDE2QzEyLjE5NDQgMjIuOTQyMiAxMi4zNDM2IDIzIDEyLjUgMjNDMTIuNjU2NSAyMyAxMi44MDU2IDIyLjk0MjIgMTIuOTA0MiAyMi44NDA3TDIyLjg3OTUgMTIuNzc0NkMyMy4wNDAyIDEyLjYxMjcgMjMuMDQwMiAxMi4zNzkgMjIuODc5NSAxMi4yMTdaTTEyLjUgMjEuODc1M0wzLjIwNTE1IDEyLjQ5NjNMMTIuNSAzLjExNzI0TDIxLjc5NDggMTIuNDk2M0wxMi41IDIxLjg3NTNaIiBmaWxsPSIjRTQ4RTAwIiBzdHJva2U9IiNFNDhFMDAiIHN0cm9rZS13aWR0aD0iMC40Ii8+CjxwYXRoIGQ9Ik0xMi41IDguNTYyNVYxNi40Mzc1IiBzdHJva2U9IiNFNDhFMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNOC41NjI1IDEyLjVIMTYuNDM3NSIgc3Ryb2tlPSIjRTQ4RTAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "parallel"
                    },
                    "text": "",
                    "displayName": "",
                    "leftAccent": ""
                }
            }
        },
        end: {
            "id": "",
            "connector_id": "event",
            "position": {
                "x": 249.3522895728968,
                "y": 492.2373084548472
            },
            "type": "event",
            "properties": [],
            "subType": "end",
            "label": "end",
            "properType": {
                "type": "event",
                "subType": "end",
                "label": "end"
            },
            "data": {
                "component": "Be",
                "props": {
                    "showBorder": false,
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4NDBfNzE3MzgpIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iI0U5MjcyNyIgc3Ryb2tlLXdpZHRoPSIzIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTg0MF83MTczOCI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "end"
                    },
                    "text": "",
                    "displayName": "",
                    "leftAccent": ""
                }
            }
        },
        'compound-task': {
            "id": "",
            "connector_id": "activity",
            "position": {
                "x": 303,
                "y": 304
            },
            "type": "activity",
            "properties": [],
            "subType": "compound-task",
            "label": "compound-task",
            "properType": {
                "type": "activity",
                "subType": "compound-task",
                "label": "compound-task"
            },
            "data": {
                "component": "Be",
                "props": {
                    "leftAccent": "",
                    "showBorder": false,
                    "tag": false,
                    "text": "d",
                    "displayName": "d",
                    "subType": "compound-task",
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4NDBfNjE5MjcpIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkUwQjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02Ljg1ODE5IDExLjIzMDFDNy4xMDMxNyAxMS4zMTkyIDcuMzcyMjcgMTEuMTkyMSA3LjQ2MDY4IDEwLjk0OTFDNy45NDk1OCA5LjYwNTA5IDguOTg1MDEgOC42MDM2IDEwLjIwODMgOC4xMTQ2QzEwLjUxODYgOC43OTQyMiAxMS4yMDQxIDkuMjY3OTQgMTEuOTk4NiA5LjI2Nzk0QzEzLjA4MzQgOS4yNjc5NCAxMy45NjU5IDguMzg1NDEgMTMuOTY1OSA3LjMwMDYzQzEzLjk2NTkgNi4yMTU4NyAxMy4wODM0IDUuMzMzMzEgMTEuOTk4NiA1LjMzMzMxQzEwLjk1NjQgNS4zMzMzMSAxMC4xMDE0IDYuMTQ4MDMgMTAuMDM1OCA3LjE3MzkzQzguNDk0OSA3LjczMTU5IDcuMTgzNyA4Ljk2MDE3IDYuNTc3MTMgMTAuNjI3NkM2LjQ4ODM0IDEwLjg3MTcgNi42MTQyMSAxMS4xNDE0IDYuODU4MTkgMTEuMjMwMVpNMTMuODY5IDE3LjA1MTZDMTIuMTMzMiAxNy43ODEyIDEwLjEyMTQgMTcuNDMgOC43MzA1MyAxNi4xNTA0QzkuOTA1NCAxNC45MDYgOS4wMzA3OCAxMi44MzQgNy4zMDA2OSAxMi44MzRDNi4yMTU5IDEyLjgzNCA1LjMzMzM3IDEzLjcxNjYgNS4zMzMzNyAxNC44MDEzQzUuMzMzMzcgMTYuMTM2MyA2LjY0MzU3IDE3LjA4ODcgNy45MTQ3IDE2LjY3QzkuNTgzNSAxOC4zNDM3IDEyLjA4OTkgMTguODE5MyAxNC4yMzMzIDE3LjkxODRDMTQuNDcyNiAxNy44MTc4IDE0LjU4NTEgMTcuNTQyMiAxNC40ODQ1IDE3LjMwMjhDMTQuMzgzOSAxNy4wNjM1IDE0LjEwODQgMTYuOTUxIDEzLjg2OSAxNy4wNTE2Wk0xNS44NjIyIDguMzE1OThDMTcuMTc5IDkuNTAzOTggMTcuOTEzNyAxMS4yNzUxIDE3Ljc0MyAxMy4xMzQ5QzE4LjI5NzIgMTMuNDgzMiAxOC42NjY2IDE0LjA5OTggMTguNjY2NiAxNC44MDE0QzE4LjY2NjYgMTUuODg2MiAxNy43ODQxIDE2Ljc2ODcgMTYuNjk5MyAxNi43Njg3QzE1LjYxNDUgMTYuNzY4NyAxNC43MzIgMTUuODg2MSAxNC43MzIgMTQuODAxNEMxNC43MzIgMTMuNjc5NSAxNS42Nzg1IDEyLjc2NzggMTYuODIxNSAxMi44MzgyQzE2Ljg5MjUgMTEuMzcxNiAxNi4yOTUxIDkuOTcyODIgMTUuMjMyNCA5LjAxNDA4QzE1LjAzOTcgOC44NDAxNCAxNS4wMjQ0IDguNTQyODkgMTUuMTk4MyA4LjM1MDEyQzE1LjM3MjIgOC4xNTczNSAxNS42Njk1IDguMTQyMSAxNS44NjIyIDguMzE1OThaIiBmaWxsPSIjODQ0RjAwIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTg0MF82MTkyNyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "compound-task"
                    }
                }
            }
        },
        timer: {
            "id": "",
            "connector_id": "event",
            "position": {
                "x": 177,
                "y": 295
            },
            "type": "event",
            "properties": [],
            "subType": "timer",
            "label": "timer",
            "properType": {
                "type": "event",
                "subType": "timer",
                "label": "timer"
            },
            "data": {
                "component": "Be",
                "props": {
                    "showBorder": false,
                    "icon": {
                        "name": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE1NTlfNDY5MTgpIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNFNDhFMDAiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxXzE1NTlfNDY5MTgpIj4KPHBhdGggZD0iTTE3LjY1NjkgNi4zNDMxNkMxNi4xNDU5IDQuODMyMTYgMTQuMTM2OSA0IDEyIDRDOS44NjMxMyA0IDcuODU0MTMgNC44MzIxNiA2LjM0MzEzIDYuMzQzMTZDNC44MzIxMyA3Ljg1NDE2IDQgOS44NjMxMyA0IDEyQzQgMTQuMTM2OSA0LjgzMjEzIDE2LjE0NTkgNi4zNDMxMyAxNy42NTY4QzcuODU0MTMgMTkuMTY3OCA5Ljg2MzEzIDIwIDEyIDIwQzE0LjEzNjkgMjAgMTYuMTQ1OSAxOS4xNjc4IDE3LjY1NjkgMTcuNjU2OEMxOS4xNjc5IDE2LjE0NTggMjAgMTQuMTM2OSAyMCAxMkMyMCA5Ljg2MzEzIDE5LjE2NzkgNy44NTQxMyAxNy42NTY5IDYuMzQzMTZaTTEyIDE4LjQyOThDOC40NTQ1OSAxOC40Mjk4IDUuNTcwMjUgMTUuNTQ1NCA1LjU3MDI1IDEyQzUuNTcwMjUgMTEuOTk0MiA1LjU3MDQ0IDExLjk4ODQgNS41NzA0NyAxMS45ODI3QzUuNTcwNDcgMTEuOTgxMiA1LjU3MDI1IDExLjk3OTggNS41NzAyNSAxMS45NzgzQzUuNTcwMjUgMTEuOTc1OSA1LjU3MDU2IDExLjk3MzUgNS41NzA2MiAxMS45NzExQzUuNTg2MjIgOC40NjgxNiA4LjQxNzA2IDUuNjE4MjUgMTEuOTEyNiA1LjU3MTM4QzExLjkxOTkgNS41NzEwMyAxMS45MjcyIDUuNTcwMjggMTEuOTM0NiA1LjU3MDI4QzExLjkzOSA1LjU3MDI4IDExLjk0MzMgNS41NzA4MSAxMS45NDc4IDUuNTcwOTRDMTEuOTY1MiA1LjU3MDgxIDExLjk4MjYgNS41NzAyOCAxMiA1LjU3MDI4QzE1LjU0NTQgNS41NzAyOCAxOC40Mjk4IDguNDU0NjYgMTguNDI5OCAxMkMxOC40Mjk4IDE1LjU0NTQgMTUuNTQ1NCAxOC40Mjk4IDEyIDE4LjQyOThaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYuODgzOSAxMi4zODUzQzE2LjYyMjUgMTIuMzg1MyAxNi40MTA2IDEyLjE3MzQgMTYuNDEwNiAxMS45MTJDMTYuNDEwNiAxMS42NTA1IDE2LjYyMjUgMTEuNDM4NiAxNi44ODM5IDExLjQzODZIMTcuNDU0NUMxNy4xODY1IDguODExMjIgMTUuMDU1NyA2LjcyNjk0IDEyLjQwNzkgNi41MzEyNVY3LjAyNzk3QzEyLjQwNzkgNy4yODk0MSAxMi4xOTYgNy41MDEzNCAxMS45MzQ1IDcuNTAxMzRDMTEuNjczMSA3LjUwMTM0IDExLjQ2MTEgNy4yODk0MSAxMS40NjExIDcuMDI3OTdWNi41NDI1NkM4Ljg1MjUyIDYuNzk4MTkgNi43NzQ2MSA4Ljg4OTUgNi41Mzk1MiAxMS41MDRINy4wNTA1MkM3LjMxMTk2IDExLjUwNCA3LjUyMzg5IDExLjcxNTkgNy41MjM4OSAxMS45Nzc0QzcuNTIzODkgMTIuMjM4OCA3LjMxMTk2IDEyLjQ1MDggNy4wNTA1MiAxMi40NTA4SDYuNTM1NjRDNi43NTMzIDE1LjEwNzMgOC44NzI4NiAxNy4yMzM0IDExLjUyNjYgMTcuNDYxNFYxNi44NjEzQzExLjUyNjYgMTYuNTk5OSAxMS43Mzg1IDE2LjM4OCAxMiAxNi4zODhDMTIuMjYxNCAxNi4zODggMTIuNDczMyAxNi41OTk5IDEyLjQ3MzMgMTYuODYxM1YxNy40NjE0QzE1LjE0ODggMTcuMjMxNSAxNy4yODEyIDE1LjA3MjMgMTcuNDY5MiAxMi4zODUzSDE2Ljg4MzlWMTIuMzg1M1pNMTMuOTE2MiAxMC43NTIzTDEyLjMzNDcgMTIuMzMzOEMxMi4yNDU5IDEyLjQyMjYgMTIuMTI1NiAxMi40NzI1IDEyIDEyLjQ3MjVDMTEuODc0NSAxMi40NzI1IDExLjc1NCAxMi40MjI2IDExLjY2NTMgMTIuMzMzOEw4LjkxMjM2IDkuNTgwOTFDOC43Mjc0OSA5LjM5NjA2IDguNzI3NDkgOS4wOTYzNCA4LjkxMjM2IDguOTExNDdDOS4wOTcyMSA4LjcyNjU5IDkuMzk2OTMgOC43MjY1OSA5LjU4MTggOC45MTE0N0wxMiAxMS4zMjk3TDEzLjI0NjggMTAuMDgyOEMxMy40MzE3IDkuODk3OTcgMTMuNzMxNCA5Ljg5Nzk3IDEzLjkxNjMgMTAuMDgyOEMxNC4xMDExIDEwLjI2NzcgMTQuMTAxMSAxMC41Njc0IDEzLjkxNjIgMTAuNzUyM1oiIGZpbGw9IndoaXRlIi8+CjwvZz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xNTU5XzQ2OTE4Ij4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8Y2xpcFBhdGggaWQ9ImNsaXAxXzE1NTlfNDY5MTgiPgo8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0IDQpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
                        "size": 30,
                        "color": "#E6E6E6",
                        "label": "timer"
                    },
                    "text": "",
                    "displayName": "",
                    "leftAccent": ""
                }
            }
        },
        edge: {
            "id": "",
            "connector_id": "",
            "target": "66daf8c61d09a1f7ce2c2f41",
            "source": "66daf8c11d09a1f7ce2c2d43",
            "type": "smoothstep",
            "labelBgStyle": {
                "fill": "#0F1013",
                "color": "#0F1013"
            },
            "labelStyle": {
                "fill": "#E6E6E6",
                "fontWeight": 700
            },
            "arrowHeadType": "arrowclosed",
            "style": {
                "strokeWidth": 2.5
            },
            "isExclusiveEdge": true
        },

    }
}