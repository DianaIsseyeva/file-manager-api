import { getModelForClass, prop } from '@typegoose/typegoose';

export class File {
  @prop({ required: true }) filename!: string;
  @prop({ required: true }) mimetype!: string;
  @prop({ required: true }) size!: number;
  @prop({ required: true }) key!: string;
  @prop({ required: true }) url!: string;
  @prop({ default: Date.now }) uploadedAt?: Date;
}

export const FileModel = getModelForClass(File);
