export enum StageSubTypes {
  START = 'start',
  END = 'end',
  TIMER = 'timer',
  INTERMEDIATE_EVENT = 'intermediate-event',
  TASK = 'task',
  USER_TASK = 'user-task',
  SYSTEM_TASK = 'system-task',
  COMPOUND_TASK = 'compound-task',
  SEND_TASK = 'send-task',
  RECEIVE_TASK = 'receive-task',
  MANUAL_TASK = 'manual-task',
  BUSINESS_RULE_TASK = 'business-rule-task',
  SERVICE_TASK = 'service-task',
  SCRIPT_TASK = 'script-task',
  CALL_ACTIVITY = 'call-activity',
  SUB_PROCESS = 'sub-process',
  EXCLUSIVE = 'exclusive',
  PARALLEL = 'parallel',
  INCLUSIVE = 'inclusive',
  IF_ELSE = 'if-else',
  SWITCH_CASE = 'switch-case',
}

export enum StageTypes {
  EVENT = 'event',
  ACTIVITY = 'activity',
  GATEWAY = 'gateway'
}


export enum ConnectorTypes {
  REST = 'rest',
  GRPC = 'grpc'
}

export enum Webhooks {
  CREATE_INSTANCE = 'instance:create',
  UPDATE_INSTANCE = 'instance:update',
  DELETE_INSTANCE = 'instance:delete',
  CREATE_TASK = 'task:create',
  UPDATE_TASK = 'task:update',
  DELETE_TASK = 'task:delete'
}

export enum InputStatuses {
  COMPLETE = 'complete',
  HOLD = 'hold',
  CANCEL = 'cancel',
  RESUME = 'resume',
  EMPTY = ''
}