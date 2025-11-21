import mongoose, { Model, Schema, HydratedDocument } from 'mongoose';

export interface ICard {
  name: string;
  link: string;
  owner: mongoose.Types.ObjectId;
  likes?: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

export type CardDocument = HydratedDocument<ICard>;

const cardSchema = new Schema<ICard>({
  name: { type: String, required: true, minlength: 2, maxlength: 30 },
  link: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Card = mongoose.model<ICard>('card', cardSchema) as unknown as Model<CardDocument>;

export default Card;
