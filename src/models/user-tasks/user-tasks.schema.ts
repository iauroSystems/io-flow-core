import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

export type UserTasksDocument = UserTasks & Document;

class Custom { };

class User {
  @Prop()
  userId: string;

  @Prop()
  emailId: string;
}

class Params extends Document {
  [key: string]: any;
}

@Schema({ timestamps: true })
export class UserTasks extends Document {

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop({ required: true })
  processInstanceId: string;

  @Prop({ required: true })
  rootProcessInstanceId: string;

  @Prop({ required: true })
  taskId: string;

  @Prop()
  formId: string;

  @Prop()
  key: string;

  @Prop({ required: true })
  summary: string;

  @Prop()
  description: string;

  @Prop({ type: String })
  assignee: string;

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ default: -1 })
  expStartDate: number;

  @Prop({ default: -1 })
  expEndDate: number;

  @Prop({ default: null })
  priority: string;

  @Prop(Params)
  parameters: Params;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ required: true, default: 'todo' })
  status: string;

  @Prop()
  customParams?: SchemaTypes.Types.Mixed;

  @Prop(User)
  createdBy: User;

  @Prop(User)
  completedBy: User;

  @Prop(User)
  updatedBy: User;

}

export const UserTasksSchema = SchemaFactory.createForClass(UserTasks);
UserTasksSchema.index({ processInstanceId: 1, taskId: 1, userId: 1 }, { unique: true });
UserTasksSchema.index({ processDefinitionId: 1 });
UserTasksSchema.index({ processDefinitionKey: 1 });
UserTasksSchema.index({ processInstanceId: 1 })
UserTasksSchema.index({ rootProcessInstanceId: 1 });
UserTasksSchema.index({ assignee: 1 });
UserTasksSchema.index({ key: 1 });
UserTasksSchema.index({ status: 1 });
