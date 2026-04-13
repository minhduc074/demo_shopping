"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError, getErrorMessage } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { attachCartToUser, addToCart, removeCartItem, updateCartItem } from "@/modules/cart/service";
import { loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword } from "@/modules/auth/service";
import { createOrderFromCart, createStripeCheckoutFromCart } from "@/modules/orders/service";
import { upsertProduct, deleteProduct } from "@/modules/admin/service";
import { updateOrderStatus } from "@/modules/orders/service";
import { updateProfile } from "@/modules/users/service";

type ActionState = {
  success: boolean;
  message: string;
};

const defaultState: ActionState = { success: false, message: "" };

function asString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function handleActionError(error: unknown) {
  if (isRedirectError(error)) {
    throw error;
  }

  return { success: false, message: getErrorMessage(error) };
}

export async function registerAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    await registerUser({
      fullName: asString(formData, "fullName"),
      email: asString(formData, "email"),
      phone: asString(formData, "phone"),
      password: asString(formData, "password"),
    });
    redirect("/");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function loginAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    await loginUser({
      email: asString(formData, "email"),
      password: asString(formData, "password"),
    });
    const user = await getCurrentUser();
    if (user) {
      await attachCartToUser(user.id);
    }
    redirect("/");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function forgotPasswordAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    await requestPasswordReset({ email: asString(formData, "email") });
    return { success: true, message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function resetPasswordAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    await resetPassword({
      token: asString(formData, "token"),
      password: asString(formData, "password"),
    });
    redirect("/dang-nhap");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function logoutAction() {
  await logoutUser();
  redirect("/");
}

export async function addToCartAction(formData: FormData) {
  const user = await getCurrentUser();
  await addToCart(user?.id ?? null, {
    productId: asString(formData, "productId"),
    variantId: asString(formData, "variantId") || null,
    quantity: Number(asString(formData, "quantity") || 1),
  });
  revalidatePath("/gio-hang");
}

export async function updateCartItemAction(formData: FormData) {
  await updateCartItem({
    itemId: asString(formData, "itemId"),
    quantity: Number(asString(formData, "quantity")),
  });
  revalidatePath("/gio-hang");
}

export async function removeCartItemAction(formData: FormData) {
  await removeCartItem({
    itemId: asString(formData, "itemId"),
  });
  revalidatePath("/gio-hang");
}

export async function checkoutAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new AppError("Vui lòng đăng nhập trước khi thanh toán.", 401);
    }

    const payload = {
      shippingMethodId: asString(formData, "shippingMethodId"),
      paymentMethod: asString(formData, "paymentMethod"),
      fullName: asString(formData, "fullName"),
      phone: asString(formData, "phone"),
      line1: asString(formData, "line1"),
      line2: asString(formData, "line2"),
      ward: asString(formData, "ward"),
      district: asString(formData, "district"),
      province: asString(formData, "province"),
      postalCode: asString(formData, "postalCode"),
      note: asString(formData, "note"),
    };

    if (payload.paymentMethod === "stripe") {
      const session = await createStripeCheckoutFromCart(user.id, payload);
      redirect(session.url);
    }

    const orderId = await createOrderFromCart(user.id, payload);
    revalidatePath("/gio-hang");
    redirect(`/tai-khoan/don-hang/${orderId}`);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProfileAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new AppError("Vui lòng đăng nhập.", 401);
    }

    await updateProfile(user.id, {
      fullName: asString(formData, "fullName"),
      phone: asString(formData, "phone"),
      avatarUrl: asString(formData, "avatarUrl"),
    });

    revalidatePath("/tai-khoan");
    return { success: true, message: "Đã cập nhật hồ sơ." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function upsertProductAction(_state: ActionState = defaultState, formData: FormData) {
  void _state;
  try {
    const id = await upsertProduct({
      id: asString(formData, "id") || undefined,
      name: asString(formData, "name"),
      slug: asString(formData, "slug") || slugify(asString(formData, "name")),
      categoryId: asString(formData, "categoryId") || null,
      shortDescription: asString(formData, "shortDescription"),
      description: asString(formData, "description"),
      brand: asString(formData, "brand"),
      status: asString(formData, "status"),
      basePrice: Number(asString(formData, "basePrice")),
      compareAtPrice: asString(formData, "compareAtPrice") ? Number(asString(formData, "compareAtPrice")) : null,
      currency: asString(formData, "currency") || "VND",
      thumbnailUrl: asString(formData, "thumbnailUrl"),
      isFeatured: asString(formData, "isFeatured") === "on",
    });
    revalidatePath("/admin");
    revalidatePath("/admin/san-pham");
    redirect(`/admin/san-pham/${id}`);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProductAction(formData: FormData) {
  await deleteProduct(asString(formData, "productId"));
  revalidatePath("/admin/san-pham");
}

export async function updateOrderStatusAction(formData: FormData) {
  await updateOrderStatus(asString(formData, "orderId"), asString(formData, "status"));
  revalidatePath("/admin");
  revalidatePath("/admin/don-hang");
}
