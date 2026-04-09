import { SiteHeader } from "@/components/store/site-header";
import { requireAdminProfile } from "@/lib/auth";
import { listAdminProducts, listCategories } from "@/lib/data";
import { AdminProductManager } from "@/components/admin/admin-product-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminProfile();
  const [categories, products] = await Promise.all([
    listCategories(),
    listAdminProducts(),
  ]);

  return (
    <div className="pb-20">
      <SiteHeader />
      <main className="section-shell pt-8">
        <AdminProductManager categories={categories} initialProducts={products} />
      </main>
    </div>
  );
}
