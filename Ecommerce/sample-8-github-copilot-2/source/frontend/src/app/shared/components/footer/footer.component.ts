import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="container mx-auto px-4 max-w-7xl py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

          <!-- Brand -->
          <div class="md:col-span-1">
            <span class="font-heading font-black text-2xl text-white tracking-tight">The Editorial</span>
            <p class="mt-3 text-sm text-gray-400 leading-relaxed">
              Nâng tầm phong cách cá nhân với những sản phẩm được tuyển chọn kỹ lưỡng.
            </p>
            <div class="flex gap-3 mt-4">
              @for (icon of socialIcons; track icon.label) {
                <a [href]="icon.url" target="_blank" rel="noopener"
                  class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <span class="text-sm font-bold">{{ icon.abbr }}</span>
                </a>
              }
            </div>
          </div>

          <!-- Quick links -->
          <div>
            <h4 class="font-semibold text-white mb-4">Danh mục</h4>
            <ul class="space-y-2 text-sm">
              @for (cat of categories; track cat.slug) {
                <li>
                  <a [routerLink]="['/san-pham']" [queryParams]="{category: cat.slug}"
                    class="hover:text-white transition-colors">{{ cat.name }}</a>
                </li>
              }
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-semibold text-white mb-4">Liên hệ</h4>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-sm mt-0.5 text-primary">location_on</span>
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm text-primary">phone</span>
                <a href="tel:+84901234567" class="hover:text-white transition-colors">0901 234 567</a>
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm text-primary">email</span>
                <a href="mailto:support@editorial.vn" class="hover:text-white transition-colors">support&#64;editorial.vn</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {{ currentYear }} The Editorial. Mọi quyền được bảo lưu.</p>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-gray-300 transition-colors">Điều khoản sử dụng</a>
            <a href="#" class="hover:text-gray-300 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  categories = [
    { name: 'Thời Trang', slug: 'thoi-trang' },
    { name: 'Điện Tử', slug: 'dien-tu' },
    { name: 'Làm Đẹp', slug: 'lam-dep' },
    { name: 'Nhà Cửa', slug: 'nha-cua' },
    { name: 'Thể Thao', slug: 'the-thao' },
    { name: 'Sách', slug: 'sach' },
  ];

  socialIcons = [
    { label: 'Facebook', abbr: 'f', url: '#' },
    { label: 'Instagram', abbr: 'in', url: '#' },
    { label: 'TikTok', abbr: 'tt', url: '#' },
  ];
}
