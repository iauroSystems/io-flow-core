import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as SchemaTypes } from 'mongoose';
import { ConnectorTypes } from 'src/common/const/enums';

export type ConnectorDocument = Connector & Document;

@Schema( { timestamps: true } )
export class Connector extends Document {

  @Prop( { index: true } )
  name: string;

  @Prop()
  description: string;

  @Prop( { type: String, enum: ConnectorTypes } )
  type: ConnectorTypes;

  @Prop({type:{}})
  config: {};

  @Prop({type:{}})
  variables: {};
}

export const ConnectorSchema = SchemaFactory.createForClass( Connector );
