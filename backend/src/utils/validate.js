import { ApiError } from "./ApiError.js";

export function assert(condition, message) {
  if (!condition) throw ApiError.badRequest(message);
}

export function isValidEmail(email) {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function toStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()) : undefined;
}
