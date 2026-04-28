import { Types } from "mongoose";

/**
 * Coerce a string to an ObjectId for aggregate `$match` stages, where
 * Mongoose's auto-cast does NOT apply (unlike `find`/`findOne`).
 * Returns the original string if the cast fails — defensive against
 * malformed userIds reaching the query layer.
 */
export function toObjectIdLike(id: string): Types.ObjectId | string {
  try {
    return new Types.ObjectId(id);
  } catch {
    return id;
  }
}
