import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

function passwordMatch(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="text-center mb-8">
            <a routerLink="/" class="font-heading font-black text-3xl text-primary">The Editorial</a>
            <h1 class="font-heading font-bold text-2xl text-gray-900 mt-4">Đăng ký tài khoản</h1>
            <p class="text-muted text-sm mt-1">Tham gia cộng đồng The Editorial</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Họ và tên *</label>
                <input formControlName="name" type="text" class="input-field" placeholder="Nguyễn Văn A" autocomplete="name" />
                @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Vui lòng nhập họ tên</p>
                }
              </div>

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
                  <input formControlName="password" [type]="showPw() ? 'text' : 'password'" class="input-field pr-12"
                    placeholder="Tối thiểu 8 ký tự" autocomplete="new-password" />
                  <button type="button" (click)="showPw.set(!showPw())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    <span class="material-symbols-outlined text-xl">{{ showPw() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                @if (form.get('password')?.errors?.['minlength'] && form.get('password')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Mật khẩu tối thiểu 8 ký tự</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Xác nhận mật khẩu *</label>
                <input formControlName="confirmPassword" type="password" class="input-field" placeholder="••••••••" autocomplete="new-password" />
                @if (form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
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
                Đang đăng ký...
              } @else {
                Tạo tài khoản
              }
            </button>
          </form>

          <p class="text-center text-sm text-muted mt-6">
            Đã có tài khoản?
            <a routerLink="/dang-nhap" class="text-primary font-medium hover:underline">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMsg = signal('');
  showPw = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { name, email, password } = this.form.getRawValue();
    this.auth.register({ name: name!, email: email!, password: password! }).subscribe({
      next: () => {
        this.cartSvc.load().subscribe();
        this.router.navigate(['/']);
        this.toastSvc.success('Đăng ký thành công! Chào mừng bạn.');
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
