import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Order } from '../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="container mx-auto px-4 max-w-5xl py-8">
      <h1 class="font-heading font-black text-3xl mb-8">Tài khoản của tôi</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
          <div class="card p-5">
            <div class="text-center mb-4">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="material-symbols-outlined text-3xl text-primary">account_circle</span>
              </div>
              <p class="font-semibold text-gray-900">{{ auth.user()?.name }}</p>
              <p class="text-sm text-muted">{{ auth.user()?.email }}</p>
            </div>
            <nav class="space-y-1">
              <button (click)="activeTab.set('profile')"
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                [class]="activeTab() === 'profile' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600'">
                Thông tin cá nhân
              </button>
              <button (click)="loadOrders()"
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                [class]="activeTab() === 'orders' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600'">
                Đơn hàng của tôi
              </button>
            </nav>
          </div>
        </aside>

        <!-- Content -->
        <main class="lg:col-span-3">
          @if (activeTab() === 'profile') {
            <div class="card p-6">
              <h2 class="font-semibold text-xl mb-5">Thông tin cá nhân</h2>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Họ và tên</label>
                    <input formControlName="name" type="text" class="input-field" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                    <input [value]="auth.user()?.email" type="email" class="input-field bg-gray-50" disabled />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Số điện thoại</label>
                    <input formControlName="phone" type="tel" class="input-field" placeholder="0901 234 567" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1.5 block">Địa chỉ mặc định</label>
                    <input formControlName="address" type="text" class="input-field" placeholder="123 Đường ABC, Phường XYZ, Quận 1" />
                  </div>
                </div>
                <button type="submit" [disabled]="saving()" class="btn-primary mt-6">
                  {{ saving() ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </form>
            </div>
          }

          @if (activeTab() === 'orders') {
            <div class="card p-6">
              <h2 class="font-semibold text-xl mb-5">Đơn hàng của tôi</h2>
              @if (ordersLoading()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              } @else if (orders().length === 0) {
                <div class="text-center py-12">
                  <span class="material-symbols-outlined text-5xl text-gray-200">receipt_long</span>
                  <p class="text-muted mt-3">Bạn chưa có đơn hàng nào</p>
                  <a routerLink="/san-pham" class="btn-primary mt-4 inline-block">Mua sắm ngay</a>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (order of orders(); track order.id) {
                    <div class="border border-gray-100 rounded-card p-4 hover:shadow-card transition-shadow">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <p class="font-bold font-mono text-sm">{{ order.orderNumber }}</p>
                          <p class="text-xs text-muted">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-bold text-primary">{{ order.totalAmount | currencyVnd }}</span>
                          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                            [class.bg-yellow-100]="order.status === 'PENDING'"
                            [class.text-yellow-700]="order.status === 'PENDING'"
                            [class.bg-blue-100]="order.status === 'CONFIRMED'"
                            [class.text-blue-700]="order.status === 'CONFIRMED'"
                            [class.bg-green-100]="order.status === 'DELIVERED'"
                            [class.text-green-700]="order.status === 'DELIVERED'"
                            [class.bg-red-100]="order.status === 'CANCELLED'"
                            [class.text-red-700]="order.status === 'CANCELLED'"
                            [class.bg-purple-100]="order.status === 'SHIPPING'"
                            [class.text-purple-700]="order.status === 'SHIPPING'">
                            {{ statusLabel(order.status) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2 flex-wrap">
                        @for (item of order.items.slice(0, 3); track item.id) {
                          <img [src]="item.productImage || 'assets/placeholder.png'" [alt]="item.productName"
                            class="w-12 h-12 object-cover rounded bg-gray-100" />
                        }
                        @if (order.items.length > 3) {
                          <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-muted">
                            +{{ order.items.length - 3 }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private orderSvc = inject(OrderService);
  private toastSvc = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<'profile' | 'orders'>('profile');
  orders = signal<Order[]>([]);
  ordersLoading = signal(false);
  saving = signal(false);

  profileForm = this.fb.group({
    name: [this.auth.user()?.name ?? ''],
    phone: [this.auth.user()?.phone ?? ''],
    address: [this.auth.user()?.address ?? ''],
  });

  ngOnInit(): void {}

  loadOrders(): void {
    this.activeTab.set('orders');
    if (this.orders().length > 0) return;
    this.ordersLoading.set(true);
    this.orderSvc.getOrders().subscribe({
      next: res => { this.orders.set(res.orders); this.ordersLoading.set(false); },
      error: () => this.ordersLoading.set(false),
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    const data = this.profileForm.getRawValue() as any;
    this.auth.updateProfile(data).subscribe({
      next: () => { this.toastSvc.success('Đã cập nhật thông tin'); this.saving.set(false); },
      error: (err: Error) => { this.toastSvc.error(err.message); this.saving.set(false); },
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
