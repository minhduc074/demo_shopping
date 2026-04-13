import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCT_IMAGES = [
  // [0] Sách - cuốn sách
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&q=80",
  // [1] Sách - sách mở
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&q=80",
  // [2] Sách - giá sách
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&q=80",
  // [3] Thể Thao - bình nước
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&q=80",
  // [4] Thời Trang - áo thun
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80",
  // [5] Nhà Cửa - bình giữ nhiệt
  "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=400&h=400&fit=crop&q=80",
  // [6] Nhà Cửa - ghế
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80",
  // [7] Làm Đẹp - serum
  "https://images.unsplash.com/photo-1570194065650-d99fb4b38d8f?w=400&h=400&fit=crop&q=80",
  // [8] Làm Đẹp - mỹ phẩm
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&q=80",
  // [9] Điện Tử - tai nghe
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&q=80",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@editorial.vn" },
    update: {},
    create: {
      email: "admin@editorial.vn",
      fullName: "Quản Trị Viên",
      phone: "0900000000",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user:", admin.email);

  // Create customer user
  const customerHash = await bcrypt.hash("Khach@123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "khach@editorial.vn" },
    update: {},
    create: {
      email: "khach@editorial.vn",
      fullName: "Nguyễn Văn Khách",
      phone: "0901234567",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });
  console.log("✓ Customer user:", customer.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "thoi-trang" },
      update: {},
      create: { name: "Thời Trang", slug: "thoi-trang", icon: "checkroom" },
    }),
    prisma.category.upsert({
      where: { slug: "dien-tu" },
      update: {},
      create: { name: "Điện Tử", slug: "dien-tu", icon: "devices" },
    }),
    prisma.category.upsert({
      where: { slug: "lam-dep" },
      update: {},
      create: { name: "Làm Đẹp", slug: "lam-dep", icon: "auto_fix_high" },
    }),
    prisma.category.upsert({
      where: { slug: "nha-cua" },
      update: {},
      create: { name: "Nhà Cửa", slug: "nha-cua", icon: "home" },
    }),
    prisma.category.upsert({
      where: { slug: "the-thao" },
      update: {},
      create: { name: "Thể Thao", slug: "the-thao", icon: "fitness_center" },
    }),
    prisma.category.upsert({
      where: { slug: "sach" },
      update: {},
      create: { name: "Sách", slug: "sach", icon: "menu_book" },
    }),
  ]);
  console.log(`✓ ${categories.length} categories created`);

  const [thoiTrang, dienTu, lamDep, nhaCua, theThao, sach] = categories;

  // Create products
  const productsData = [
    // Thời Trang
    {
      categoryId: thoiTrang.id,
      name: "Áo khoác dạ nữ dáng dài phong cách thu đông",
      slug: "ao-khoac-da-nu-dang-dai",
      description:
        "Áo khoác dạ cao cấp dáng dài, phong cách Hàn Quốc. Chất liệu dạ mềm mịn, giữ ấm tốt trong những ngày đông lạnh. Thiết kế thanh lịch, phù hợp đi làm và dạo phố.",
      price: 1890000,
      originalPrice: 2500000,
      inventoryCount: 50,
      soldCount: 842,
      imageUrl: PRODUCT_IMAGES[4],
    },
    {
      categoryId: thoiTrang.id,
      name: "Nike Air Max Red Edition",
      slug: "nike-air-max-red-edition",
      description:
        "Giày Nike Air Max phiên bản đặc biệt màu đỏ. Đế cushioning độc quyền, thoải mái cho mọi hoạt động.",
      price: 1250000,
      originalPrice: 2400000,
      inventoryCount: 30,
      soldCount: 124,
      imageUrl: PRODUCT_IMAGES[0],
    },
    {
      categoryId: thoiTrang.id,
      name: "Signature Sunglasses Edition 2024",
      slug: "signature-sunglasses-2024",
      description:
        "Kính mắt cao cấp chống UV400, thiết kế editorial độc đáo. Gọng kim loại mảnh, tròng kính gradient.",
      price: 550000,
      originalPrice: 650000,
      inventoryCount: 80,
      soldCount: 0,
      imageUrl: PRODUCT_IMAGES[3],
    },

    // Điện Tử
    {
      categoryId: dienTu.id,
      name: "Bàn phím cơ không dây phiên bản giới hạn",
      slug: "ban-phim-co-khong-day-gioi-han",
      description:
        "Bàn phím cơ không dây 75%, switch Cherry MX Red, kết nối Bluetooth 5.0 + USB-C. Thiết kế compact, đèn LED RGB per-key.",
      price: 2450000,
      originalPrice: null,
      inventoryCount: 25,
      soldCount: 1200,
      imageUrl: PRODUCT_IMAGES[7],
    },
    {
      categoryId: dienTu.id,
      name: "Minimalist Smart Watch",
      slug: "minimalist-smart-watch",
      description:
        "Đồng hồ thông minh thiết kế tối giản, màn hình AMOLED 1.4 inch. Theo dõi sức khỏe 24/7, pin 7 ngày.",
      price: 890000,
      originalPrice: 1270000,
      inventoryCount: 15,
      soldCount: 0,
      imageUrl: PRODUCT_IMAGES[1],
    },
    {
      categoryId: dienTu.id,
      name: "Máy tính bảng màn hình 12 inch Pro",
      slug: "may-tinh-bang-12-inch-pro",
      description:
        "Máy tính bảng 12 inch, màn hình IPS 2K, chip MediaTek Helio G99, RAM 8GB, bộ nhớ 256GB. Kèm bao da và bút cảm ứng.",
      price: 15490000,
      originalPrice: 18000000,
      inventoryCount: 10,
      soldCount: 124,
      imageUrl: PRODUCT_IMAGES[9],
    },
    {
      categoryId: dienTu.id,
      name: "Premium Audio Bass Headphones",
      slug: "premium-audio-bass",
      description:
        "Tai nghe premium over-ear, âm bass sâu, chống ồn active (ANC). Kết nối Bluetooth 5.2, pin 30 giờ.",
      price: 3150000,
      originalPrice: 3900000,
      inventoryCount: 20,
      soldCount: 450,
      imageUrl: PRODUCT_IMAGES[2],
    },

    // Làm Đẹp
    {
      categoryId: lamDep.id,
      name: "Bộ mỹ phẩm dưỡng da Organic cao cấp",
      slug: "bo-my-pham-duong-da-organic",
      description:
        "Bộ dưỡng da 5 bước hoàn chỉnh từ thiên nhiên: sữa rửa mặt, toner, serum vitamin C, kem dưỡng ẩm, kem mắt. Không paraben, không cồn.",
      price: 950000,
      originalPrice: null,
      inventoryCount: 100,
      soldCount: 2500,
      imageUrl: PRODUCT_IMAGES[5],
    },
    {
      categoryId: lamDep.id,
      name: "Serum Dưỡng Trắng HA Complex",
      slug: "serum-duong-trang-ha-complex",
      description:
        "Serum dưỡng trắng đột phá chứa Hyaluronic Acid 2%, Niacinamide 10%, Vitamin B5. Da sáng mịn sau 2 tuần.",
      price: 480000,
      originalPrice: 650000,
      inventoryCount: 150,
      soldCount: 3200,
      imageUrl: PRODUCT_IMAGES[6],
    },

    // Nhà Cửa
    {
      categoryId: nhaCua.id,
      name: "Ghế bành thư giãn phong cách Bắc Âu",
      slug: "ghe-banh-thu-gian-bac-au",
      description:
        "Ghế bành thiết kế Scandinavian, khung gỗ sồi tự nhiên, đệm vải linen cao cấp. Thoải mái cho ngồi đọc sách và thư giãn.",
      price: 4200000,
      originalPrice: 5500000,
      inventoryCount: 8,
      soldCount: 58,
      imageUrl: PRODUCT_IMAGES[8],
    },
    {
      categoryId: nhaCua.id,
      name: "Bình giữ nhiệt Vacuum Flask 500ml",
      slug: "binh-giu-nhiet-vacuum-500ml",
      description:
        "Bình giữ nhiệt inox 304, giữ nóng 12h / lạnh 24h. Nắp chống trơn, thiết kế minimalist, dung tích 500ml.",
      price: 320000,
      originalPrice: 420000,
      inventoryCount: 200,
      soldCount: 1850,
      imageUrl: PRODUCT_IMAGES[0],
    },

    // Thể Thao
    {
      categoryId: theThao.id,
      name: "Áo thun thể thao DryFit Nam",
      slug: "ao-thun-the-thao-dryfit-nam",
      description:
        "Áo thun thể thao chất liệu DryFit thấm hút mồ hôi nhanh. Phù hợp tập gym, chạy bộ, cầu lông. Có nhiều màu sắc.",
      price: 280000,
      originalPrice: 380000,
      inventoryCount: 300,
      soldCount: 5600,
      imageUrl: PRODUCT_IMAGES[1],
    },
    {
      categoryId: theThao.id,
      name: "Bình nước thể thao 1L BPA-free",
      slug: "binh-nuoc-the-thao-1l",
      description:
        "Bình nước thể thao nhựa Tritan BPA-free, dung tích 1 lít. Nắp pop-up tiện lợi, thang đo thể tích, đi kèm dây đeo.",
      price: 185000,
      originalPrice: 250000,
      inventoryCount: 500,
      soldCount: 2100,
      imageUrl: PRODUCT_IMAGES[2],
    },

    // Sách
    {
      categoryId: sach.id,
      name: "Atomic Habits - Thói quen nguyên tử",
      slug: "atomic-habits-thoi-quen-nguyen-tu",
      description:
        "Cuốn sách bán chạy nhất về xây dựng thói quen tốt của James Clear. Bản dịch tiếng Việt chất lượng cao, bìa cứng.",
      price: 110000,
      originalPrice: 149000,
      inventoryCount: 500,
      soldCount: 12000,
      imageUrl: PRODUCT_IMAGES[3],
    },
    {
      categoryId: sach.id,
      name: "Sapiens - Lược Sử Loài Người",
      slug: "sapiens-luoc-su-loai-nguoi",
      description:
        "Tác phẩm nổi tiếng của Yuval Noah Harari. Khám phá lịch sử 70.000 năm của loài người từ góc nhìn khoa học.",
      price: 135000,
      originalPrice: 179000,
      inventoryCount: 300,
      soldCount: 8500,
      imageUrl: PRODUCT_IMAGES[4],
    },
  ];

  for (const productData of productsData) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: { imageUrl: productData.imageUrl },
      create: productData,
    });
  }
  console.log(`✓ ${productsData.length} products created`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\nDefault accounts:");
  console.log("  Admin:    admin@editorial.vn / Admin@123");
  console.log("  Customer: khach@editorial.vn / Khach@123");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
