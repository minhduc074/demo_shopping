"use client";

import { useActionState } from "react";
import { loginAction, registerAction, forgotPasswordAction, resetPasswordAction, checkoutAction, updateProfileAction, upsertProductAction } from "@/app/actions";

type FormState = { success: boolean; message: string };
const initialState: FormState = { success: false, message: "" };

function Message({ state }: { state: FormState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={`rounded-2xl px-4 py-3 text-sm ${state.success ? "bg-[rgba(0,102,101,0.14)] text-[var(--secondary)]" : "bg-[rgba(180,19,64,0.1)] text-[var(--danger)]"}`}>
      {state.message}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="password" type="password" placeholder="Mật khẩu" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input name="fullName" placeholder="Họ và tên" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="phone" placeholder="Số điện thoại" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="password" type="password" placeholder="Mật khẩu" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang xử lý..." : "Tạo tài khoản"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" placeholder="Email tài khoản" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang gửi..." : "Gửi liên kết"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" placeholder="Mật khẩu mới" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </button>
    </form>
  );
}

export function CheckoutForm({ shippingMethods, profile }: { shippingMethods: Array<{ id: string; name: string; fee: string; description: string | null }>; profile?: { fullName?: string | null; phone?: string | null } | null }) {
  const [state, action, pending] = useActionState(checkoutAction, initialState);
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="fullName" defaultValue={profile?.fullName ?? ""} placeholder="Người nhận" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
          <input name="phone" defaultValue={profile?.phone ?? ""} placeholder="Số điện thoại" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        </div>
        <input name="line1" placeholder="Địa chỉ giao hàng" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <input name="line2" placeholder="Địa chỉ bổ sung" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <input name="ward" placeholder="Phường / xã" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
          <input name="district" placeholder="Quận / huyện" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
          <input name="province" placeholder="Tỉnh / thành phố" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        </div>
        <textarea name="note" placeholder="Ghi chú đơn hàng" className="min-h-28 w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <div className="space-y-3">
          <p className="font-semibold">Phương thức vận chuyển</p>
          {shippingMethods.map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-low)] p-4">
              <input type="radio" name="shippingMethodId" value={item.id} />
              <span className="space-y-1">
                <span className="block font-semibold">{item.name}</span>
                <span className="block text-sm text-[var(--muted)]">{item.description || "Vận chuyển tiêu chuẩn."}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <p className="font-semibold">Phương thức thanh toán</p>
          <label className="flex items-center gap-3 rounded-2xl bg-[var(--surface-low)] p-4"><input type="radio" name="paymentMethod" value="cod" />Thanh toán khi nhận hàng</label>
          <label className="flex items-center gap-3 rounded-2xl bg-[var(--surface-low)] p-4"><input type="radio" name="paymentMethod" value="bank_transfer" />Chuyển khoản ngân hàng</label>
          <label className="flex items-center gap-3 rounded-2xl bg-[var(--surface-low)] p-4"><input type="radio" name="paymentMethod" value="stripe" />Thanh toán qua Stripe</label>
        </div>
      </div>
      <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <h3 className="font-display text-2xl font-semibold">Xác nhận thanh toán</h3>
        <p className="text-sm text-[var(--muted)]">Nếu chọn Stripe, hệ thống sẽ chuyển sang Stripe Checkout và chỉ xác nhận thanh toán qua webhook đã ký.</p>
        <Message state={state} />
        <button disabled={pending} className="editorial-gradient w-full rounded-full px-5 py-4 font-semibold text-white">
          {pending ? "Đang tạo đơn..." : "Đặt hàng"}
        </button>
      </div>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: { fullName?: string | null; phone?: string | null; avatarUrl?: string | null } }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input name="fullName" defaultValue={profile.fullName ?? ""} placeholder="Họ tên" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="phone" defaultValue={profile.phone ?? ""} placeholder="Số điện thoại" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="avatarUrl" defaultValue={profile.avatarUrl ?? ""} placeholder="URL ảnh đại diện" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

export function ProductEditorForm({
  product,
  categoryOptions,
}: {
  product:
    | {
        id?: string;
        name?: string | null;
        slug?: string | null;
        categoryId?: string | null;
        brand?: string | null;
        status?: string | null;
        basePrice?: string | null;
        compareAtPrice?: string | null;
        thumbnailUrl?: string | null;
        shortDescription?: string | null;
        description?: string | null;
        isFeatured?: boolean | null;
      }
    | null;
  categoryOptions: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(upsertProductAction, initialState);
  return (
    <form action={action} className="space-y-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input name="name" defaultValue={product?.name ?? ""} placeholder="Tên sản phẩm" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <input name="slug" defaultValue={product?.slug ?? ""} placeholder="Slug" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4">
        <option value="">Chọn danh mục</option>
        {categoryOptions.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="brand" defaultValue={product?.brand ?? ""} placeholder="Thương hiệu" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <select name="status" defaultValue={product?.status ?? "active"} className="rounded-2xl bg-[var(--surface-low)] px-4 py-4">
          <option value="active">Đang bán</option>
          <option value="draft">Nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="basePrice" type="number" defaultValue={product?.basePrice ?? ""} placeholder="Giá bán" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
        <input name="compareAtPrice" type="number" defaultValue={product?.compareAtPrice ?? ""} placeholder="Giá niêm yết" className="rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      </div>
      <input name="thumbnailUrl" defaultValue={product?.thumbnailUrl ?? ""} placeholder="URL ảnh đại diện" className="w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} placeholder="Mô tả ngắn" className="min-h-24 w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <textarea name="description" defaultValue={product?.description ?? ""} placeholder="Mô tả chi tiết" className="min-h-40 w-full rounded-2xl bg-[var(--surface-low)] px-4 py-4" />
      <label className="flex items-center gap-3 rounded-2xl bg-[var(--surface-low)] px-4 py-4"><input type="checkbox" name="isFeatured" defaultChecked={Boolean(product?.isFeatured)} />Hiển thị ở khu vực nổi bật</label>
      <Message state={state} />
      <button disabled={pending} className="editorial-gradient rounded-full px-5 py-4 font-semibold text-white">
        {pending ? "Đang lưu..." : "Lưu sản phẩm"}
      </button>
    </form>
  );
}
