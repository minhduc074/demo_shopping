import {
  InventoryStatus,
  PrismaClient,
  ProductStatus,
  UserRole,
} from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

function createSalt() {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const prisma = new PrismaClient();

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
];

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Audio, devices, and work essentials.",
    icon: "Headphones",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Editorial clothing and daily essentials.",
    icon: "Shirt",
  },
  {
    name: "Home",
    slug: "home",
    description: "Furniture and considered living objects.",
    icon: "Armchair",
  },
];

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  await prisma.category.createMany({
    data: categories,
  });

  const categoryRows = await prisma.category.findMany();

  // Create Users
  const adminSalt = createSalt();
  const customerSalt = createSalt();

  await prisma.userProfile.createMany({
    data: [
      {
        email: "admin@futurelink.local",
        fullName: "Futurelink Admin",
        passwordSalt: adminSalt,
        passwordHash: hashPassword("admin12345", adminSalt),
        role: UserRole.ADMIN,
      },
      {
        email: "customer@futurelink.local",
        fullName: "Sample Customer",
        passwordSalt: customerSalt,
        passwordHash: hashPassword("customer12345", customerSalt),
        role: UserRole.CUSTOMER,
      },
    ],
  });

  // Create Products
  const products = [];
  for (let i = 0; i < 50; i++) {
    const category = categoryRows[i % categoryRows.length];
    const name = `${category.name} Item ${i + 1}`;
    
    products.push({
      categoryId: category.id,
      name,
      slug: slugify(`${name}-${i}`),
      sku: `SKU-${i}`,
      shortDescription: `A premium ${category.name.toLowerCase()} item.`,
      description: `Detailed description for ${name}. It is crafted with high quality materials and curated for modern aesthetics.`,
      price: (10 + (i * 15)) % 500,
      compareAtPrice: null,
      inventoryCount: 10 + i,
      inventoryStatus: InventoryStatus.IN_STOCK,
      featured: i < 8,
      status: ProductStatus.ACTIVE,
    });
  }

  await prisma.product.createMany({ data: products });

  const insertedProducts = await prisma.product.findMany();
  
  const images = insertedProducts.map((p, i) => ({
    productId: p.id,
    url: IMAGE_POOL[i % IMAGE_POOL.length],
    alt: p.name,
    sortOrder: 0,
  }));

  await prisma.productImage.createMany({ data: images });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
