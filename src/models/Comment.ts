import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IComment>('Comment', CommentSchema);
