import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, CurrencyVndPipe],
  template: `
    @if (loading()) {
      <div class="container mx-auto px-4 max-w-7xl py-16 flex justify-center">
        <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    } @else if (product()) {
      <div class="container mx-auto px-4 max-w-7xl py-8">
        <!-- Breadcrumb -->
        <nav class="text-sm text-muted mb-6 flex items-center gap-2">
          <a routerLink="/" class="hover:text-primary transition-colors">Trang chủ</a>
          <span>›</span>
          <a routerLink="/san-pham" class="hover:text-primary transition-colors">Sản phẩm</a>
          @if (product()!.category) {
            <span>›</span>
            <a [routerLink]="['/san-pham']" [queryParams]="{category: product()!.category!.slug}" class="hover:text-primary transition-colors">
              {{ product()!.category!.name }}
            </a>
          }
          <span>›</span>
          <span class="text-gray-700">{{ product()!.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Images -->
          <div>
            <div class="aspect-square bg-gray-100 rounded-card overflow-hidden mb-4">
              <img
                [src]="activeImage() || 'assets/placeholder.png'"
                [alt]="product()!.name"
                class="w-full h-full object-cover"
              />
            </div>
            @if (product()!.images && product()!.images!.length > 1) {
              <div class="grid grid-cols-5 gap-2">
                @for (img of product()!.images; track img.id) {
                  <button
                    (click)="activeImage.set(img.url)"
                    class="aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors"
                    [class.border-primary]="activeImage() === img.url"
                    [class.border-transparent]="activeImage() !== img.url"
                  >
                    <img [src]="img.url" [alt]="img.alt || product()!.name" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="flex flex-col">
            <p class="text-sm text-muted mb-1">{{ product()!.category?.name }}</p>
            <h1 class="font-heading font-black text-3xl text-gray-900 mb-4">{{ product()!.name }}</h1>

            <!-- Price -->
            <div class="flex items-center gap-3 mb-4">
              <span class="text-primary font-black text-4xl">{{ product()!.price | currencyVnd }}</span>
              @if (product()!.originalPrice && product()!.originalPrice! > product()!.price) {
                <span class="text-muted text-xl line-through">{{ product()!.originalPrice | currencyVnd }}</span>
                <span class="badge-sale text-base px-3 py-1">-{{ discountPercent() }}%</span>
              }
            </div>

            <!-- Stock status -->
            <div class="flex items-center gap-2 mb-6">
              @if (product()!.stock > 0) {
                <span class="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                <span class="text-sm text-green-700 font-medium">Còn hàng ({{ product()!.stock }} sản phẩm)</span>
              } @else {
                <span class="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                <span class="text-sm text-red-600 font-medium">Hết hàng</span>
              }
            </div>

            <!-- Quantity -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-sm font-medium text-gray-700">Số lượng:</span>
              <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button (click)="decreaseQty()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">−</button>
                <span class="w-12 text-center text-sm font-medium">{{ quantity() }}</span>
                <button (click)="increaseQty()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">+</button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mb-8">
              <button
                (click)="addToCart()"
                [disabled]="product()!.stock === 0"
                class="flex-1 btn-primary text-base py-4"
              >
                <span class="material-symbols-outlined align-middle mr-2">shopping_cart</span>
                Thêm vào giỏ
              </button>
              <button class="w-12 h-14 border border-gray-300 rounded-card flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <span class="material-symbols-outlined">favorite_border</span>
              </button>
            </div>

            <!-- Benefits -->
            <div class="border border-gray-100 rounded-card p-4 space-y-3">
              @for (benefit of benefits; track benefit.icon) {
                <div class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="material-symbols-outlined text-primary">{{ benefit.icon }}</span>
                  {{ benefit.text }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Description -->
        @if (product()!.description) {
          <div class="mt-12 border-t border-gray-100 pt-8">
            <h2 class="font-heading font-bold text-xl mb-4">Mô tả sản phẩm</h2>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ product()!.description }}</p>
          </div>
        }

        <!-- Related products -->
        @if (related().length > 0) {
          <div class="mt-12 border-t border-gray-100 pt-8">
            <h2 class="section-title">Sản phẩm liên quan</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
              @for (p of related(); track p.id) {
                <app-product-card [product]="p" (addToCart)="addRelatedToCart(p)" />
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="container mx-auto px-4 max-w-7xl py-24 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
        <h2 class="font-heading font-bold text-2xl mt-4 text-gray-600">Sản phẩm không tồn tại</h2>
        <a routerLink="/san-pham" class="btn-primary mt-6 inline-block">Quay lại cửa hàng</a>
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  private authSvc = inject(AuthService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  quantity = signal(1);
  activeImage = signal<string>('');

  benefits = [
    { icon: 'local_shipping', text: 'Miễn phí vận chuyển cho đơn từ 500.000đ' },
    { icon: 'assignment_return', text: 'Đổi trả trong vòng 30 ngày' },
    { icon: 'verified', text: 'Hàng chính hãng 100%' },
    { icon: 'support_agent', text: 'Hỗ trợ 24/7' },
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.quantity.set(1);
      this.productSvc.getBySlug(params['slug']).subscribe({
        next: res => {
          this.product.set(res.product);
          this.related.set(res.related);
          this.activeImage.set(res.product.imageUrl || (res.product.images?.[0]?.url ?? ''));
          this.loading.set(false);
        },
        error: () => {
          this.product.set(null);
          this.loading.set(false);
        },
      });
    });
  }

  discountPercent(): number {
    const p = this.product();
    if (!p?.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  increaseQty(): void {
    const p = this.product();
    if (p && this.quantity() < p.stock) this.quantity.update(q => q + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart(): void {
    if (!this.authSvc.isLoggedIn()) {
      this.toastSvc.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    const p = this.product();
    if (!p) return;
    this.cartSvc.addItem(p.id, this.quantity()).subscribe({
      next: () => this.toastSvc.success('Đã thêm vào giỏ hàng'),
      error: (err: Error) => this.toastSvc.error(err.message),
    });
  }

  addRelatedToCart(product: Product): void {
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
