import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto } from '../../../modules/process-instances/dtos';
import { ProcessInstanceDocument } from 'src/models/process-instances/process-instances.schema';

@Injectable()
  export interface ProcessInstanceRepository extends BaseRepositry<ProcessInstanceDocument> {
  create(setting: CreateProcessInstanceDto): Promise<ProcessInstanceDocument>;
  updateById(id: string, setValues: UpdateProcessInstanceDto): Promise<ProcessInstanceDocument>;
  updateOne(condition: any, setValues: UpdateProcessInstanceDto): Promise<ProcessInstanceDocument>;
  updateMany(condition: any, setValues: UpdateProcessInstanceDto): Promise<ProcessInstanceDocument>;

}