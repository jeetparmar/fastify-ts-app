import { SortOrder, Types } from 'mongoose';
import Comment from '../models/Comment';
import { CommentSort } from '../utils/enum';
import { sortOptionSwitch } from '../utils/methods';

export const getById = (id: string) => Comment.findById(id);

export const getByCursor = async (
  filter: Record<string, any>,
  cursor?: string,
  limit = 10,
  sort: CommentSort = CommentSort.CREATED_AT_ASC
) => {
  const query: Record<string, any> = { ...filter };

  // Cursor condition (fetch older records)
  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  // Fetch one extra record to detect "hasMore"
  const results = await Comment.find(query)
    .sort(sortOptionSwitch(sort))
    .limit(limit + 1);

  const hasMore = results.length > limit;

  if (hasMore) {
    results.pop(); // remove extra item
  }

  return {
    data: results,
    meta: {
      nextCursor: results.length ? results[results.length - 1]._id : null,
      hasMore,
      limit,
      sort,
    },
  };
};

export const getAll = (
  filter: Record<string, any>,
  page: number,
  limit: number,
  sort: CommentSort = CommentSort.CREATED_AT_ASC
) => {
  return Comment.find(filter)
    .sort(sortOptionSwitch(sort))
    .skip((page - 1) * limit)
    .limit(limit);
};

export const exists = (id: string) => Comment.exists({ _id: id });

export const create = (text: string, parentId?: string | null) =>
  Comment.create({ text, parentId: parentId ?? null });

export const updateById = (id: string, text: string) =>
  Comment.findByIdAndUpdate(id, { text }, { new: true });

export const deleteById = (id: string) => Comment.findByIdAndDelete(id);

export const incSubCount = (id: string, value: number) =>
  Comment.findByIdAndUpdate(id, { $inc: { totalSubComments: value } });
