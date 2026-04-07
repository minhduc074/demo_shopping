import { accountSnapshot, demoProducts } from "@/data/demo-data";
import { getCurrentCart } from "@/lib/cart";
import { prisma } from "@/lib/db";

export async function getCatalog() {
  try {
    return await prisma.product.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    });
  } catch {
    return demoProducts;
  }
}

export async function getFeaturedProducts() {
  const products = await getCatalog();
  return products.slice(0, 6);
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) return product;
  } catch {
    // Database not available yet; fall back to demo content.
  }

  return demoProducts.find((product) => product.slug === slug) ?? null;
}

export async function getCartProducts() {
  const cart = await getCurrentCart();
  if (!cart) return [];

  return cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    size: item.size ?? "M",
    color: item.color ?? "Mặc định",
    product: item.product
  }));
}

export async function getCartSummary() {
  const items = await getCartProducts();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = items.length ? 30000 : 0;
  const discount = items.length ? 50000 : 0;

  return {
    items,
    subtotal,
    shipping,
    discount,
    total: Math.max(subtotal + shipping - discount, 0)
  };
}

export async function getAccountSnapshot() {
  return accountSnapshot;
}
