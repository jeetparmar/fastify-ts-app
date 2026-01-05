import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  id: string;
  text: string;
  totalSubComments: number;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    totalSubComments: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CommentSchema.virtual('id').get(function (this: IComment) {
  return this._id.toHexString();
});

CommentSchema.index({ parentId: 1, _id: -1 });

CommentSchema.set('id', false);

export default mongoose.model<IComment>('Comment', CommentSchema);
