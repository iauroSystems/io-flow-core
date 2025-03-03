import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { InjectModel } from '@nestjs/mongoose';
import { CreateConnectorBodyDto, UpdateConnectorBodyDto } from 'src/modules/connectors/dtos';
import { Connector, ConnectorDocument } from '../connectors.schema';
import { ConnectorRepository } from './connectors.repository';

@Injectable()
export class ConnectorRepositoryImpl extends BaseRepositoryImpl<ConnectorDocument> implements ConnectorRepository {
  constructor (@InjectModel(Connector.name) protected ConnectorModel: Model<ConnectorDocument>) {
    super(ConnectorModel);
  }

  create(object: CreateConnectorBodyDto): Promise<ConnectorDocument> {
    const event = new this.ConnectorModel(object);
    return event.save();
  }

  update(condition: any, object: UpdateConnectorBodyDto): Promise<ConnectorDocument> {
    return this.ConnectorModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

  deleteOne(condition: any): Promise<any> {
    return this.ConnectorModel.findOneAndDelete(condition).exec();
  }
}
