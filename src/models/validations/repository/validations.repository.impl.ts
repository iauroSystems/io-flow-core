import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Validations, ValidationsDocument } from '../validations.schema';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { ValidationsRepository } from './validations.repository';
import { CreateValidationsDto } from 'src/modules/validations/dtos';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ValidationsRepositoryImpl extends BaseRepositoryImpl<ValidationsDocument> implements ValidationsRepository {

  constructor (@InjectModel(Validations.name) protected ValidationsModel: Model<ValidationsDocument>) {
    super(ValidationsModel);
  }

  create(object: CreateValidationsDto): Promise<ValidationsDocument> {
    const validation = new this.ValidationsModel(object);
    return validation.save();
  }

  update(id: string, object: CreateValidationsDto): Promise<ValidationsDocument> {
    return this.ValidationsModel.findOneAndUpdate({ _id: id }, object, { new: true }).exec();
  }

  insertMany(array: CreateValidationsDto[]): Promise<any> {
    return this.ValidationsModel.insertMany(array);
  }

  updateOne(condition: any, object: any): Promise<ValidationsDocument> {
    return this.ValidationsModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

  deleteOne(condition: any): Promise<any> {
    return this.ValidationsModel.findOneAndDelete(condition).exec();
  }
}
