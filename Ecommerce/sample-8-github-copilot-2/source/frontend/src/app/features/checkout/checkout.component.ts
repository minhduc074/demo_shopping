import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="container mx-auto px-4 max-w-5xl py-8">
      <h1 class="font-heading font-black text-3xl text-gray-900 mb-8">Thanh toán</h1>

      @if (!cartSvc.cart() || cartSvc.itemCount() === 0) {
        <div class="text-center py-16">
          <p class="text-muted">Giỏ hàng trống. <a routerLink="/san-pham" class="text-primary underline">Mua sắm tiếp</a></p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Form -->
          <div class="lg:col-span-2">
            <form [formGroup]="form" (ngSubmit)="submit()">

              <!-- Delivery info -->
              <div class="card p-6 mb-6">
                <h2 class="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">local_shipping</span>
                  Thông tin giao hàng
                </h2>

                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Họ và tên *</label>
                    <input formControlName="recipientName" type="text" class="input-field" placeholder="Nguyễn Văn A" />
                    @if (form.get('recipientName')?.errors?.['required'] && form.get('recipientName')?.touched) {
                      <p class="text-red-500 text-xs mt-1">Vui lòng nhập họ tên</p>
                    }
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Số điện thoại *</label>
                    <input formControlName="recipientPhone" type="tel" class="input-field" placeholder="0901 234 567" />
                    @if (form.get('recipientPhone')?.errors?.['required'] && form.get('recipientPhone')?.touched) {
                      <p class="text-red-500 text-xs mt-1">Vui lòng nhập số điện thoại</p>
                    }
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Địa chỉ giao hàng *</label>
                    <input formControlName="shippingAddress" type="text" class="input-field" placeholder="123 Đường ABC, Phường XYZ" />
                    @if (form.get('shippingAddress')?.errors?.['required'] && form.get('shippingAddress')?.touched) {
                      <p class="text-red-500 text-xs mt-1">Vui lòng nhập địa chỉ</p>
                    }
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Tỉnh / Thành phố *</label>
                    <select formControlName="city" class="input-field">
                      <option value="">Chọn tỉnh / thành phố</option>
                      @for (city of cities; track city) {
                        <option [value]="city">{{ city }}</option>
                      }
                    </select>
                    @if (form.get('city')?.errors?.['required'] && form.get('city')?.touched) {
                      <p class="text-red-500 text-xs mt-1">Vui lòng chọn tỉnh/thành phố</p>
                    }
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Ghi chú (tùy chọn)</label>
                    <textarea formControlName="note" rows="2" class="input-field resize-none" placeholder="Ghi chú cho người giao hàng..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Payment method -->
              <div class="card p-6 mb-6">
                <h2 class="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">payment</span>
                  Phương thức thanh toán
                </h2>

                <div class="space-y-3">
                  <label class="flex items-center gap-3 p-4 border-2 rounded-card cursor-pointer transition-colors"
                    [class.border-primary]="form.get('paymentMethod')!.value === 'COD'"
                    [class.border-gray-200]="form.get('paymentMethod')!.value !== 'COD'">
                    <input type="radio" formControlName="paymentMethod" value="COD" class="sr-only" />
                    <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-orange-600">payments</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p class="text-sm text-muted">Trả tiền mặt khi nhận được hàng</p>
                    </div>
                    @if (form.get('paymentMethod')!.value === 'COD') {
                      <span class="material-symbols-outlined text-primary ml-auto">check_circle</span>
                    }
                  </label>

                  <label class="flex items-center gap-3 p-4 border-2 rounded-card cursor-pointer transition-colors"
                    [class.border-primary]="form.get('paymentMethod')!.value === 'STRIPE'"
                    [class.border-gray-200]="form.get('paymentMethod')!.value !== 'STRIPE'">
                    <input type="radio" formControlName="paymentMethod" value="STRIPE" class="sr-only" />
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-blue-600">credit_card</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">Thanh toán thẻ (Stripe)</p>
                      <p class="text-sm text-muted">Visa, Mastercard, JCB an toàn và nhanh chóng</p>
                    </div>
                    @if (form.get('paymentMethod')!.value === 'STRIPE') {
                      <span class="material-symbols-outlined text-primary ml-auto">check_circle</span>
                    }
                  </label>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="btn-primary w-full text-lg py-4"
              >
                @if (submitting()) {
                  <span class="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 align-middle"></span>
                  Đang xử lý...
                } @else {
                  Xác nhận đặt hàng
                }
              </button>
            </form>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="card p-5 sticky top-24">
              <h3 class="font-semibold text-lg mb-4">Đơn hàng ({{ cartSvc.itemCount() }})</h3>

              <div class="space-y-3 max-h-72 overflow-y-auto mb-4">
                @for (item of cartSvc.cart()!.items; track item.id) {
                  <div class="flex gap-3">
                    <div class="relative flex-shrink-0">
                      <img [src]="item.product.imageUrl || 'assets/placeholder.png'" [alt]="item.product.name"
                        class="w-14 h-14 object-cover rounded-lg bg-gray-100" />
                      <span class="absolute -top-1.5 -right-1.5 bg-gray-700 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                        {{ item.quantity }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ item.product.name }}</p>
                      <p class="text-sm text-primary font-semibold mt-0.5">{{ item.product.price * item.quantity | currencyVnd }}</p>
                    </div>
                  </div>
                }
              </div>

              <div class="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{{ cartSvc.subtotal() | currencyVnd }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span [class.text-green-600]="cartSvc.subtotal() >= 500000">
                    {{ cartSvc.subtotal() >= 500000 ? 'Miễn phí' : '30.000 ₫' }}
                  </span>
                </div>
                <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span class="text-primary">{{ totalAmount() | currencyVnd }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  cartSvc = inject(CartService);
  private orderSvc = inject(OrderService);
  private toastSvc = inject(ToastService);
  private authSvc = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  submitting = signal(false);

  form = this.fb.group({
    recipientName: [this.authSvc.user()?.name ?? '', Validators.required],
    recipientPhone: [this.authSvc.user()?.phone ?? '', Validators.required],
    shippingAddress: [this.authSvc.user()?.address ?? '', Validators.required],
    city: ['', Validators.required],
    note: [''],
    paymentMethod: ['COD', Validators.required],
  });

  cities = [
    'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Quy Nhơn',
    'Long Xuyên', 'Thái Nguyên', 'Bắc Ninh', 'Đà Lạt', 'Buôn Ma Thuột',
  ];

  ngOnInit(): void {
    if (!this.cartSvc.cart()) {
      this.cartSvc.load().subscribe();
    }
  }

  totalAmount(): number {
    const s = this.cartSvc.subtotal();
    return s + (s >= 500000 ? 0 : 30000);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue() as any;
    this.orderSvc.checkout(value).subscribe({
      next: result => {
        if (result.type === 'stripe' && result.sessionUrl) {
          window.location.href = result.sessionUrl;
        } else {
          this.router.navigate(['/dat-hang-thanh-cong'], { queryParams: { orderId: result.orderId } });
        }
      },
      error: (err: Error) => {
        this.toastSvc.error(err.message);
        this.submitting.set(false);
      },
    });
  }
}
