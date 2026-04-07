import { PageIntro } from "@/components/commerce";
import { ProductCreateForm } from "@/components/forms";
import { getAllCategories, getProductManagementData } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function ProductManagementPage() {
  const [categories, products] = await Promise.all([getAllCategories(), getProductManagementData()]);

  return (
    <div className="content-shell space-y-10">
      <PageIntro description="This page mirrors the Stitch product management screen with a real create-product API route and a live Prisma table." eyebrow="Product Management" title="Manage the catalog" />
      <ProductCreateForm categories={categories} />
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgba(45,47,47,0.06)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[--surface-low] text-[--muted]">
            <tr>
              <th className="px-5 py-4 font-semibold">Product</th>
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Inventory</th>
              <th className="px-5 py-4 font-semibold">Featured</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="border-t border-black/5" key={product.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[--ink]">{product.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[--muted]">{product.brand}</p>
                </td>
                <td className="px-5 py-4 text-[--ink]">{product.category.name}</td>
                <td className="px-5 py-4 text-[--ink]">{formatCurrency(product.priceCents)}</td>
                <td className="px-5 py-4 text-[--ink]">{product.inventory}</td>
                <td className="px-5 py-4 text-[--ink]">{product.featured ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

