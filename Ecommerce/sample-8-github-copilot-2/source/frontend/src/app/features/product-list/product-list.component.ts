import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, ProductFilters } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product, Pagination } from '../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 max-w-7xl py-8">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Sidebar filters -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="card p-5 sticky top-24">
            <h3 class="font-semibold text-gray-900 mb-4">Bộ lọc</h3>

            <!-- Category -->
            <div class="mb-5">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Danh mục</h4>
              <ul class="space-y-1.5">
                <li>
                  <button (click)="setCategory('')"
                    class="text-sm w-full text-left px-2 py-1 rounded transition-colors"
                    [class.text-primary]="!filters.category"
                    [class.font-semibold]="!filters.category"
                    [class.text-gray-600]="filters.category">
                    Tất cả
                  </button>
                </li>
                @for (cat of categories; track cat.slug) {
                  <li>
                    <button (click)="setCategory(cat.slug)"
                      class="text-sm w-full text-left px-2 py-1 rounded transition-colors"
                      [class.text-primary]="filters.category === cat.slug"
                      [class.font-semibold]="filters.category === cat.slug"
                      [class.text-gray-600]="filters.category !== cat.slug">
                      {{ cat.name }}
                    </button>
                  </li>
                }
              </ul>
            </div>

            <!-- Price range -->
            <div class="mb-5">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Khoảng giá</h4>
              <div class="space-y-2">
                <input
                  type="number"
                  [(ngModel)]="minPriceInput"
                  (change)="applyPrice()"
                  placeholder="Giá tối thiểu"
                  class="input-field text-sm py-2"
                />
                <input
                  type="number"
                  [(ngModel)]="maxPriceInput"
                  (change)="applyPrice()"
                  placeholder="Giá tối đa"
                  class="input-field text-sm py-2"
                />
              </div>
            </div>

            <button (click)="resetFilters()" class="btn-ghost w-full text-sm py-2 text-gray-500">
              Xóa bộ lọc
            </button>
          </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1">
          <!-- Search & Sort bar -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 class="font-heading font-bold text-2xl text-gray-900">
                {{ filters.q ? 'Kết quả: "' + filters.q + '"' : (activeCategoryName || 'Tất cả sản phẩm') }}
              </h1>
              @if (pagination()) {
                <p class="text-sm text-muted mt-1">{{ pagination()!.total }} sản phẩm</p>
              }
            </div>

            <select [(ngModel)]="filters.sort" (change)="applySort()" class="input-field w-auto text-sm py-2">
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

          <!-- Products grid -->
          @if (loading()) {
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="card animate-pulse">
                  <div class="aspect-square bg-gray-200"></div>
                  <div class="p-4 space-y-2">
                    <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-4 bg-gray-200 rounded"></div>
                    <div class="h-8 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="text-center py-24">
              <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
              <h3 class="font-semibold text-gray-600 mt-4 text-xl">Không tìm thấy sản phẩm</h3>
              <p class="text-muted mt-2">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button (click)="resetFilters()" class="btn-primary mt-6">Xóa bộ lọc</button>
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p" (addToCart)="addToCart(p)" />
              }
            </div>

            <!-- Pagination -->
            @if (pagination() && pagination()!.totalPages > 1) {
              <div class="flex justify-center items-center gap-2 mt-8">
                <button (click)="goToPage(pagination()!.page - 1)"
                  [disabled]="pagination()!.page === 1"
                  class="btn-ghost px-3 py-2 disabled:opacity-40">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                @for (page of getPages(); track page) {
                  <button (click)="goToPage(page)"
                    class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                    [class.bg-primary]="page === pagination()!.page"
                    [class.text-white]="page === pagination()!.page"
                    [class.text-gray-600]="page !== pagination()!.page"
                    [class.hover:bg-gray-100]="page !== pagination()!.page">
                    {{ page }}
                  </button>
                }
                <button (click)="goToPage(pagination()!.page + 1)"
                  [disabled]="pagination()!.page === pagination()!.totalPages"
                  class="btn-ghost px-3 py-2 disabled:opacity-40">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  private authSvc = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  products = signal<Product[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);

  filters: ProductFilters = { sort: 'newest', page: 1 };
  minPriceInput?: number;
  maxPriceInput?: number;

  categories = [
    { name: 'Thời Trang', slug: 'thoi-trang' },
    { name: 'Điện Tử', slug: 'dien-tu' },
    { name: 'Làm Đẹp', slug: 'lam-dep' },
    { name: 'Nhà Cửa', slug: 'nha-cua' },
    { name: 'Thể Thao', slug: 'the-thao' },
    { name: 'Sách', slug: 'sach' },
  ];

  get activeCategoryName(): string {
    return this.categories.find(c => c.slug === this.filters.category)?.name ?? '';
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.filters = {
        q: params['q'],
        category: params['category'],
        sort: params['sort'] || 'newest',
        page: params['page'] ? Number(params['page']) : 1,
        minPrice: params['minPrice'] ? Number(params['minPrice']) : undefined,
        maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : undefined,
      };
      this.minPriceInput = this.filters.minPrice;
      this.maxPriceInput = this.filters.maxPrice;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.productSvc.list(this.filters).subscribe({
      next: res => {
        this.products.set(res.products);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateUrl(): void {
    const params: Record<string, string | number> = {};
    if (this.filters.q) params['q'] = this.filters.q;
    if (this.filters.category) params['category'] = this.filters.category;
    if (this.filters.sort && this.filters.sort !== 'newest') params['sort'] = this.filters.sort;
    if (this.filters.page && this.filters.page > 1) params['page'] = this.filters.page;
    if (this.filters.minPrice) params['minPrice'] = this.filters.minPrice;
    if (this.filters.maxPrice) params['maxPrice'] = this.filters.maxPrice;
    this.router.navigate([], { queryParams: params });
  }

  setCategory(slug: string): void {
    this.filters.category = slug || undefined;
    this.filters.page = 1;
    this.updateUrl();
  }

  applySort(): void {
    this.filters.page = 1;
    this.updateUrl();
  }

  applyPrice(): void {
    this.filters.minPrice = this.minPriceInput || undefined;
    this.filters.maxPrice = this.maxPriceInput || undefined;
    this.filters.page = 1;
    this.updateUrl();
  }

  resetFilters(): void {
    this.filters = { sort: 'newest', page: 1 };
    this.minPriceInput = undefined;
    this.maxPriceInput = undefined;
    this.updateUrl();
  }

  goToPage(page: number): void {
    const p = this.pagination();
    if (!p || page < 1 || page > p.totalPages) return;
    this.filters.page = page;
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    const p = this.pagination();
    if (!p) return [];
    const start = Math.max(1, p.page - 2);
    const end = Math.min(p.totalPages, p.page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  addToCart(product: Product): void {
    if (!this.authSvc.isLoggedIn()) {
      this.toastSvc.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    this.cartSvc.addItem(product.id).subscribe({
      next: () => this.toastSvc.success('Đã thêm vào giỏ hàng'),
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }
}
