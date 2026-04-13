import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Vui lòng đăng nhập" });
    return;
  }
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này" });
    return;
  }
  next();
}
