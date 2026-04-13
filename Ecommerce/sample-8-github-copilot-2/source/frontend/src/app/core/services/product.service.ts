import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Category, ProductListResponse } from '../models';

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = `${environment.apiUrl}/products`;
  private readonly catApi = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  list(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ProductListResponse>(this.api, { params });
  }

  getFeatured(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.api}/featured`);
  }

  getFlashSale(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.api}/flash-sale`);
  }

  getBySlug(slug: string): Observable<{ product: Product; related: Product[] }> {
    return this.http.get<{ product: Product; related: Product[] }>(`${this.api}/${slug}`);
  }

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(this.catApi);
  }
}
