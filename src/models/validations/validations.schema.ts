import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

export type ValidationsDocument = Validations & Document;

class Properties {

  @Prop()
  key: string;

  @Prop()
  datatype: string;

  @Prop()
  required: string;

}

@Schema( { timestamps: true } )
export class Validations extends Document {

  @Prop()
  name: string;

  @Prop( { type: Properties } )
  properties: [ Properties ];

  // @Prop()
  // joiSchema: string;
}

export const ValidationsSchema = SchemaFactory.createForClass( Validations );
