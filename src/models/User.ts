import { prop, getModelForClass } from '@typegoose/typegoose';

export class User {
  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;
  @prop({ required: true })
  public name!: string;
}

export const UserModel = getModelForClass(User);
