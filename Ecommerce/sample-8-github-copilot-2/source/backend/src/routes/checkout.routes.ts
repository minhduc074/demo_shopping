import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { OrderService } from "../services/order.service";

const router = Router();

// POST /api/checkout
router.post("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentMethod, recipientName, recipientPhone, shippingAddress, city, note } = req.body;

    if (!paymentMethod || !recipientName || !recipientPhone || !shippingAddress || !city) {
      res.status(400).json({ error: "Thiếu thông tin giao hàng bắt buộc" });
      return;
    }

    const result = await OrderService.checkout(req.user!.userId, {
      paymentMethod,
      recipientName,
      recipientPhone,
      shippingAddress,
      city,
      note,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
