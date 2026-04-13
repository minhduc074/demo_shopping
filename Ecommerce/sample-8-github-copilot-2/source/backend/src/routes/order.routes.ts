import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { OrderService } from "../services/order.service";

const router = Router();

router.use(authMiddleware);

// GET /api/orders
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderService.getOrders(req.user!.userId);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await OrderService.getOrderById(req.user!.userId, req.params.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
