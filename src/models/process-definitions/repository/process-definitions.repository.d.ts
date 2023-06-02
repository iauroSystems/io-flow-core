import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateProcessDefinitionDto, UpdateProcessDefinitionDto } from '../../../modules/process-definitions/dtos';
import { ProcessDefinitionDocument } from 'src/models/process-definitions/process-definitions.schema';

@Injectable()
export interface ProcessDefinitionRepository extends BaseRepositry<ProcessDefinitionDocument> {
  create(setting: CreateProcessDefinitionDto): Promise<ProcessDefinitionDocument>;
  update(condition: any, user: UpdateProcessDefinitionDto): Promise<ProcessDefinitionDocument>;
}