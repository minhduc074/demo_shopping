#!/usr/bin/env node
// scripts/seed.mjs
// Drops existing products table, recreates with full schema, seeds ~10k fake records.

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Reference Data ────────────────────────────────────────────────────────

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Living",
  "Gaming",
  "Supermarket",
  "Accessories",
  "Toys & Kids",
  "Sports & Outdoors",
  "Books & Stationery",
  "Health & Wellness",
  "Automotive",
];

// Pool of real-looking Supabase/Google user-content images that won't 403
// We reuse these images across products (different products can share same image bucket)
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",
  "https://images.unsplash.com/photo-1593642619599-9a97b9c2ee4e?w=400&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
  "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80",
  "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=400&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80",
  "https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=400&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
  "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80",
  "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
];

const PRODUCT_TEMPLATES = {
  Fashion: [
    "Premium Oversized Cotton T-Shirt",
    "Slim Fit Chino Pants",
    "Floral Summer Dress",
    "Classic Denim Jacket",
    "Casual Linen Shirt",
    "High-Waist Yoga Leggings",
    "Knit Cardigan Sweater",
    "Windbreaker Jacket",
    "Pleated Midi Skirt",
    "Graphic Print Hoodie",
    "Performance Running Shorts",
    "Ribbed Tank Top 3-Pack",
    "Wide-Leg Palazzo Pants",
    "Striped Polo Shirt",
    "Velvet Blazer",
  ],
  Electronics: [
    "Wireless Noise-Cancelling Headphones",
    "USB-C Fast Charging Cable 2m",
    "Smart LED Desk Lamp",
    "Portable Bluetooth Speaker",
    "Mechanical Gaming Keyboard",
    "4K Webcam with Ring Light",
    "Wireless Mouse",
    "Power Bank 20000mAh",
    "Phone Holder Car Mount",
    "Cable Management Box",
    "RGB Gaming Mouse Pad",
    "Smart Plug with Energy Monitor",
    "HDMI 2.1 Cable 3m",
    "Laptop Stand Adjustable",
    "True Wireless Earbuds",
  ],
  Beauty: [
    "HydroBoost Facial Moisturizer 50ml",
    "Vitamin C Brightening Serum",
    "Matte Liquid Lipstick Set",
    "Eyebrow Pencil Micro-Tip",
    "Micellar Cleansing Water",
    "SPF 50 Sunscreen Fluid",
    "Charcoal Face Mask Sheet 5-Pack",
    "Hyaluronic Acid Essence",
    "Rose Hip Oil 30ml",
    "BB Cream Full Coverage",
    "Makeup Brush Set 12pcs",
    "Setting Spray Long-Lasting",
    "Eye Shadow Palette 18 Colors",
    "Collagen Lip Treatment",
    "Tinted Moisturizer SPF30",
  ],
  "Home & Living": [
    "Bamboo Cutting Board Set",
    "Ceramic Dinner Plate Set 4pcs",
    "Non-Stick Frying Pan 28cm",
    "Linen Blackout Curtains Pair",
    "Memory Foam Pillow",
    "Scented Soy Wax Candle",
    "Stainless Steel Water Bottle 1L",
    "Bathroom Organizer Set",
    "LED Fairy String Lights 10m",
    "Velvet Throw Blanket",
    "Wall Clock Silent Sweep",
    "Wooden Coat Rack Stand",
    "Kitchen Knife Set 5pcs",
    "Laundry Basket Foldable",
    "Acrylic Photo Frame Set",
  ],
  Gaming: [
    "Gaming Headset 7.1 Surround",
    "RGB Mechanical Keyboard TKL",
    "Precision Gaming Mouse 16000 DPI",
    "Gaming Chair Ergonomic",
    "Controller Charging Dock",
    "Game Controller Thumb Grips",
    "Screen Cleaning Kit",
    "Cable Racetrack Desk Organizer",
    "Gaming Desk Mat XXL",
    "Capture Card USB-C",
    "Xbox Controller PC Adapter",
    "Console Wall Mount Bracket",
    "Gaming LED Strip Kit 5m",
    "Microphone Pop Filter",
    "Stream Deck Mini",
  ],
  Supermarket: [
    "Organic Instant Oatmeal 500g",
    "Cold Brew Coffee Concentrate",
    "Protein Bar Variety Box 12pcs",
    "Matcha Green Tea Powder",
    "Multi-Grain Rice Crackers",
    "Extra Virgin Olive Oil 500ml",
    "Raw Honey 350g",
    "Sprouted Grain Bread",
    "Coconut Aminos Sauce",
    "Quinoa White 1kg",
    "Nut Butter Sampler Pack",
    "Sparkling Water Variety 12-Pack",
    "Dark Chocolate 90% Cacao",
    "Trail Mix Snack Bags 10-Pack",
    "Himalayan Pink Salt Grinder",
  ],
  Accessories: [
    "Minimalist Leather Watch Band",
    "Polarized Sport Sunglasses",
    "Canvas Tote Bag Large",
    "Slim Card Holder Wallet",
    "Crossbody Sling Bag",
    "Baseball Cap Adjustable",
    "Silk Scrunchie Set 5pcs",
    "Beaded Charm Bracelet",
    "Sterling Silver Hoop Earrings",
    "Leather Belt Reversible",
    "Knit Beanie Hat",
    "Umbrella Compact Windproof",
    "Luggage Tag Personalized",
    "Key Chain Multi-Tool",
    "Phone Wallet Stick-On",
  ],
  "Toys & Kids": [
    "Building Blocks Classic Set 200pcs",
    "Magnetic Tiles 3D Construction",
    "Plush Stuffed Animal Bunny 30cm",
    "Watercolor Paint Set Kids",
    "Remote Control Car 4WD",
    "Dollhouse Furniture Mini Set",
    "Outdoor Bubble Machine",
    "Puzzle 1000 Pieces Scenic",
    "Science Kit Experiment",
    "Board Game Family Strategy",
    "Play-Doh Modeling Clay 10-Pack",
    "Wooden Train Track Set",
    "Kinetic Sand 2kg Tub",
    "Foam Pool Noodles 3-Pack",
    "Soccer Ball Training",
  ],
  "Sports & Outdoors": [
    "Trekking Poles Adjustable Pair",
    "Camping Hammock Lightweight",
    "Resistance Band Set 5 Levels",
    "Yoga Mat 6mm Non-Slip",
    "Hydration Running Vest",
    "Jump Rope Speed Bearing",
    "Foam Roller Deep Tissue",
    "Knee Compression Sleeve Pair",
    "Waterproof Dry Bag 10L",
    "Carabiner Clip 6-Pack",
    "Portable Water Filter Straw",
    "Cycling Helmet Lightweight",
    "Gym Gloves Weight Lifting",
    "Pull-Up Bar Doorframe",
    "Adjustable Dumbbell 10kg",
  ],
  "Books & Stationery": [
    "Dotted Journal A5 Hardcover",
    "Fountain Pen Converter Set",
    "Sticky Notes Pastel 5-Pack",
    "Desk Organizer Bamboo",
    "Washi Tape Set 20 Rolls",
    "Highlighter Pastel Set 6pcs",
    "Canvas Zipper Pencil Case",
    "Notebook Grid 200 Pages",
    "Calligraphy Brush Pen Set",
    "Self-Inking Date Stamp",
    "Planner Weekly 2026",
    "Index Cards 4x6 300pcs",
    "Laminator Pouch A4 Pack",
    "Book Light USB Rechargeable",
    "Correction Tape Roller 5-Pack",
  ],
  "Health & Wellness": [
    "Multivitamin Daily Gummies",
    "Essential Oil Diffuser 500ml",
    "Resistance Therapy Band",
    "Digital Blood Pressure Monitor",
    "Collagen Peptides Powder 500g",
    "Compression Knee Support",
    "Probiotic Capsules 60ct",
    "Sleep Aid Melatonin 5mg",
    "Cold & Hot Therapy Gel Pack",
    "Massager Neck & Shoulder",
    "Vitamin D3 + K2 Softgels",
    "Magnesium Glycinate 400mg",
    "First Aid Kit Compact",
    "Nasal Humidifier Ultrasonic",
    "Back Stretcher Lumbar Support",
  ],
  Automotive: [
    "Car Phone Mount Dashboard",
    "Tire Pressure Gauge Digital",
    "Car Vacuum Cleaner Portable",
    "Seat Organizer Back Pocket",
    "Microfiber Cleaning Cloths 10pk",
    "Jump Starter Lithium 2500A",
    "Dash Cam Loop Recording",
    "Air Freshener Vent Clip",
    "Steering Wheel Cover Universal",
    "Car Sunshade Foldable",
    "USB Car Charger Dual Port",
    "Non-Slip Dashboard Pad",
    "Reflective Safety Vest",
    "Trunk Organizer Collapsible",
    "Windshield Snow Brush Extendable",
  ],
};

const ADJECTIVES = [
  "Premium",
  "Professional",
  "Upgraded",
  "Advanced",
  "Ultra-Slim",
  "Heavy-Duty",
  "Lightweight",
  "Compact",
  "Ergonomic",
  "Eco-Friendly",
  "Limited Edition",
  "Signature",
  "Deluxe",
  "Essential",
  "Smart",
];

const DESCRIPTIONS = [
  "Designed for everyday use with premium materials that last. Comfortable, durable, and stylish.",
  "Top-rated by thousands of happy customers. Perfect for home or on-the-go use.",
  "Crafted with precision for maximum performance. A must-have addition to your lifestyle.",
  "Experience unmatched quality at an unbeatable price. Our best-seller for a reason.",
  "Built to meet the demands of modern life. Effortlessly blends function and aesthetics.",
  "Eco-conscious design using sustainable materials. Good for you and the planet.",
  "Trusted by professionals worldwide. Delivers results every single time.",
  "Innovative design meets everyday practicality. Engineered for the modern consumer.",
  "Exceptional value without compromise on quality. Elevate your daily routine.",
  "Precision-engineered for performance-minded users. Built to stand the test of time.",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function soldLabel(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function generateProduct(index) {
  const category = CATEGORIES[index % CATEGORIES.length];
  const templates = PRODUCT_TEMPLATES[category];
  const base = pick(templates);
  const adj = Math.random() > 0.5 ? `${pick(ADJECTIVES)} ` : "";
  const variant = Math.random() > 0.7 ? ` - ${pick(["Pro", "Lite", "Max", "Plus", "Mini", "Ultra", "V2", "2024 Edition"])}` : "";
  const name = `${adj}${base}${variant}`;

  const price = randFloat(1.99, 299.99);
  const originalPrice = Math.random() > 0.4 ? parseFloat((price * randFloat(1.1, 2.0)).toFixed(2)) : null;
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;

  const soldCount = rand(0, 50000);
  const stock = rand(0, 10000);
  const isFlashSale = Math.random() < 0.08; // ~8% are flash sale
  const isMall = Math.random() < 0.2; // ~20% are Mall
  const rating = randFloat(3.0, 5.0, 1);
  const reviewCount = rand(0, 5000);
  const imageUrl = IMAGE_POOL[(index + rand(0, 5)) % IMAGE_POOL.length];

  return {
    id: randomUUID(),
    name,
    description: pick(DESCRIPTIONS),
    price,
    original_price: originalPrice,
    discount_percent: discount,
    image_url: imageUrl,
    category,
    sold_count: soldCount,
    stock,
    is_flash_sale: isFlashSale,
    is_mall: isMall,
    rating,
    review_count: reviewCount,
    is_new: Math.random() < 0.15,
    created_at: new Date(
      Date.now() - rand(0, 365 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const TOTAL = 10000;
  const BATCH_SIZE = 500;

  console.log("🗑️  Dropping and recreating products table...");

  // Use raw SQL via Supabase rpc or direct postgres approach.
  // We'll use service-role client to call rpc exec_sql if available,
  // otherwise use the REST API approach with multiple calls.

  // Step 1: Drop old table (via supabase pg extension or direct RPC)
  // Supabase doesn't expose DROP TABLE via client SDK directly.
  // We'll use the postgres REST API via the anon/service client approach.
  // Instead, we'll DELETE all rows + ALTER the table if columns differ.
  // The cleanest approach: use the Postgres connection directly.

  // Since we have POSTGRES_URL_NON_POOLING, use pg driver
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    console.log("📋 Connected to Postgres, recreating schema...");

    await client.query(`
      DROP TABLE IF EXISTS public.products CASCADE;

      CREATE TABLE public.products (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             TEXT NOT NULL,
        description      TEXT NOT NULL DEFAULT '',
        price            NUMERIC(10,2) NOT NULL,
        original_price   NUMERIC(10,2),
        discount_percent INTEGER,
        image_url        TEXT NOT NULL DEFAULT '',
        category         TEXT,
        sold_count       INTEGER NOT NULL DEFAULT 0,
        stock            INTEGER NOT NULL DEFAULT 0,
        is_flash_sale    BOOLEAN NOT NULL DEFAULT FALSE,
        is_mall          BOOLEAN NOT NULL DEFAULT FALSE,
        rating           NUMERIC(3,1) NOT NULL DEFAULT 0,
        review_count     INTEGER NOT NULL DEFAULT 0,
        is_new           BOOLEAN NOT NULL DEFAULT FALSE,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Indexes for common query patterns
      CREATE INDEX idx_products_category    ON public.products(category);
      CREATE INDEX idx_products_flash_sale  ON public.products(is_flash_sale) WHERE is_flash_sale = TRUE;
      CREATE INDEX idx_products_price       ON public.products(price);
      CREATE INDEX idx_products_sold_count  ON public.products(sold_count DESC);
      CREATE INDEX idx_products_created_at  ON public.products(created_at DESC);

      -- RLS
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
    `);

    console.log("✅ Schema created. Seeding data...");

    // Seed in batches
    let inserted = 0;
    for (let batch = 0; batch < Math.ceil(TOTAL / BATCH_SIZE); batch++) {
      const rows = [];
      const batchCount = Math.min(BATCH_SIZE, TOTAL - batch * BATCH_SIZE);
      for (let i = 0; i < batchCount; i++) {
        rows.push(generateProduct(batch * BATCH_SIZE + i));
      }

      // Build parameterized query
      const cols = Object.keys(rows[0]);
      const values = rows.map((row, ri) =>
        `(${cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(",")})`
      ).join(",");
      const params = rows.flatMap((row) => cols.map((c) => row[c]));

      await client.query(
        `INSERT INTO public.products (${cols.join(",")}) VALUES ${values}`,
        params
      );

      inserted += batchCount;
      process.stdout.write(`\r  → Inserted ${inserted}/${TOTAL} products...`);
    }

    console.log(`\n✅ Seeded ${TOTAL} products successfully!`);
  } finally {
    client.release();
    await pool.end();
  }

  console.log("🎉 Done!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
