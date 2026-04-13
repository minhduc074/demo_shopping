import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-card shadow-card-hover px-4 py-3 text-sm font-medium animate-slide-in"
          [class.bg-green-50]="toast.type === 'success'"
          [class.border-green-200]="toast.type === 'success'"
          [class.text-green-800]="toast.type === 'success'"
          [class.bg-red-50]="toast.type === 'error'"
          [class.border-red-200]="toast.type === 'error'"
          [class.text-red-800]="toast.type === 'error'"
          [class.bg-blue-50]="toast.type === 'info'"
          [class.border-blue-200]="toast.type === 'info'"
          [class.text-blue-800]="toast.type === 'info'"
          style="border-width: 1px"
        >
          <span class="material-symbols-outlined text-lg flex-shrink-0">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastSvc.remove(toast.id)" class="opacity-60 hover:opacity-100 transition-opacity">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastSvc = inject(ToastService);
}
