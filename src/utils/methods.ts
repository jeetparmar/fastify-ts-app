import { SortOrder } from 'mongoose';
import { CommentSort } from './enum';

export const sortOptionSwitch = (sort: CommentSort) => {
  let sortOption: Record<string, SortOrder>;
  switch (sort) {
    case CommentSort.CREATED_AT_ASC:
      sortOption = { createdAt: 'asc' };
      break;
    case CommentSort.CREATED_AT_DESC:
      sortOption = { createdAt: 'desc' };
      break;
    case CommentSort.UPDATED_AT_ASC:
      sortOption = { updatedAt: 'asc' };
      break;
    case CommentSort.UPDATED_AT_DESC:
      sortOption = { updatedAt: 'desc' };
      break;
    case CommentSort.TEXT_ASC:
      sortOption = { text: 'asc' };
      break;
    case CommentSort.TEXT_DESC:
      sortOption = { text: 'desc' };
      break;
    default:
      sortOption = { _id: 'desc' };
      break;
  }
  return sortOption;
};
