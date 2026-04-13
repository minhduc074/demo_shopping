import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { CartService } from "../services/cart.service";

const router = Router();

router.use(authMiddleware);

// GET /api/cart
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await CartService.getOrCreateCart(req.user!.userId);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items
router.post("/items", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ error: "productId là bắt buộc" });
      return;
    }
    const cart = await CartService.addItem(req.user!.userId, productId, Number(quantity));
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/items/:itemId
router.put("/items/:itemId", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      res.status(400).json({ error: "quantity là bắt buộc" });
      return;
    }
    const cart = await CartService.updateItem(req.user!.userId, req.params.itemId, Number(quantity));
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:itemId
router.delete("/items/:itemId", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await CartService.removeItem(req.user!.userId, req.params.itemId);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart
router.delete("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await CartService.clearCart(req.user!.userId);
    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (err) {
    next(err);
  }
});

export default router;
