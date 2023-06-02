import { Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BaseDocument = Event & Document;

@Schema({ timestamps: true })
export class BaseEntity {

}