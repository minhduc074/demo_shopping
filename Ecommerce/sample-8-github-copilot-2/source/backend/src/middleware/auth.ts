import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies?.token as string | undefined;
    if (!token) {
      res.status(401).json({ error: "Vui lòng đăng nhập để tiếp tục" });
      return;
    }
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies?.token as string | undefined;
    if (token) {
      req.user = verifyToken(token);
    }
  } catch {
    // Not authenticated — that's fine for optional routes
  }
  next();
}
