import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Product, Pagination } from '../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="min-h-screen bg-surface">
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="container mx-auto px-4 max-w-7xl flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <a routerLink="/admin" class="font-heading font-black text-xl text-primary">The Editorial</a>
            <span class="text-gray-300">|</span>
            <span class="text-sm font-semibold text-gray-600">Quản lý sản phẩm</span>
          </div>
          <div class="flex gap-2">
            <a routerLink="/admin" class="btn-ghost text-sm py-1.5">← Dashboard</a>
            <a routerLink="/admin/don-hang" class="btn-ghost text-sm py-1.5">Đơn hàng</a>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 max-w-7xl py-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="font-heading font-black text-2xl">Sản phẩm</h1>
        </div>

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
                    <th class="px-4 py-3 font-medium">Sản phẩm</th>
                    <th class="px-4 py-3 font-medium">Danh mục</th>
                    <th class="px-4 py-3 font-medium">Giá</th>
                    <th class="px-4 py-3 font-medium">Kho</th>
                    <th class="px-4 py-3 font-medium">Trạng thái</th>
                    <th class="px-4 py-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (product of products(); track product.id) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <img [src]="product.imageUrl || 'assets/placeholder.png'" [alt]="product.name"
                            class="w-10 h-10 rounded object-cover bg-gray-100 flex-shrink-0" />
                          <span class="font-medium text-gray-900 line-clamp-2 max-w-48">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-600">{{ product.category?.name }}</td>
                      <td class="px-4 py-3 font-semibold text-primary">{{ product.price | currencyVnd }}</td>
                      <td class="px-4 py-3">
                        <span [class.text-red-600]="product.stock <= 5" [class.font-semibold]="product.stock <= 5">
                          {{ product.stock }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded text-xs font-medium"
                          [class.bg-green-100]="product.status === 'ACTIVE'"
                          [class.text-green-700]="product.status === 'ACTIVE'"
                          [class.bg-gray-100]="product.status === 'INACTIVE'"
                          [class.text-gray-500]="product.status === 'INACTIVE'">
                          {{ product.status === 'ACTIVE' ? 'Đang bán' : 'Ẩn' }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <button (click)="toggleStatus(product)"
                          class="text-xs px-3 py-1.5 border border-gray-200 rounded hover:border-primary hover:text-primary transition-colors">
                          {{ product.status === 'ACTIVE' ? 'Ẩn' : 'Hiện' }}
                        </button>
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
export class AdminProductsComponent implements OnInit {
  private http = inject(HttpClient);
  private toastSvc = inject(ToastService);

  products = signal<Product[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  currentPage = 1;

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.loading.set(true);
    this.http.get<{ products: Product[]; pagination: Pagination }>(
      `${environment.apiUrl}/admin/products?page=${page}`,
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.products.set(res.products);
        this.pagination.set(res.pagination);
        this.currentPage = page;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleStatus(product: Product): void {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.http.put(`${environment.apiUrl}/admin/products/${product.id}`,
      { status: newStatus }, { withCredentials: true }
    ).subscribe({
      next: () => {
        this.products.update(ps => ps.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
        this.toastSvc.success('Đã cập nhật trạng thái');
      },
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }
}
