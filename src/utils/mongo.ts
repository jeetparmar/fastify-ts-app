import mongoose from 'mongoose';

export const isValidObjectId = (id?: string) =>
  !!id && mongoose.isValidObjectId(id);
