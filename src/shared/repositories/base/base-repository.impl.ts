import { ProjectionType, FilterQuery, SortValues, Model, PipelineStage } from 'mongoose';
import { BaseRepositry } from './base.repository';

export abstract class BaseRepositoryImpl<T> implements BaseRepositry<T>{
  model: Model<T>;

  constructor (model: Model<T>) {
    this.model = model;
  }

  find(where?: FilterQuery<T>, projection?: ProjectionType<T>,
    page?: number, limit?: number, sort?: string | { [key: string]: SortValues }): Promise<T[]> {
    let mongoQuery = this.model.find(where, projection);
    if (page !== undefined && limit !== undefined) {
      mongoQuery = mongoQuery.skip(page * limit).limit(limit);
    }
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }
    return mongoQuery.exec();
  }

  findOne(where: FilterQuery<T>, projection?: ProjectionType<T>, sort?: string | { [key: string]: SortValues }): Promise<T> {
    let mongoQuery = this.model.findOne(where, projection);
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }
    return mongoQuery.exec();
  }

  count(where: FilterQuery<T>): Promise<any> {
    return this.model.count(where).exec();
  }

  aggregate(pipeline: any[]): Promise<any> {
    return this.model.aggregate(pipeline).allowDiskUse(true).exec();
  }
}