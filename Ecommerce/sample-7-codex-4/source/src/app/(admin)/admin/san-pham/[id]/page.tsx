import { notFound } from "next/navigation";
import { ProductEditorForm } from "@/components/forms";
import { SectionTitle } from "@/components/ui";
import { getProductFormData } from "@/modules/admin/service";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductFormData(id);

  if (!data.product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Cập nhật sản phẩm" description="Chỉnh sửa record products hiện tại." />
      <ProductEditorForm product={data.product} categoryOptions={data.categoryOptions} />
    </div>
  );
}
