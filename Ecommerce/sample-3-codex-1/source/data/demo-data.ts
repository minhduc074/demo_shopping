import products from "./products.json";

export type DemoProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  gallery: string[];
  accent: string;
  inventory: number;
  rating: number;
  sold: number;
  tags: string[];
};

export const demoProducts = products as DemoProduct[];

export const accountSnapshot = {
  name: "Thảo Thịnh",
  tier: "Yêu thích+",
  email: "thao@songhongcore.vn",
  orders: 12,
  wishlist: 38,
  loyaltyPoints: 1480,
  addresses: ["Q.3, TP. Hồ Chí Minh", "Hà Nội - Văn phòng giao nhanh"],
  recentOrders: [
    "SH-240421-018 / Đã giao / 1.790.000đ",
    "SH-240417-014 / Đang đóng gói / 1.140.000đ",
    "SH-240415-002 / Hoàn tất / 720.000đ"
  ]
};
