import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = `${environment.apiUrl}/cart`;
  private _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.itemCount ?? 0);
  readonly subtotal = computed(() => this._cart()?.subtotal ?? 0);

  constructor(private http: HttpClient) {}

  load(): Observable<{ cart: Cart }> {
    return this.http.get<{ cart: Cart }>(this.api, { withCredentials: true }).pipe(
      tap(res => this._setCart(res.cart))
    );
  }

  addItem(productId: string, quantity = 1): Observable<{ cart: Cart }> {
    return this.http.post<{ cart: Cart }>(`${this.api}/items`, { productId, quantity }, { withCredentials: true }).pipe(
      tap(res => this._setCart(res.cart))
    );
  }

  updateItem(itemId: string, quantity: number): Observable<{ cart: Cart }> {
    return this.http.put<{ cart: Cart }>(`${this.api}/items/${itemId}`, { quantity }, { withCredentials: true }).pipe(
      tap(res => this._setCart(res.cart))
    );
  }

  removeItem(itemId: string): Observable<{ cart: Cart }> {
    return this.http.delete<{ cart: Cart }>(`${this.api}/items/${itemId}`, { withCredentials: true }).pipe(
      tap(res => this._setCart(res.cart))
    );
  }

  clear(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.api, { withCredentials: true }).pipe(
      tap(() => this._cart.set(null))
    );
  }

  reset(): void {
    this._cart.set(null);
  }

  private _setCart(cart: Cart): void {
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    this._cart.set({ ...cart, itemCount, subtotal });
  }
}
