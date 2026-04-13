import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="container mx-auto px-4 max-w-5xl py-8">
      <h1 class="font-heading font-black text-3xl text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      @if (!cartSvc.cart() || cartSvc.itemCount() === 0) {
        <div class="text-center py-24 bg-white rounded-card shadow-card">
          <span class="material-symbols-outlined text-7xl text-gray-200">shopping_cart</span>
          <h3 class="font-semibold text-xl text-gray-500 mt-4">Giỏ hàng của bạn đang trống</h3>
          <p class="text-muted mt-2">Hãy khám phá và thêm sản phẩm yêu thích</p>
          <a routerLink="/san-pham" class="btn-primary mt-6 inline-block">Mua sắm ngay</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cartSvc.cart()!.items; track item.id) {
              <div class="card p-4 flex gap-4">
                <a [routerLink]="['/san-pham', item.product.slug]" class="flex-shrink-0">
                  <img
                    [src]="item.product.imageUrl || 'assets/placeholder.png'"
                    [alt]="item.product.name"
                    class="w-24 h-24 object-cover rounded-lg bg-gray-100"
                  />
                </a>

                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/san-pham', item.product.slug]"
                    class="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                    {{ item.product.name }}
                  </a>
                  <p class="text-xs text-muted mt-1">{{ item.product.category?.name }}</p>

                  <div class="flex items-center justify-between mt-3">
                    <!-- Quantity control -->
                    <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        (click)="updateQty(item.id, item.quantity - 1)"
                        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                      >−</button>
                      <span class="w-10 text-center text-sm font-medium">{{ item.quantity }}</span>
                      <button
                        (click)="updateQty(item.id, item.quantity + 1)"
                        [disabled]="item.quantity >= item.product.stock"
                        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40"
                      >+</button>
                    </div>

                    <div class="text-right">
                      <p class="font-bold text-primary">{{ item.product.price * item.quantity | currencyVnd }}</p>
                      <p class="text-xs text-muted">{{ item.product.price | currencyVnd }} / sản phẩm</p>
                    </div>
                  </div>
                </div>

                <button
                  (click)="removeItem(item.id)"
                  class="flex-shrink-0 w-8 h-8 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            }

            <button (click)="clearCart()" class="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">delete</span> Xóa tất cả
            </button>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24">
              <h3 class="font-heading font-bold text-xl mb-5">Tóm tắt đơn hàng</h3>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Tạm tính ({{ cartSvc.itemCount() }} sản phẩm)</span>
                  <span>{{ cartSvc.subtotal() | currencyVnd }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span [class.text-green-600]="cartSvc.subtotal() >= 500000">
                    {{ cartSvc.subtotal() >= 500000 ? 'Miễn phí' : (30000 | currencyVnd) }}
                  </span>
                </div>
                @if (cartSvc.subtotal() < 500000) {
                  <p class="text-xs text-muted bg-yellow-50 rounded p-2">
                    Mua thêm {{ (500000 - cartSvc.subtotal()) | currencyVnd }} để được miễn phí vận chuyển
                  </p>
                }
                <div class="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span class="text-primary">{{ totalAmount() | currencyVnd }}</span>
                </div>
              </div>

              <a routerLink="/thanh-toan" class="btn-primary w-full text-center mt-6 block">
                Tiến hành thanh toán
              </a>
              <a routerLink="/san-pham" class="btn-ghost w-full text-center mt-2 block text-sm text-gray-500">
                Tiếp tục mua sắm
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);

  ngOnInit(): void {
    if (!this.cartSvc.cart()) {
      this.cartSvc.load().subscribe();
    }
  }

  totalAmount(): number {
    const subtotal = this.cartSvc.subtotal();
    return subtotal + (subtotal >= 500000 ? 0 : 30000);
  }

  updateQty(itemId: string, qty: number): void {
    if (qty < 1) {
      this.removeItem(itemId);
      return;
    }
    this.cartSvc.updateItem(itemId, qty).subscribe({
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }

  removeItem(itemId: string): void {
    this.cartSvc.removeItem(itemId).subscribe({
      next: () => this.toastSvc.info('Đã xóa sản phẩm khỏi giỏ hàng'),
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }

  clearCart(): void {
    this.cartSvc.clear().subscribe({
      next: () => this.toastSvc.info('Đã xóa toàn bộ giỏ hàng'),
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }
}
