import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateUserTaskDto, UpdateUserTaskDto } from '../../../modules/tasks/dtos';
import { UserTasksDocument } from 'src/models/user-tasks/user-tasks.schema';

@Injectable()
  export interface UserTasksRepository extends BaseRepositry<UserTasksDocument> {
  create(task: CreateUserTaskDto): Promise<UserTaskDocument>;
  insertMany(tasks: CreateUserTaskDto[]): Promise<any>;
  update(id: string, user: UpdateUserTaskDto): Promise<UserTasksDocument>;
}