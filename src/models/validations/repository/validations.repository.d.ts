import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateUserTaskDto, UpdateUserTaskDto } from '../../../modules/tasks/dtos';
import { UserTasksDocument } from 'src/models/user-tasks/user-tasks.schema';

@Injectable()
export interface ValidationsRepository extends BaseRepositry<ValidationsDocument> {
  create ( validation: CreateValidationsDto ): Promise<ValidationsDocument>;
  insertMany ( validation: CreateValidationsDto[]): Promise<any>;
  update ( id: string, validation: CreateValidationsDto ): Promise<ValidationsDocument>;
}
