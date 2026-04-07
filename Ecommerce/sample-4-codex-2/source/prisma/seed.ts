import bcrypt from "bcryptjs";
import { OrderStatus, PaymentStatus, PrismaClient, ProductStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Fashion",
    slug: "fashion",
    description: "Editorial wardrobe staples with a premium marketplace finish.",
    imageUrl: "/stitch/assets/asset-01.jpg",
    featured: true,
  },
  {
    name: "Home",
    slug: "home",
    description: "Objects that soften a room without sacrificing utility.",
    imageUrl: "/stitch/assets/asset-02.jpg",
    featured: true,
  },
  {
    name: "Audio",
    slug: "audio",
    description: "Listening gear and media setups curated for focus and warmth.",
    imageUrl: "/stitch/assets/asset-03.jpg",
    featured: true,
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Daily rituals with material quality, scent, and restraint.",
    imageUrl: "/stitch/assets/asset-04.jpg",
    featured: false,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Portable essentials for travel, gifting, and everyday carry.",
    imageUrl: "/stitch/assets/asset-05.jpg",
    featured: true,
  },
  {
    name: "Workspace",
    slug: "workspace",
    description: "Desk pieces tuned for digital makers and calm routines.",
    imageUrl: "/stitch/assets/asset-06.jpg",
    featured: false,
  },
];

const baseProducts = [
  {
    name: "Linen Tailored Blazer",
    slug: "linen-tailored-blazer",
    brand: "Loom & Thread",
    categorySlug: "fashion",
    description: "A soft-structured blazer cut for warm climates, editorial layering, and all-day comfort.",
    details: ["Breathable linen blend", "Half-lined interior", "Relaxed tailored silhouette"],
    tags: ["featured", "summer", "editorial"],
    imageUrl: "/stitch/assets/asset-07.jpg",
    gallery: ["/stitch/assets/asset-07.jpg", "/stitch/assets/asset-08.jpg", "/stitch/assets/asset-09.jpg"],
    priceCents: 18900,
    compareAtCents: 22900,
    inventory: 18,
    rating: 4.8,
    reviewCount: 124,
    featured: true,
  },
  {
    name: "Contour Floor Lamp",
    slug: "contour-floor-lamp",
    brand: "Modern Minimalist",
    categorySlug: "home",
    description: "Diffuse ambient light with a sculptural profile made for calm, layered interiors.",
    details: ["Powder-coated steel", "Warm 2700K LED", "Dimmer-compatible"],
    tags: ["lighting", "home", "new"],
    imageUrl: "/stitch/assets/asset-10.jpg",
    gallery: ["/stitch/assets/asset-10.jpg", "/stitch/assets/asset-11.jpg"],
    priceCents: 24500,
    compareAtCents: 28900,
    inventory: 9,
    rating: 4.7,
    reviewCount: 64,
    featured: true,
  },
  {
    name: "Studio Monitor Headphones",
    slug: "studio-monitor-headphones",
    brand: "Artisan Collective",
    categorySlug: "audio",
    description: "Neutral-tuned closed-back headphones for focused work, mixing, and nightly playlists.",
    details: ["Closed-back acoustic chamber", "Memory foam earcups", "Detachable braided cable"],
    tags: ["audio", "best-seller"],
    imageUrl: "/stitch/assets/asset-12.jpg",
    gallery: ["/stitch/assets/asset-12.jpg", "/stitch/assets/asset-13.jpg", "/stitch/assets/asset-14.jpg"],
    priceCents: 15900,
    compareAtCents: 18900,
    inventory: 26,
    rating: 4.9,
    reviewCount: 212,
    featured: true,
  },
  {
    name: "Botanical Repair Serum",
    slug: "botanical-repair-serum",
    brand: "Heritage Goods",
    categorySlug: "beauty",
    description: "A lightweight treatment that restores barrier comfort without leaving shine.",
    details: ["Niacinamide and squalane", "Glass dropper bottle", "Unscented finish"],
    tags: ["beauty", "routine"],
    imageUrl: "/stitch/assets/asset-15.jpg",
    gallery: ["/stitch/assets/asset-15.jpg", "/stitch/assets/asset-16.jpg"],
    priceCents: 4900,
    compareAtCents: 5900,
    inventory: 41,
    rating: 4.6,
    reviewCount: 88,
    featured: false,
  },
  {
    name: "Leather Weekender Tote",
    slug: "leather-weekender-tote",
    brand: "Artisan Collective",
    categorySlug: "accessories",
    description: "Carry-on sized with clean proportions, reinforced handles, and a soft vegetable-tan finish.",
    details: ["Vegetable-tanned leather", "Interior laptop sleeve", "Hidden magnetic closure"],
    tags: ["travel", "gift", "featured"],
    imageUrl: "/stitch/assets/asset-17.jpg",
    gallery: ["/stitch/assets/asset-17.jpg", "/stitch/assets/asset-18.jpg"],
    priceCents: 21900,
    compareAtCents: 25900,
    inventory: 12,
    rating: 4.8,
    reviewCount: 51,
    featured: true,
  },
  {
    name: "Marble Desk Organizer",
    slug: "marble-desk-organizer",
    brand: "Modern Minimalist",
    categorySlug: "workspace",
    description: "A heavy, tactile desk tray that turns chargers, pens, and keys into a quiet composition.",
    details: ["Solid marble base", "Felt underside", "Three modular compartments"],
    tags: ["workspace", "desk"],
    imageUrl: "/stitch/assets/asset-19.jpg",
    gallery: ["/stitch/assets/asset-19.jpg", "/stitch/assets/asset-20.jpg"],
    priceCents: 7900,
    compareAtCents: 9500,
    inventory: 33,
    rating: 4.5,
    reviewCount: 39,
    featured: false,
  },
  {
    name: "Ceramic Pour-Over Set",
    slug: "ceramic-pour-over-set",
    brand: "Artisan Collective",
    categorySlug: "home",
    description: "A hand-glazed dripper, server, and cup pairing inspired by the Stitch collection screens.",
    details: ["Three-piece set", "Matte reactive glaze", "Fits standard paper filters"],
    tags: ["kitchen", "home", "editorial"],
    imageUrl: "/stitch/assets/asset-21.jpg",
    gallery: ["/stitch/assets/asset-21.jpg", "/stitch/assets/asset-22.jpg", "/stitch/assets/asset-23.jpg"],
    priceCents: 6900,
    compareAtCents: 8400,
    inventory: 17,
    rating: 4.9,
    reviewCount: 146,
    featured: true,
  },
  {
    name: "Merino Travel Sweater",
    slug: "merino-travel-sweater",
    brand: "Loom & Thread",
    categorySlug: "fashion",
    description: "An elevated knit for flights, cool evenings, and uniform dressing across seasons.",
    details: ["Fine merino yarn", "Ribbed cuffs", "Easy layering weight"],
    tags: ["fashion", "travel"],
    imageUrl: "/stitch/assets/asset-24.jpg",
    gallery: ["/stitch/assets/asset-24.jpg", "/stitch/assets/asset-25.jpg"],
    priceCents: 12900,
    compareAtCents: 14900,
    inventory: 22,
    rating: 4.7,
    reviewCount: 71,
    featured: false,
  },
  {
    name: "Stoneware Incense Holder",
    slug: "stoneware-incense-holder",
    brand: "Heritage Goods",
    categorySlug: "home",
    description: "Compact ritual object with a hand-shaped basin and lightly speckled finish.",
    details: ["Wheel-thrown stoneware", "Heat-safe glaze", "Fits standard incense sticks"],
    tags: ["home", "ritual"],
    imageUrl: "/stitch/assets/asset-26.jpg",
    gallery: ["/stitch/assets/asset-26.jpg", "/stitch/assets/asset-27.jpg"],
    priceCents: 3200,
    compareAtCents: 3900,
    inventory: 58,
    rating: 4.4,
    reviewCount: 23,
    featured: false,
  },
  {
    name: "Canvas Tech Sling",
    slug: "canvas-tech-sling",
    brand: "Modern Minimalist",
    categorySlug: "accessories",
    description: "A compact, weather-ready sling built for daily commuting with room for the essentials.",
    details: ["Waxed canvas shell", "Magnetic front pocket", "Adjustable strap"],
    tags: ["accessories", "tech"],
    imageUrl: "/stitch/assets/asset-28.jpg",
    gallery: ["/stitch/assets/asset-28.jpg", "/stitch/assets/asset-29.jpg"],
    priceCents: 8400,
    compareAtCents: 9900,
    inventory: 6,
    rating: 4.6,
    reviewCount: 44,
    featured: false,
  },
  {
    name: "Desk Speaker Pair",
    slug: "desk-speaker-pair",
    brand: "Artisan Collective",
    categorySlug: "audio",
    description: "Compact desktop speakers with warm mids and enough detail for long editing sessions.",
    details: ["Bluetooth and AUX", "Walnut veneer housing", "USB-C powered"],
    tags: ["audio", "workspace", "new"],
    imageUrl: "/stitch/assets/asset-30.jpg",
    gallery: ["/stitch/assets/asset-30.jpg", "/stitch/assets/asset-31.jpg", "/stitch/assets/asset-32.jpg"],
    priceCents: 13900,
    compareAtCents: 16900,
    inventory: 14,
    rating: 4.8,
    reviewCount: 57,
    featured: true,
  },
  {
    name: "Travel Candle Trio",
    slug: "travel-candle-trio",
    brand: "Heritage Goods",
    categorySlug: "beauty",
    description: "Three compact scents balanced around cedar, tea, citrus, and warm resin.",
    details: ["Soy wax blend", "Reusable tins", "Designed for gifting"],
    tags: ["beauty", "gift"],
    imageUrl: "/stitch/assets/asset-33.jpg",
    gallery: ["/stitch/assets/asset-33.jpg"],
    priceCents: 4100,
    compareAtCents: 4900,
    inventory: 27,
    rating: 4.5,
    reviewCount: 18,
    featured: false,
  },
];

const PRODUCT_TARGET = 10012;

function generateSyntheticProducts() {
  const categoriesBySlug = categories.map((category) => category.slug);
  const syntheticProducts = [];

  for (let index = 0; index < PRODUCT_TARGET - baseProducts.length; index += 1) {
    const template = baseProducts[index % baseProducts.length];
    const categorySlug = categoriesBySlug[index % categoriesBySlug.length];
    const serial = String(index + 1).padStart(5, "0");
    const assetIndex = (index % 33) + 1;
    const priceDelta = (index % 27) * 125;

    syntheticProducts.push({
      name: `${template.name} ${serial}`,
      slug: `${template.slug}-${serial}`,
      brand: template.brand,
      categorySlug,
      description: `${template.description} Synthetic catalog item ${serial} generated for pagination, search, and checkout load testing.`,
      details: [...template.details, `Batch ${Math.floor(index / 50) + 1}`],
      tags: [...template.tags, "synthetic", `batch-${Math.floor(index / 250) + 1}`],
      imageUrl: `/stitch/assets/asset-${String(assetIndex).padStart(2, "0")}.jpg`,
      gallery: [
        `/stitch/assets/asset-${String(assetIndex).padStart(2, "0")}.jpg`,
        `/stitch/assets/asset-${String(((assetIndex + 1) % 33) || 33).padStart(2, "0")}.jpg`,
      ],
      priceCents: template.priceCents + priceDelta,
      compareAtCents: (template.compareAtCents ?? template.priceCents + 1500) + priceDelta,
      inventory: 5 + (index % 95),
      rating: Number((3.8 + (index % 13) * 0.1).toFixed(1)),
      reviewCount: 5 + (index % 500),
      featured: index % 17 === 0,
    });
  }

  return syntheticProducts;
}

async function main() {
  const customerPassword = await bcrypt.hash("demo1234", 10);
  const adminPassword = await bcrypt.hash("admin1234", 10);

  await prisma.session.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const createdCategories = await Promise.all(categories.map((category) => prisma.category.create({ data: category })));
  const categoryIdBySlug = new Map(createdCategories.map((category) => [category.slug, category.id]));
  const allProducts = [...baseProducts, ...generateSyntheticProducts()];

  await prisma.product.createMany({
    data: allProducts.map((product) => ({
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      details: product.details,
      tags: product.tags,
      imageUrl: product.imageUrl,
      gallery: product.gallery,
      priceCents: product.priceCents,
      compareAtCents: product.compareAtCents,
      inventory: product.inventory,
      rating: product.rating,
      reviewCount: product.reviewCount,
      featured: product.featured,
      status: ProductStatus.ACTIVE,
      categoryId: categoryIdBySlug.get(product.categorySlug)!,
    })),
  });

  const createdProducts = await prisma.product.findMany({
    select: { id: true, slug: true },
  });

  const productIdBySlug = new Map(createdProducts.map((product) => [product.slug, product.id]));

  const admin = await prisma.user.create({
    data: {
      name: "Admin Curator",
      email: "admin@thecurator.local",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      cart: {
        create: {
          label: "Admin Cart",
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Lan Nguyen",
      email: "lan@thecurator.local",
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      cart: {
        create: {
          label: "Lan's Cart",
        },
      },
    },
  });

  const customerCart = await prisma.cart.findUniqueOrThrow({
    where: { userId: customer.id },
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: customerCart.id, productId: productIdBySlug.get("linen-tailored-blazer")!, quantity: 1 },
      { cartId: customerCart.id, productId: productIdBySlug.get("ceramic-pour-over-set")!, quantity: 2 },
      { cartId: customerCart.id, productId: productIdBySlug.get("desk-speaker-pair")!, quantity: 1 },
    ],
  });

  await prisma.order.create({
    data: {
      userId: customer.id,
      orderNumber: "TC-2026-001",
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PAID,
      subtotalCents: 34600,
      shippingCents: 1200,
      totalCents: 35800,
      shippingName: "Lan Nguyen",
      shippingEmail: customer.email,
      addressLine1: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      notes: "Leave at the reception desk.",
      items: {
        create: [
          { productId: productIdBySlug.get("leather-weekender-tote")!, quantity: 1, unitPriceCents: 21900 },
          { productId: productIdBySlug.get("ceramic-pour-over-set")!, quantity: 1, unitPriceCents: 6900 },
          { productId: productIdBySlug.get("travel-candle-trio")!, quantity: 1, unitPriceCents: 4100 },
          { productId: productIdBySlug.get("stoneware-incense-holder")!, quantity: 1, unitPriceCents: 3200 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: customer.id,
      orderNumber: "TC-2026-002",
      status: OrderStatus.FULFILLED,
      paymentStatus: PaymentStatus.PAID,
      subtotalCents: 29800,
      shippingCents: 800,
      totalCents: 30600,
      shippingName: "Lan Nguyen",
      shippingEmail: customer.email,
      addressLine1: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      notes: "Packed with gift wrap.",
      items: {
        create: [
          { productId: productIdBySlug.get("studio-monitor-headphones")!, quantity: 1, unitPriceCents: 15900 },
          { productId: productIdBySlug.get("marble-desk-organizer")!, quantity: 1, unitPriceCents: 7900 },
          { productId: productIdBySlug.get("travel-candle-trio")!, quantity: 1, unitPriceCents: 4100 },
          { productId: productIdBySlug.get("botanical-repair-serum")!, quantity: 1, unitPriceCents: 4900 },
        ],
      },
    },
  });

  console.log(`Seeded ${createdCategories.length} categories, ${createdProducts.length} products, users ${admin.email} and ${customer.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
