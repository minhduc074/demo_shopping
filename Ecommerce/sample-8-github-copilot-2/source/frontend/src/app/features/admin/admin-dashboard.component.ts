import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CurrencyVndPipe],
  template: `
    <div class="min-h-screen bg-surface">
      <!-- Admin header -->
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="container mx-auto px-4 max-w-7xl flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <a routerLink="/" class="font-heading font-black text-xl text-primary">The Editorial</a>
            <span class="text-gray-300">|</span>
            <span class="text-sm font-semibold text-gray-600">Quản trị</span>
          </div>
          <nav class="flex items-center gap-1">
            <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Dashboard</a>
            <a routerLink="/admin/san-pham" routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Sản phẩm</a>
            <a routerLink="/admin/don-hang" routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Đơn hàng</a>
            <a routerLink="/admin/nguoi-dung" routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Người dùng</a>
          </nav>
        </div>
      </header>

      <main class="container mx-auto px-4 max-w-7xl py-8">
        <h1 class="font-heading font-black text-2xl mb-6">Tổng quan</h1>

        @if (loading()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            @for (i of [1,2,3,4]; track i) {
              <div class="card p-6 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div class="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            }
          </div>
        } @else if (stats()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            @for (stat of statCards(); track stat.label) {
              <div class="card p-6">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm text-muted">{{ stat.label }}</p>
                  <span class="material-symbols-outlined text-2xl" [class]="stat.iconClass">{{ stat.icon }}</span>
                </div>
                <p class="font-black text-2xl text-gray-900">{{ stat.value }}</p>
              </div>
            }
          </div>
        }

        <!-- Recent orders -->
        @if (recentOrders().length > 0) {
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-lg">Đơn hàng gần đây</h2>
              <a routerLink="/admin/don-hang" class="text-sm text-primary hover:underline">Xem tất cả</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-muted border-b border-gray-100">
                    <th class="pb-3 font-medium">Mã đơn</th>
                    <th class="pb-3 font-medium">Khách hàng</th>
                    <th class="pb-3 font-medium">Tổng tiền</th>
                    <th class="pb-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (order of recentOrders(); track order.id) {
                    <tr>
                      <td class="py-3 font-mono font-medium">{{ order.orderNumber }}</td>
                      <td class="py-3 text-gray-700">{{ order.user?.name }}</td>
                      <td class="py-3 font-semibold text-primary">{{ order.totalAmount | currencyVnd }}</td>
                      <td class="py-3">
                        <span class="text-xs px-2 py-0.5 rounded-full"
                          [class.bg-yellow-100]="order.status === 'PENDING'"
                          [class.text-yellow-700]="order.status === 'PENDING'"
                          [class.bg-blue-100]="order.status === 'CONFIRMED'"
                          [class.text-blue-700]="order.status === 'CONFIRMED'"
                          [class.bg-green-100]="order.status === 'DELIVERED'"
                          [class.text-green-700]="order.status === 'DELIVERED'">
                          {{ statusLabel(order.status) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<any[]>([]);

  statCards = () => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.totalRevenue), icon: 'payments', iconClass: 'text-green-500' },
      { label: 'Đơn hàng', value: s.totalOrders.toLocaleString(), icon: 'receipt_long', iconClass: 'text-blue-500' },
      { label: 'Khách hàng', value: s.totalUsers.toLocaleString(), icon: 'group', iconClass: 'text-purple-500' },
      { label: 'Sản phẩm', value: s.totalProducts.toLocaleString(), icon: 'inventory_2', iconClass: 'text-orange-500' },
    ];
  };

  ngOnInit(): void {
    this.http.get<{ stats: DashboardStats; recentOrders: any[] }>(
      `${environment.apiUrl}/admin/dashboard`,
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.stats.set(res.stats);
        this.recentOrders.set(res.recentOrders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(s: string): string {
    return { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }[s] ?? s;
  }
}
