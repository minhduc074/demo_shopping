import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await AuthService.register(req.body);
    res.cookie("token", token, cookieOptions());
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await AuthService.login(req.body);
    res.cookie("token", token, cookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Đã đăng xuất thành công" });
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getUser(req.user!.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me
router.put("/me", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.updateUser(req.user!.userId, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
}

export default router;
