import { Router, Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";

const router = Router();

// POST /api/webhooks/stripe
// Note: This route MUST use express.raw() — configured in api/index.ts
router.post("/stripe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Thiếu Stripe-Signature header" });
      return;
    }
    await OrderService.handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
