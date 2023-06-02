import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserTasks, UserTasksDocument } from '../user-tasks.schema';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { CreateUserTaskDto, UpdateUserTaskDto } from 'src/modules/tasks/dtos';
import { UserTasksRepository } from './user-tasks.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserTasksRepositoryImpl extends BaseRepositoryImpl<UserTasksDocument> implements UserTasksRepository {
  constructor (@InjectModel(UserTasks.name) protected UserTaskModel: Model<UserTasksDocument>) {
    super(UserTaskModel);
  }

  create(object: CreateUserTaskDto): Promise<UserTasksDocument> {
    const event = new this.UserTaskModel(object);
    return event.save();
  }

  update(id: string, object: UpdateUserTaskDto): Promise<UserTasksDocument> {
    return this.UserTaskModel.findOneAndUpdate({ _id: id }, object, { new: true }).exec();
  }

  insertMany(array: CreateUserTaskDto[]): Promise<any> {
    return this.UserTaskModel.insertMany(array);
  }

  updateOne(condition: any, object: any): Promise<UserTasksDocument> {
    return this.UserTaskModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }
}