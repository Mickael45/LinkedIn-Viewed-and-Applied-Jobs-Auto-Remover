import { DATA_MAX_SIZE, DATA_TTL } from "./config";

export const isExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > DATA_TTL;
};

export const isOverMaxSize = (size: number): boolean => {
  return size > DATA_MAX_SIZE;
};
