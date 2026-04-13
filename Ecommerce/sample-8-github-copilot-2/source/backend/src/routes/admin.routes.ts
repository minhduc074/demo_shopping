import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { ProductService } from "../services/product.service";
import { OrderService } from "../services/order.service";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/dashboard
router.get("/dashboard", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalRevenue, totalOrders, totalUsers, totalProducts, recentOrders] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
    ]);

    res.json({
      stats: {
        totalRevenue: totalRevenue._sum.amount ?? 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/products
router.get("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductService.list({
      q: req.query.q as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// POST /api/admin/products
router.post("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id
router.put("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id (soft delete)
router.delete("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { status: "INACTIVE" },
    });
    res.json({ message: "Đã ẩn sản phẩm" });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = 20;
    const result = await OrderService.getAllOrders(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id/status
router.put("/orders/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "status là bắt buộc" });
      return;
    }
    const order = await OrderService.updateOrderStatus(req.params.id, status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count(),
    ]);
    res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

export default router;
