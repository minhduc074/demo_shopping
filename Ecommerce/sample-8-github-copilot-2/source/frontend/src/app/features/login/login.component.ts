import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="text-center mb-8">
            <a routerLink="/" class="font-heading font-black text-3xl text-primary">The Editorial</a>
            <h1 class="font-heading font-bold text-2xl text-gray-900 mt-4">Đăng nhập</h1>
            <p class="text-muted text-sm mt-1">Chào mừng bạn trở lại</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Email *</label>
                <input formControlName="email" type="email" class="input-field" placeholder="ban@example.com" autocomplete="email" />
                @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Vui lòng nhập email</p>
                }
                @if (form.get('email')?.errors?.['email'] && form.get('email')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Email không hợp lệ</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Mật khẩu *</label>
                <div class="relative">
                  <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" class="input-field pr-12"
                    placeholder="••••••••" autocomplete="current-password" />
                  <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-700 transition-colors">
                    <span class="material-symbols-outlined text-xl">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                @if (form.get('password')?.errors?.['required'] && form.get('password')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Vui lòng nhập mật khẩu</p>
                }
              </div>
            </div>

            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p class="text-red-700 text-sm">{{ errorMsg() }}</p>
              </div>
            }

            <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary w-full mt-6 py-3">
              @if (loading()) {
                <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 align-middle"></span>
                Đang đăng nhập...
              } @else {
                Đăng nhập
              }
            </button>
          </form>

          <p class="text-center text-sm text-muted mt-6">
            Chưa có tài khoản?
            <a routerLink="/dang-ky" class="text-primary font-medium hover:underline">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.cartSvc.load().subscribe();
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
        this.toastSvc.success('Đăng nhập thành công');
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
