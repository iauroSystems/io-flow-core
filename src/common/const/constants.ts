export class Constants {
  static STAGE_TYPES = {
    EVENT: 'event',
    ACTIVITY: 'activity',
    GATEWAY: 'gateway'
  }
  static STAGE_SUB_TYPES = {
    START: 'start',
    END: 'end',
    TIMER: 'timer',
    TASK: 'task',
    USER_TASK: 'user-task',
    SYSTEM_TASK: 'system-task',
    COMPOUND_TASK: 'compound-task',
    SEND_TASK: 'send-task',
    RECEIVE_TASK: 'receive-task',
    MANUAL_TASK: 'manual-task',
    BUSINESS_RULE_TASK: 'business-rule-task',
    SERVICE_TASK: 'service-task',
    SCRIPT_TASK: 'script-task',
    CALL_ACTIVITY: 'call-activity',
    SUB_PROCESS: 'sub-process',
    IF_ELSE: 'if-else',
    SWITCH_CASE: 'switch-case',
    EXCLUSIVE: 'exclusive',
    PARALLEL: 'parallel',
    INCLUSIVE: 'inclusive',
    EVENT_BASED: 'event-based',
    DEPENDENCY: 'dependency'
  }
  static STAGE_STATUSES = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ERROR: 'error',
    STARTED: 'started',
    ON_HOLD: 'on-hold',
    CANCELLED: 'cancelled',
    RUNNING: 'running'
  }
  static DEFAULT_QUERY_LIMIT = 100;
  static DB_PARSER_CONFIG = {
    mysql: {
      database: 'MySQL'
    },
    postgres: {
      database: 'Postgresql'
    }
  }
}

export class Paths {
  // static WORKFLOW_PROTO_DIR = 'src/shared/clients';
  static BPMN_XML = 'src/shared/bpmn';
  static PUBLIC = 'src/shared/public'
  static WORKFLOW_PROTO_DIR = 'dist/src/proto/'
  static WORKFLOW_SOAP_DIR = 'dist/src/shared/public/'
}

export class LogEntities {
  static PROCESS_DEF = 'process-definitions';
  static PROCESS_INST = 'process-instances'
}

export class Operations {
  static CREATE = 'create';
  static UPDATE = 'update';
  static DELETE = 'delete';
}

export class CronJobs {
  static TIMER = 'timer';
}