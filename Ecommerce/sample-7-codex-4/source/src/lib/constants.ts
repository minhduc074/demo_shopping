export const SESSION_COOKIE_NAME = "editorial_session";
export const CART_COOKIE_NAME = "editorial_cart";

export const ORDER_STATUSES = ["pending", "confirmed", "packing", "shipping", "completed", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export const USER_ROLES = ["user", "admin"] as const;

export const STORE_NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Mua sắm" },
  { href: "/gio-hang", label: "Giỏ hàng" },
  { href: "/tai-khoan", label: "Tài khoản" },
];
