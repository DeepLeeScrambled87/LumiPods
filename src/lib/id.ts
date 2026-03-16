// ID generation utilities

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const generateShortId = (): string => {
  return Math.random().toString(36).slice(2, 9);
};
