import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Đã xảy ra lỗi máy chủ, vui lòng thử lại sau"
      : err.message;

  if (statusCode === 500) {
    console.error("[Server Error]", err);
  }

  res.status(statusCode).json({ error: message });
}
