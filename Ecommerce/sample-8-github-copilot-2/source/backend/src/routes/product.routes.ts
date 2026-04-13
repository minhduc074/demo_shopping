import { Router, Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

const router = Router();

// GET /api/products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      q: req.query.q as string | undefined,
      category: req.query.category as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort as "newest" | "popular" | "price_asc" | "price_desc" | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Math.min(Number(req.query.limit), 100) : 20,
    };
    const result = await ProductService.list(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/featured
router.get("/featured", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductService.getFeatured();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/flash-sale
router.get("/flash-sale", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductService.getFlashSale();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.getBySlug(req.params.slug);
    const related = await ProductService.getRelated(product.id, product.categoryId);
    res.json({ product, related });
  } catch (err) {
    next(err);
  }
});

export default router;
