export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const sanitizeLimit = (limit?: number): number => {
  if (!limit || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
};

export const sanitizeOffset = (offset?: number): number => {
  if (!offset || offset < 0) return 0;
  return offset;
};

export const stripTimestamps = (doc: Record<string, any>): Record<string, any> => {
  const { createdAt, updatedAt, ...rest } = doc;
  return rest;
};
