import { ZodError } from "zod";

export class AppError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export class SchemaCompatibilityError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, details);
    this.name = "SchemaCompatibilityError";
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    const messages = error.issues.map((issue) => issue.message).filter(Boolean);
    return messages.length ? messages.join(" ") : "Dữ liệu gửi lên không hợp lệ.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định.";
}
