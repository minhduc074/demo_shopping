import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'The Editorial - Trang chủ',
  },
  {
    path: 'san-pham',
    loadComponent: () => import('./features/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'The Editorial - Sản phẩm',
  },
  {
    path: 'san-pham/:slug',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'dang-nhap',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Đăng nhập',
  },
  {
    path: 'dang-ky',
    loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Đăng ký tài khoản',
  },
  {
    path: 'gio-hang',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard],
    title: 'Giỏ hàng',
  },
  {
    path: 'thanh-toan',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Thanh toán',
  },
  {
    path: 'dat-hang-thanh-cong',
    loadComponent: () => import('./features/checkout-success/checkout-success.component').then(m => m.CheckoutSuccessComponent),
    canActivate: [authGuard],
    title: 'Đặt hàng thành công',
  },
  {
    path: 'tai-khoan',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Tài khoản của tôi',
  },
  {
    path: 'don-hang',
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard],
    title: 'Đơn hàng của tôi',
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin - Dashboard',
      },
      {
        path: 'san-pham',
        loadComponent: () => import('./features/admin/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Admin - Sản phẩm',
      },
      {
        path: 'don-hang',
        loadComponent: () => import('./features/admin/admin-orders.component').then(m => m.AdminOrdersComponent),
        title: 'Admin - Đơn hàng',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
