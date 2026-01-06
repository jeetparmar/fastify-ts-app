import mongoose, { Types } from 'mongoose';
import Comment from '../models/Comment';
import { CommentSort } from '../utils/enum';
import { sortOptionSwitch } from '../utils/methods';

// 📃 GET BY ID
export const getById = (id: string) =>
  Comment.findOne({ _id: id, isDeleted: false });

// 📃 GET BY CURSOR with Pagination
export const getByCursor = async (
  filter: Record<string, any>,
  cursor?: string,
  limit = 10,
  sort: CommentSort = CommentSort.CREATED_AT_ASC
) => {
  const query: Record<string, any> = { ...filter, isDeleted: false };

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

// 📃 GET ALL with Pagination
export const getAll = (
  filter: Record<string, any>,
  page: number,
  limit: number,
  sort: CommentSort = CommentSort.CREATED_AT_ASC
) => {
  return Comment.find({ ...filter, isDeleted: false })
    .sort(sortOptionSwitch(sort))
    .skip((page - 1) * limit)
    .limit(limit);
};

export const exists = (id: string) =>
  Comment.exists({ _id: id, isDeleted: false });

// ✍️ WRITE
export const create = (text: string, parentId?: string | null) =>
  Comment.create({ text, parentId: parentId ?? null });

// 🔄 UPDATE
export const updateById = (id: string, text: string) =>
  Comment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { text },
    { new: true }
  );

// 🧨 CASCADE SOFT DELETE
export const deleteById = async (id: string) => {
  console.warn('[CASCADE_DELETE] Transactions disabled (standalone MongoDB)');

  const root = await Comment.findOne({ _id: id, isDeleted: false });
  if (!root) return null;

  const idsToDelete: string[] = [root._id.toString()];
  let queue: string[] = [root._id.toString()];

  while (queue.length) {
    const children = await Comment.find(
      { parentId: { $in: queue }, isDeleted: false },
      { _id: 1 }
    );

    queue = children.map((c) => c._id.toString());
    idsToDelete.push(...queue);
  }

  await Comment.updateMany(
    { _id: { $in: idsToDelete } },
    { isDeleted: true, deletedAt: new Date() }
  );

  if (root.parentId) {
    await incSubCount(root.parentId, -1);
  }

  return {
    root: root,
    deletedCount: idsToDelete.length,
  };
};

// ➕ Increment/Decrement totalSubComments
export const incSubCount = async (id: string, value: number) =>
  await Comment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $inc: { totalSubComments: value } }
  );
