import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="flex items-center justify-between h-16 gap-4">

          <!-- Logo -->
          <a routerLink="/" class="flex-shrink-0">
            <span class="font-heading font-black text-2xl text-primary tracking-tight">The Editorial</span>
          </a>

          <!-- Search bar -->
          <div class="flex-1 max-w-xl hidden md:block">
            <form (ngSubmit)="onSearch()" class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                name="search"
                placeholder="Tìm kiếm sản phẩm..."
                class="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-xl">search</span>
              </button>
            </form>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-2">
            <!-- Mobile search -->
            <button class="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <span class="material-symbols-outlined">search</span>
            </button>

            @if (auth.isLoggedIn()) {
              <!-- Cart -->
              <a routerLink="/gio-hang" class="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span class="material-symbols-outlined text-gray-700">shopping_cart</span>
                @if (cart.itemCount() > 0) {
                  <span class="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {{ cart.itemCount() > 9 ? '9+' : cart.itemCount() }}
                  </span>
                }
              </a>

              <!-- User menu -->
              <div class="relative" #userMenu>
                <button
                  (click)="userMenuOpen.set(!userMenuOpen())"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span class="material-symbols-outlined text-gray-700">account_circle</span>
                  <span class="text-sm font-medium text-gray-700 hidden md:block max-w-24 truncate">
                    {{ auth.user()?.name }}
                  </span>
                  <span class="material-symbols-outlined text-xs text-muted">expand_more</span>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-card shadow-card-hover border border-gray-100 py-1 z-50">
                    <a routerLink="/tai-khoan" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" (click)="userMenuOpen.set(false)">
                      <span class="material-symbols-outlined text-sm">person</span> Tài khoản
                    </a>
                    <a routerLink="/don-hang" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" (click)="userMenuOpen.set(false)">
                      <span class="material-symbols-outlined text-sm">receipt_long</span> Đơn hàng
                    </a>
                    @if (auth.isAdmin()) {
                      <hr class="border-gray-100 my-1">
                      <a routerLink="/admin" class="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors" (click)="userMenuOpen.set(false)">
                        <span class="material-symbols-outlined text-sm">admin_panel_settings</span> Quản trị
                      </a>
                    }
                    <hr class="border-gray-100 my-1">
                    <button (click)="onLogout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <span class="material-symbols-outlined text-sm">logout</span> Đăng xuất
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/dang-nhap" class="btn-outline py-2 px-4 text-sm">Đăng nhập</a>
              <a routerLink="/dang-ky" class="btn-primary py-2 px-4 text-sm hidden sm:block">Đăng ký</a>
            }
          </div>
        </div>

        <!-- Categories nav -->
        <nav class="flex items-center gap-6 pb-3 overflow-x-auto scrollbar-none">
          <a routerLink="/san-pham" routerLinkActive="text-primary font-semibold" [routerLinkActiveOptions]="{exact: true}"
            class="text-sm text-gray-600 hover:text-primary whitespace-nowrap transition-colors">Tất cả</a>
          @for (cat of categories; track cat.slug) {
            <a [routerLink]="['/san-pham']" [queryParams]="{category: cat.slug}" routerLinkActive="text-primary font-semibold"
              class="text-sm text-gray-600 hover:text-primary whitespace-nowrap transition-colors flex items-center gap-1">
              <span class="material-icons text-sm">{{ cat.icon }}</span>
              {{ cat.name }}
            </a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  searchQuery = '';
  userMenuOpen = signal(false);

  categories = [
    { name: 'Thời Trang', slug: 'thoi-trang', icon: 'checkroom' },
    { name: 'Điện Tử', slug: 'dien-tu', icon: 'devices' },
    { name: 'Làm Đẹp', slug: 'lam-dep', icon: 'auto_fix_high' },
    { name: 'Nhà Cửa', slug: 'nha-cua', icon: 'home' },
    { name: 'Thể Thao', slug: 'the-thao', icon: 'fitness_center' },
    { name: 'Sách', slug: 'sach', icon: 'menu_book' },
  ];

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/san-pham'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  onLogout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
    this.cart.reset();
  }
}
