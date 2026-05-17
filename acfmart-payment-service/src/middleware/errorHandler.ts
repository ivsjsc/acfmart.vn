import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

/**
 * Custom error class - mọi business error throw class này để errorHandler
 * pick lên status code chuẩn.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("NOT_FOUND", `${resource}${id ? ` ${id}` : ""} không tồn tại`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

/**
 * Global error handler - phải đăng ký SAU cùng trong middleware chain.
 * Express xác định error middleware qua arity (4 tham số), nên giữ nguyên signature.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Zod validation
  if (err instanceof ZodError) {
    logger.warn({ issues: err.issues, path: req.path }, "Zod validation error");
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Dữ liệu đầu vào không hợp lệ",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  // AppError (business logic)
  if (err instanceof AppError) {
    logger.warn(
      { code: err.code, message: err.message, path: req.path, details: err.details },
      "Business error"
    );
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unknown error - log full stack, không leak details ra client
  logger.error(
    { err, path: req.path, method: req.method },
    "Unhandled error"
  );

  const isProd = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: isProd ? "Có lỗi xảy ra phía server. Vui lòng thử lại." : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

/** 404 handler - phải đặt SAU mọi route, TRƯỚC errorHandler */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "ROUTE_NOT_FOUND",
    message: `Không tìm thấy ${req.method} ${req.path}`,
  });
}
