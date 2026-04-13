import { z } from "zod";

export const checkoutSchema = z.object({
  shippingMethodId: z.uuid("Vui lòng chọn phương thức vận chuyển."),
  paymentMethod: z.enum(["cod", "bank_transfer", "stripe"], "Vui lòng chọn phương thức thanh toán."),
  fullName: z.string().min(2, "Vui lòng nhập tên người nhận."),
  phone: z.string().min(8, "Vui lòng nhập số điện thoại hợp lệ."),
  line1: z.string().min(5, "Vui lòng nhập địa chỉ."),
  line2: z.string().optional(),
  ward: z.string().optional(),
  district: z.string().optional(),
  province: z.string().min(2, "Vui lòng nhập tỉnh/thành."),
  postalCode: z.string().optional(),
  note: z.string().optional(),
});
