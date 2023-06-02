import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProcessInstance, ProcessInstanceDocument } from 'src/models/process-instances/process-instances.schema';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto } from 'src/modules/process-instances/dtos';
import { ProcessInstanceRepository } from './process-instances.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProcessInstanceRepositoryImpl extends BaseRepositoryImpl<ProcessInstanceDocument> implements ProcessInstanceRepository {
  constructor (@InjectModel(ProcessInstance.name) protected ProcessInstanceModel: Model<ProcessInstanceDocument>) {
    super(ProcessInstanceModel);
  }

  create(object: CreateProcessInstanceDto): Promise<ProcessInstanceDocument> {
    const event = new this.ProcessInstanceModel(object);
    return event.save();
  }

  updateById(id: string, object: UpdateProcessInstanceDto): Promise<ProcessInstanceDocument> {
    return this.ProcessInstanceModel.findOneAndUpdate({ _id: id }, object, { new: true }).exec();
  }

  updateOne(condition: any, object: any): Promise<ProcessInstanceDocument> {
    return this.ProcessInstanceModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

  updateMany(condition: any, object: any): Promise<any> {
    return this.ProcessInstanceModel.updateMany(condition, object).exec();
  }

}