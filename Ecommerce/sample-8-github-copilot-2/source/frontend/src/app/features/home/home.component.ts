import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-gray-900 text-white overflow-hidden min-h-[560px] flex items-center">
      <div class="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4rNLXBR1iHBQ3EY-sMd5xNynRHnlNf24S_8xvjAR6LVFJHLkOyCp6hs_1OIzRVYqv2KY4gbSDBSFrK614VvdOOcVfxzJwAoT9n7TJnvz1iE8nGP29FMlaxzjfatfXRYPdGODYOt-FSTMLq-GqpCoWJKdSulVV62vHN9xqKiRBxqW_hg1CVrpP5aSXkLlLQx0MuRH6yPSEnqZnFHgRJJ0VNX8Sm3R-zNZkStQ9WicTz5aVFR33lpSBFqS6B4LObPBVAyRCnBHmpw"
        alt="Hero"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="container mx-auto px-4 max-w-7xl relative z-20 py-24">
        <div class="max-w-xl">
          <p class="text-primary-300 font-semibold text-sm uppercase tracking-widest mb-3">Editorial Exclusive</p>
          <h1 class="font-heading font-black text-5xl md:text-6xl leading-tight mb-4">
            Nâng Tầm<br>Phong Cách<br><span class="text-primary-300">Cá Nhân</span>
          </h1>
          <p class="text-gray-300 text-lg mb-8 max-w-sm">
            Khám phá bộ sưu tập độc quyền từ các thương hiệu hàng đầu thế giới
          </p>
          <div class="flex gap-4">
            <a routerLink="/san-pham" class="btn-primary text-base px-8 py-4">Mua sắm ngay</a>
            <a routerLink="/san-pham" [queryParams]="{sort:'popular'}" class="btn-ghost text-white border border-white/30 text-base px-8 py-4 rounded-card hover:bg-white/10">
              Xem xu hướng
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Grid -->
    <section class="py-16 bg-surface">
      <div class="container mx-auto px-4 max-w-7xl">
        <h2 class="section-title text-center">Mua sắm theo danh mục</h2>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
          @for (cat of categories; track cat.slug) {
            <a [routerLink]="['/san-pham']" [queryParams]="{category: cat.slug}"
              class="flex flex-col items-center gap-2 p-4 bg-white rounded-card shadow-card hover:shadow-card-hover cursor-pointer transition-all group">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span class="material-icons text-primary group-hover:text-white">{{ cat.icon }}</span>
              </div>
              <span class="text-xs font-medium text-gray-700 text-center">{{ cat.name }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Flash Sale -->
    @if (flashSaleProducts().length > 0) {
      <section class="py-16">
        <div class="container mx-auto px-4 max-w-7xl">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="material-icons text-primary text-3xl">flash_on</span>
              <h2 class="section-title mb-0">Flash Sale</h2>
            </div>
            <a routerLink="/san-pham" [queryParams]="{sort:'newest'}" class="text-sm text-primary font-medium hover:underline">Xem thêm →</a>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            @for (p of flashSaleProducts(); track p.id) {
              <app-product-card [product]="p" (addToCart)="addToCart(p)" />
            }
          </div>
        </div>
      </section>
    }

    <!-- Featured Products -->
    <section class="py-16 bg-surface">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title mb-0">Sản phẩm nổi bật</h2>
          <a routerLink="/san-pham" [queryParams]="{sort:'popular'}" class="text-sm text-primary font-medium hover:underline">Xem tất cả →</a>
        </div>
        @if (loading()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="card animate-pulse">
                <div class="aspect-square bg-gray-200"></div>
                <div class="p-4 space-y-2">
                  <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div class="h-4 bg-gray-200 rounded"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-8 bg-gray-200 rounded mt-2"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (p of featuredProducts(); track p.id) {
              <app-product-card [product]="p" (addToCart)="addToCart(p)" />
            }
          </div>
        }
      </div>
    </section>

    <!-- Promo banner -->
    <section class="py-8">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="bg-primary rounded-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-white text-center md:text-left">
            <h3 class="font-heading font-bold text-2xl mb-2">Miễn phí vận chuyển</h3>
            <p class="text-white/80">Cho đơn hàng từ <strong>500.000đ</strong> trên toàn quốc</p>
          </div>
          <a routerLink="/san-pham" class="bg-white text-primary font-semibold px-8 py-3 rounded-card hover:bg-gray-50 transition-colors whitespace-nowrap">
            Mua ngay
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  private authSvc = inject(AuthService);

  featuredProducts = signal<Product[]>([]);
  flashSaleProducts = signal<Product[]>([]);
  loading = signal(true);

  categories = [
    { name: 'Thời Trang', slug: 'thoi-trang', icon: 'checkroom' },
    { name: 'Điện Tử', slug: 'dien-tu', icon: 'devices' },
    { name: 'Làm Đẹp', slug: 'lam-dep', icon: 'auto_fix_high' },
    { name: 'Nhà Cửa', slug: 'nha-cua', icon: 'home' },
    { name: 'Thể Thao', slug: 'the-thao', icon: 'fitness_center' },
    { name: 'Sách', slug: 'sach', icon: 'menu_book' },
  ];

  ngOnInit(): void {
    this.productSvc.getFeatured().subscribe(res => {
      this.featuredProducts.set(res.products);
      this.loading.set(false);
    });
    this.productSvc.getFlashSale().subscribe(res => {
      this.flashSaleProducts.set(res.products);
    });
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
