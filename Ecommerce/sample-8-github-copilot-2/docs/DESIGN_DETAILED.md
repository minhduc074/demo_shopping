# Thiết Kế Chi Tiết — The Editorial Marketplace

## 1. Cấu Trúc Thư Mục

```
sample-8-github-copilot-2/
├── demo/
│   └── README.md
├── docs/
│   ├── DESIGN_BASIC.md
│   ├── DESIGN_DETAILED.md           ← file này
│   └── ARCHITECTURE.md
├── slide/
│   └── README.md
└── source/
    ├── stitch/
    │   ├── download-stitch.ts       # Script tải design assets từ Stitch
    │   └── screens.json             # Manifest các màn hình Stitch
    ├── backend/
    │   ├── api/
    │   │   └── index.ts             # Vercel entry point (exports Express app)
    │   ├── prisma/
    │   │   ├── schema.prisma        # Database schema
    │   │   └── seed.ts              # Dữ liệu mẫu
    │   ├── src/
    │   │   ├── lib/
    │   │   │   ├── prisma.ts        # Prisma singleton
    │   │   │   ├── jwt.ts           # JWT sign/verify
    │   │   │   └── password.ts      # bcrypt helpers
    │   │   ├── middleware/
    │   │   │   ├── auth.ts          # JWT cookie → req.user
    │   │   │   ├── admin.ts         # Require ADMIN role
    │   │   │   └── error.ts         # Global error handler
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   ├── product.service.ts
    │   │   │   ├── cart.service.ts
    │   │   │   ├── order.service.ts
    │   │   │   └── stripe.service.ts
    │   │   └── routes/
    │   │       ├── auth.routes.ts
    │   │       ├── product.routes.ts
    │   │       ├── category.routes.ts
    │   │       ├── cart.routes.ts
    │   │       ├── order.routes.ts
    │   │       ├── checkout.routes.ts
    │   │       ├── webhook.routes.ts
    │   │       └── admin.routes.ts
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── vercel.json
    └── frontend/
        ├── src/
        │   ├── app/
        │   │   ├── core/
        │   │   │   ├── models/          # TypeScript interfaces
        │   │   │   ├── services/        # AuthService, CartService, ProductService, OrderService
        │   │   │   ├── guards/          # authGuard, adminGuard
        │   │   │   └── interceptors/    # credentialsInterceptor, errorInterceptor
        │   │   ├── shared/
        │   │   │   ├── header/
        │   │   │   ├── footer/
        │   │   │   ├── product-card/
        │   │   │   ├── loading-spinner/
        │   │   │   ├── toast/
        │   │   │   └── pipes/           # currency-vnd.pipe.ts
        │   │   ├── features/
        │   │   │   ├── home/
        │   │   │   ├── product-list/
        │   │   │   ├── product-detail/
        │   │   │   ├── cart/
        │   │   │   ├── checkout/
        │   │   │   ├── checkout-success/
        │   │   │   ├── login/
        │   │   │   ├── register/
        │   │   │   ├── profile/
        │   │   │   ├── admin-dashboard/
        │   │   │   ├── admin-products/
        │   │   │   └── admin-orders/
        │   │   ├── app.component.ts
        │   │   ├── app.routes.ts
        │   │   └── app.config.ts
        │   ├── environments/
        │   │   ├── environment.ts
        │   │   └── environment.prod.ts
        │   ├── styles.scss
        │   └── index.html
        ├── angular.json
        ├── tailwind.config.js
        ├── package.json
        ├── tsconfig.json
        └── vercel.json
```

---

## 2. Database Schema (PostgreSQL + Prisma)

```prisma
enum UserRole    { CUSTOMER  ADMIN }
enum ProductStatus { ACTIVE INACTIVE DRAFT }
enum OrderStatus { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED }
enum PaymentMethod { COD STRIPE }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
```

### Bảng: User
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| email | String | unique |
| phone | String? | |
| fullName | String | |
| passwordHash | String | |
| role | UserRole | default CUSTOMER |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| cart | Cart? | 1:1 |
| orders | Order[] | 1:N |

### Bảng: Category
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| name | String | VD: "Thời Trang" |
| slug | String | unique |
| icon | String | Material icon name |
| products | Product[] | 1:N |

### Bảng: Product
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| categoryId | String | FK Category |
| name | String | |
| slug | String | unique |
| description | String? | |
| price | Int | VNĐ (nguyên) |
| originalPrice | Int? | Giá gốc để tính % giảm |
| inventoryCount | Int | default 0 |
| soldCount | Int | default 0 |
| imageUrl | String? | Ảnh chính |
| status | ProductStatus | default ACTIVE |
| images | ProductImage[] | 1:N |
| cartItems | CartItem[] | 1:N |
| orderItems | OrderItem[] | 1:N |
| createdAt | DateTime | |

### Bảng: ProductImage
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| productId | String | FK Product |
| url | String | |
| alt | String? | |
| sortOrder | Int | default 0 |

### Bảng: Cart
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | unique, FK User |
| items | CartItem[] | 1:N |
| updatedAt | DateTime | |

### Bảng: CartItem
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| cartId | String | FK Cart |
| productId | String | FK Product |
| quantity | Int | |
| @@unique([cartId, productId]) | | |

### Bảng: Order
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK User |
| orderNumber | String | unique, generated |
| status | OrderStatus | default PENDING |
| paymentMethod | PaymentMethod | |
| recipientName | String | |
| recipientPhone | String | |
| shippingAddress | String | |
| subtotal | Int | VNĐ |
| shippingFee | Int | default 30000 |
| totalAmount | Int | subtotal + shippingFee |
| stripeSessionId | String? | |
| items | OrderItem[] | 1:N |
| payment | Payment? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Bảng: OrderItem
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| orderId | String | FK Order |
| productId | String | FK Product |
| productName | String | snapshot |
| productImage | String? | snapshot |
| unitPrice | Int | snapshot |
| quantity | Int | |
| totalPrice | Int | unitPrice × quantity |

### Bảng: Payment
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | String (cuid) | PK |
| orderId | String | unique, FK Order |
| method | PaymentMethod | |
| status | PaymentStatus | default PENDING |
| stripeSessionId | String? | |
| stripePaymentIntentId | String? | |
| paidAt | DateTime? | |

---

## 3. API Endpoints

### Auth — `/api/auth`
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/register` | Đăng ký tài khoản | — |
| POST | `/login` | Đăng nhập → set JWT cookie | — |
| POST | `/logout` | Xóa JWT cookie | — |
| GET | `/me` | Lấy thông tin user hiện tại | ✓ |
| PUT | `/me` | Cập nhật hồ sơ | ✓ |

### Products — `/api/products`
| Method | Path | Mô tả | Query Params |
|---|---|---|---|
| GET | `/` | Danh sách sản phẩm | `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/:slug` | Chi tiết sản phẩm | — |

### Categories — `/api/categories`
| Method | Path | Mô tả |
|---|---|---|
| GET | `/` | Tất cả danh mục |

### Cart — `/api/cart`
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Lấy giỏ hàng hiện tại | ✓ |
| DELETE | `/` | Xóa toàn bộ giỏ hàng | ✓ |
| POST | `/items` | Thêm sản phẩm vào giỏ | ✓ |
| PUT | `/items/:itemId` | Cập nhật số lượng | ✓ |
| DELETE | `/items/:itemId` | Xóa sản phẩm khỏi giỏ | ✓ |

### Orders — `/api/orders`
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Lịch sử đơn hàng của user | ✓ |
| GET | `/:id` | Chi tiết đơn hàng | ✓ |

### Checkout — `/api/checkout`
| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/` | Tạo đơn hàng (COD hoặc Stripe) | ✓ |

**COD Flow:** Tạo Order (CONFIRMED) + Payment (PAID) ngay lập tức → trả về `{ orderId }`.

**Stripe Flow:** Tạo Order (PENDING) → Tạo Stripe Checkout Session → trả về `{ sessionUrl }` → redirect → webhook xác nhận.

### Webhooks
| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/webhooks/stripe` | Nhận sự kiện từ Stripe, xác thực HMAC |

### Admin — `/api/admin` (yêu cầu role ADMIN)
| Method | Path | Mô tả |
|---|---|---|
| GET | `/dashboard` | KPI stats (revenue, orders, users, products) |
| GET | `/products` | Danh sách sản phẩm (kèm filter + pagination) |
| POST | `/products` | Tạo sản phẩm mới |
| PUT | `/products/:id` | Cập nhật sản phẩm |
| DELETE | `/products/:id` | Xóa sản phẩm |
| GET | `/orders` | Tất cả đơn hàng |
| PUT | `/orders/:id/status` | Cập nhật trạng thái đơn hàng |
| GET | `/users` | Danh sách người dùng |

---

## 4. Angular Component Tree

```
AppComponent
├── HeaderComponent (shared)              # glassmorphism nav, cart badge, user dropdown
├── FooterComponent (shared)              # links, newsletter
├── ToastComponent (shared)               # global notifications
└── RouterOutlet
    ├── HomeComponent (lazy)              # /
    │   ├── HeroBannerComponent
    │   ├── FlashSaleComponent
    │   ├── CategoryGridComponent
    │   └── ProductGridComponent
    ├── ProductListComponent (lazy)       # /san-pham
    │   ├── SearchBarComponent
    │   ├── FilterSidebarComponent
    │   ├── ProductGridComponent (shared)
    │   └── PaginationComponent
    ├── ProductDetailComponent (lazy)     # /san-pham/:slug
    │   ├── ImageGalleryComponent
    │   ├── ProductInfoComponent
    │   └── RelatedProductsComponent
    ├── CartComponent (lazy, guarded)     # /gio-hang
    ├── CheckoutComponent (lazy, guarded) # /thanh-toan
    ├── CheckoutSuccessComponent (lazy)   # /don-hang-thanh-cong
    ├── LoginComponent (lazy)             # /dang-nhap
    ├── RegisterComponent (lazy)          # /dang-ky
    ├── ProfileComponent (lazy, guarded)  # /ho-so
    ├── AdminDashboardComponent (lazy, admin-guarded) # /admin
    ├── AdminProductsComponent (lazy, admin-guarded)  # /admin/san-pham
    └── AdminOrdersComponent (lazy, admin-guarded)    # /admin/don-hang
```

---

## 5. Services & State Management

Sử dụng Angular **Signals** + **RxJS HttpClient** — không có global store phức tạp.

### AuthService
```typescript
currentUser = signal<User | null>(null);
isLoggedIn = computed(() => !!this.currentUser());
isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

login(email, password): Observable<User>
register(data): Observable<User>
logout(): Observable<void>
loadCurrentUser(): Observable<User>
```

### CartService
```typescript
cart = signal<Cart | null>(null);
cartCount = computed(() => cart()?.items.reduce((s,i) => s+i.quantity, 0) ?? 0);
cartTotal = computed(() => ...) ;

loadCart(): Observable<Cart>
addItem(productId, quantity): Observable<Cart>
updateItem(itemId, quantity): Observable<Cart>
removeItem(itemId): Observable<Cart>
clearCart(): Observable<void>
```

### ProductService
```typescript
getProducts(params): Observable<ProductListResponse>
getProductBySlug(slug): Observable<Product>
getCategories(): Observable<Category[]>
```

### OrderService
```typescript
getOrders(): Observable<Order[]>
getOrderById(id): Observable<Order>
```

---

## 6. Guards & Interceptors

### `authGuard`
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/dang-nhap']);
};
```

### `adminGuard`
```typescript
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/']);
};
```

### `credentialsInterceptor`
Tự động thêm `withCredentials: true` cho tất cả request HTTP (để gửi JWT cookie).

### `errorInterceptor`
- 401 → gọi `AuthService.logout()`, redirect `/dang-nhap`
- 403 → redirect `/`
- Hiện toast thông báo lỗi

---

## 7. Routing

```typescript
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'san-pham', loadComponent: () => import('./features/product-list/...') },
  { path: 'san-pham/:slug', loadComponent: () => import('./features/product-detail/...') },
  { path: 'gio-hang', loadComponent: () => ..., canActivate: [authGuard] },
  { path: 'thanh-toan', loadComponent: () => ..., canActivate: [authGuard] },
  { path: 'don-hang-thanh-cong', loadComponent: () => ... },
  { path: 'dang-nhap', loadComponent: () => ... },
  { path: 'dang-ky', loadComponent: () => ... },
  { path: 'ho-so', loadComponent: () => ..., canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => ..., canActivate: [adminGuard] },
  { path: 'admin/san-pham', loadComponent: () => ..., canActivate: [adminGuard] },
  { path: 'admin/don-hang', loadComponent: () => ..., canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
```

---

## 8. Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/editorial_db"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:4200"
PORT=3001
```

### Frontend (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

### Frontend Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.vercel.app/api',
};
```

---

## 9. Seed Data

6 danh mục × 5 sản phẩm = 30 sản phẩm mẫu từ ảnh lh3.googleusercontent.com/aida-public.

Tài khoản mặc định:
- Admin: `admin@editorial.vn` / `Admin@123`
- Customer: `khach@editorial.vn` / `Khach@123`
