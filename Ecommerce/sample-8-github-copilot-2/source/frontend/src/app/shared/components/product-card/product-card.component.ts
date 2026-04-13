import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyVndPipe],
  template: `
    <div class="card group cursor-pointer hover:shadow-card-hover transition-shadow duration-300">
      <a [routerLink]="['/san-pham', product.slug]" class="block relative overflow-hidden">
        <div class="aspect-square bg-gray-100 overflow-hidden">
          <img
            [src]="product.imageUrl || 'assets/placeholder.png'"
            [alt]="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div class="absolute top-2 left-2 flex flex-col gap-1">
          @if (discountPercent > 0) {
            <span class="badge-sale">-{{ discountPercent }}%</span>
          }
          @if (product.isFlashSale) {
            <span class="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">Flash Sale</span>
          }
        </div>
      </a>

      <div class="p-4">
        <a [routerLink]="['/san-pham', product.slug]">
          <p class="text-xs text-muted mb-1">{{ product.category?.name }}</p>
          <h3 class="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">
            {{ product.name }}
          </h3>
        </a>

        <div class="flex items-center gap-2 mb-3">
          <span class="text-primary font-bold text-base">{{ product.price | currencyVnd }}</span>
          @if (product.originalPrice && product.originalPrice > product.price) {
            <span class="text-muted text-xs line-through">{{ product.originalPrice | currencyVnd }}</span>
          }
        </div>

        <button
          (click)="onAddToCart($event)"
          class="w-full btn-primary text-sm py-2"
          [disabled]="product.stock === 0"
        >
          {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
        </button>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  get discountPercent(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.price) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  onAddToCart(event: MouseEvent): void {
    event.preventDefault();
    this.addToCart.emit(this.product);
  }
}
