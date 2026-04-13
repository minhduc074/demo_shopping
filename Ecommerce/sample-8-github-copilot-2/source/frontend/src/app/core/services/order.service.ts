import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CheckoutInput, CheckoutResult } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<{ orders: Order[] }> {
    return this.http.get<{ orders: Order[] }>(`${this.api}/orders`, { withCredentials: true });
  }

  getOrderById(id: string): Observable<{ order: Order }> {
    return this.http.get<{ order: Order }>(`${this.api}/orders/${id}`, { withCredentials: true });
  }

  checkout(input: CheckoutInput): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(`${this.api}/checkout`, input, { withCredentials: true });
  }
}
