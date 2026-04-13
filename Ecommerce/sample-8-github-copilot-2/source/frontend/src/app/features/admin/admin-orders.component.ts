import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Order, Pagination } from '../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyVndPipe],
  template: `
    <div class="min-h-screen bg-surface">
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="container mx-auto px-4 max-w-7xl flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <a routerLink="/admin" class="font-heading font-black text-xl text-primary">The Editorial</a>
            <span class="text-gray-300">|</span>
            <span class="text-sm font-semibold text-gray-600">Quản lý đơn hàng</span>
          </div>
          <a routerLink="/admin" class="btn-ghost text-sm py-1.5">← Dashboard</a>
        </div>
      </header>

      <main class="container mx-auto px-4 max-w-7xl py-8">
        <h1 class="font-heading font-black text-2xl mb-6">Đơn hàng</h1>

        <div class="card overflow-hidden">
          @if (loading()) {
            <div class="flex justify-center py-16">
              <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr class="text-left text-muted">
                    <th class="px-4 py-3 font-medium">Mã đơn</th>
                    <th class="px-4 py-3 font-medium">Khách hàng</th>
                    <th class="px-4 py-3 font-medium">Tổng tiền</th>
                    <th class="px-4 py-3 font-medium">Thanh toán</th>
                    <th class="px-4 py-3 font-medium">Ngày đặt</th>
                    <th class="px-4 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (order of orders(); track order.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-4 py-3 font-mono font-medium">{{ order.orderNumber }}</td>
                      <td class="px-4 py-3">
                        <p class="font-medium text-gray-900">{{ order.user?.name }}</p>
                        <p class="text-xs text-muted">{{ order.user?.email }}</p>
                      </td>
                      <td class="px-4 py-3 font-bold text-primary">{{ order.totalAmount | currencyVnd }}</td>
                      <td class="px-4 py-3 text-gray-600">
                        {{ order.payment?.method === 'COD' ? 'COD' : 'Thẻ' }}
                      </td>
                      <td class="px-4 py-3 text-gray-600">{{ order.createdAt | date:'dd/MM/yy' }}</td>
                      <td class="px-4 py-3">
                        <select
                          [value]="order.status"
                          (change)="updateStatus(order.id, $any($event.target).value)"
                          class="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-primary"
                        >
                          <option value="PENDING">Chờ xác nhận</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="DELIVERED">Đã giao</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (pagination() && pagination()!.totalPages > 1) {
              <div class="flex justify-center items-center gap-2 px-4 py-4 border-t border-gray-100">
                <button (click)="loadPage(pagination()!.page - 1)" [disabled]="pagination()!.page === 1"
                  class="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40">‹</button>
                <span class="text-sm text-muted">Trang {{ pagination()!.page }} / {{ pagination()!.totalPages }}</span>
                <button (click)="loadPage(pagination()!.page + 1)" [disabled]="pagination()!.page === pagination()!.totalPages"
                  class="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40">›</button>
              </div>
            }
          }
        </div>
      </main>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private http = inject(HttpClient);
  private toastSvc = inject(ToastService);

  orders = signal<(Order & { user?: { name: string; email: string } })[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.loading.set(true);
    this.http.get<{ orders: any[]; pagination: Pagination }>(
      `${environment.apiUrl}/admin/orders?page=${page}`,
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.orders.set(res.orders);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(orderId: string, status: string): void {
    this.http.put(`${environment.apiUrl}/admin/orders/${orderId}/status`,
      { status }, { withCredentials: true }
    ).subscribe({
      next: () => {
        this.orders.update(os => os.map(o => o.id === orderId ? { ...o, status: status as any } : o));
        this.toastSvc.success('Cập nhật trạng thái thành công');
      },
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }
}
