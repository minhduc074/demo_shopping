import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "../src/middleware/error";
import authRouter from "../src/routes/auth.routes";
import productRouter from "../src/routes/product.routes";
import categoryRouter from "../src/routes/category.routes";
import cartRouter from "../src/routes/cart.routes";
import orderRouter from "../src/routes/order.routes";
import checkoutRouter from "../src/routes/checkout.routes";
import webhookRouter from "../src/routes/webhook.routes";
import adminRouter from "../src/routes/admin.routes";

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRouter);

// General middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Error handler (must be last)
app.use(errorMiddleware);

export default app;
