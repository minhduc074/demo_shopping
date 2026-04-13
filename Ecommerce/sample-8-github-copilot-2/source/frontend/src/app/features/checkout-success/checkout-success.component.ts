import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Order } from '../../core/models';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="container mx-auto px-4 max-w-2xl py-16">
      <div class="card p-8 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-5xl text-green-500">check_circle</span>
        </div>

        <h1 class="font-heading font-black text-3xl text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p class="text-muted mb-6">Cảm ơn bạn đã mua hàng tại The Editorial</p>

        @if (order()) {
          <div class="bg-surface rounded-card p-6 text-left mb-6">
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-muted">Mã đơn hàng</span>
              <span class="font-bold font-mono text-gray-900">{{ order()!.orderNumber }}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-muted">Trạng thái</span>
              <span class="badge-sale">{{ statusLabel(order()!.status) }}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-muted">Phương thức thanh toán</span>
              <span class="text-sm font-medium">{{ order()!.payment?.method === 'COD' ? 'Thanh toán khi nhận' : 'Thẻ tín dụng' }}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-muted">Giao đến</span>
              <span class="text-sm font-medium text-right max-w-xs">{{ order()!.shippingAddress }}, {{ order()!.city }}</span>
            </div>
            <div class="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span class="font-semibold text-gray-900">Tổng cộng</span>
              <span class="font-black text-xl text-primary">{{ order()!.totalAmount | currencyVnd }}</span>
            </div>
          </div>

          <div class="bg-blue-50 rounded-card p-4 text-sm text-blue-700 text-left mb-6">
            <span class="material-symbols-outlined text-sm mr-1 align-middle">info</span>
            Chúng tôi sẽ liên hệ xác nhận đơn hàng qua số <strong>{{ order()!.recipientPhone }}</strong>
            trong vòng 30 phút.
          </div>
        }

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/don-hang" class="btn-primary px-8">Xem đơn hàng</a>
          <a routerLink="/san-pham" class="btn-outline px-8">Tiếp tục mua sắm</a>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutSuccessComponent implements OnInit {
  private orderSvc = inject(OrderService);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.orderSvc.getOrderById(orderId).subscribe({
        next: res => this.order.set(res.order),
      });
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] ?? status;
  }
}
