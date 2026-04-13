import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    @if (!isAdminRoute && !isAuthRoute) {
      <app-header />
    }
    <main>
      <router-outlet />
    </main>
    @if (!isAdminRoute && !isAuthRoute) {
      <app-footer />
    }
    <app-toast />
  `,
})
export class AppComponent {
  private router = inject(Router);

  isAdminRoute = false;
  isAuthRoute = false;

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdminRoute = e.url.startsWith('/admin');
      this.isAuthRoute = e.url.startsWith('/dang-nhap') || e.url.startsWith('/dang-ky');
    });
  }
}
