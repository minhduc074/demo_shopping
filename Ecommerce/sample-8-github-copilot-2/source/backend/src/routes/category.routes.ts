import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/categories
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: { where: { status: "ACTIVE" } },
          },
        },
      },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:slug
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
    });
    if (!category) {
      res.status(404).json({ error: "Danh mục không tồn tại" });
      return;
    }
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

export default router;
