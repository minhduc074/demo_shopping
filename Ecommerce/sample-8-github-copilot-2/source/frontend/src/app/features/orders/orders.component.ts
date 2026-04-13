import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Order } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="container mx-auto px-4 max-w-4xl py-8">
      <h1 class="font-heading font-black text-3xl mb-8">Đơn hàng của tôi</h1>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="card text-center py-16">
          <span class="material-symbols-outlined text-7xl text-gray-200">receipt_long</span>
          <h3 class="font-semibold text-xl text-gray-500 mt-4">Chưa có đơn hàng nào</h3>
          <a routerLink="/san-pham" class="btn-primary mt-6 inline-block">Bắt đầu mua sắm</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="card p-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p class="font-bold font-mono">{{ order.orderNumber }}</p>
                  <p class="text-sm text-muted">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-base font-black text-primary">{{ order.totalAmount | currencyVnd }}</span>
                  <span class="text-sm px-3 py-1 rounded-full font-semibold"
                    [class.bg-yellow-100]="order.status === 'PENDING'"
                    [class.text-yellow-700]="order.status === 'PENDING'"
                    [class.bg-blue-100]="order.status === 'CONFIRMED'"
                    [class.text-blue-700]="order.status === 'CONFIRMED'"
                    [class.bg-purple-100]="order.status === 'SHIPPING'"
                    [class.text-purple-700]="order.status === 'SHIPPING'"
                    [class.bg-green-100]="order.status === 'DELIVERED'"
                    [class.text-green-700]="order.status === 'DELIVERED'"
                    [class.bg-red-100]="order.status === 'CANCELLED'"
                    [class.text-red-700]="order.status === 'CANCELLED'">
                    {{ statusLabel(order.status) }}
                  </span>
                </div>
              </div>

              <!-- Items -->
              <div class="flex gap-3 flex-wrap">
                @for (item of order.items; track item.id) {
                  <div class="flex items-center gap-2">
                    <img [src]="item.productImage || 'assets/placeholder.png'" [alt]="item.productName"
                      class="w-14 h-14 rounded object-cover bg-gray-100" />
                    <div>
                      <p class="text-sm font-medium line-clamp-1 max-w-32">{{ item.productName }}</p>
                      <p class="text-xs text-muted">x{{ item.quantity }}</p>
                    </div>
                  </div>
                }
              </div>

              <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p class="text-sm text-muted">
                  <span class="material-symbols-outlined text-sm align-middle">{{ order.payment?.method === 'COD' ? 'payments' : 'credit_card' }}</span>
                  {{ order.payment?.method === 'COD' ? 'Thanh toán khi nhận' : 'Thẻ tín dụng' }}
                </p>
                <p class="text-sm text-gray-600">Giao đến: <strong>{{ order.city }}</strong></p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private orderSvc = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.orderSvc.getOrders().subscribe({
      next: res => { this.orders.set(res.orders); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy',
    };
    return m[status] ?? status;
  }
}
