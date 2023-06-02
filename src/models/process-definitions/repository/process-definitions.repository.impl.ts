import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProcessDefinition, ProcessDefinitionDocument } from 'src/models/process-definitions/process-definitions.schema';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { CreateProcessDefinitionDto, UpdateProcessDefinitionDto } from 'src/modules/process-definitions/dtos';
import { ProcessDefinitionRepository } from './process-definitions.repository';
import { UpdateStageBody } from 'src/modules/process-definitions/dtos/update-stage.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProcessDefinitionRepositoryImpl extends BaseRepositoryImpl<ProcessDefinitionDocument> implements ProcessDefinitionRepository {
  constructor (@InjectModel(ProcessDefinition.name) protected ProcessDefinitionModel: Model<ProcessDefinitionDocument>) {
    super(ProcessDefinitionModel);
  }

  create(object: CreateProcessDefinitionDto): Promise<ProcessDefinitionDocument> {
    const event = new this.ProcessDefinitionModel(object);
    return event.save();
  }

  update(condition: any, object: UpdateProcessDefinitionDto): Promise<ProcessDefinitionDocument> {

    return this.ProcessDefinitionModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

  updateStage(condition: any, object: any): Promise<ProcessDefinitionDocument> {

    return this.ProcessDefinitionModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

}