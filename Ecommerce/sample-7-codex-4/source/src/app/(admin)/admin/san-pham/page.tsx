import Link from "next/link";
import { deleteProductAction } from "@/app/actions";
import { SectionTitle, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { getAdminProducts } from "@/modules/admin/service";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <SectionTitle title="Quản lý sản phẩm" description="CRUD trực tiếp trên bảng products." action={<Link href="/admin/san-pham/tao-moi" className="editorial-gradient rounded-full px-5 py-3 font-semibold text-white">Thêm sản phẩm</Link>} />
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="grid gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-ambient)] md:grid-cols-[1fr_auto_auto]">
            <div><p className="font-display text-2xl font-semibold">{product.name}</p><p className="mt-2 text-sm text-[var(--muted)]">{formatCurrency(product.basePrice)}</p></div>
            <StatusBadge>{product.status}</StatusBadge>
            <div className="flex items-center gap-3">
              <Link href={`/admin/san-pham/${product.id}`} className="rounded-full bg-[var(--surface-low)] px-4 py-3 text-sm font-semibold">Sửa</Link>
              <form action={deleteProductAction}><input type="hidden" name="productId" value={product.id} /><button className="text-sm font-semibold text-[var(--danger)]">Xóa</button></form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
