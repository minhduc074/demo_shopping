import { ProductEditorForm } from "@/components/forms";
import { SectionTitle } from "@/components/ui";
import { getProductFormData } from "@/modules/admin/service";

export default async function AdminCreateProductPage() {
  const data = await getProductFormData();
  return (
    <div className="space-y-6">
      <SectionTitle title="Thêm sản phẩm" description="Form ghi trực tiếp vào bảng products." />
      <ProductEditorForm product={null} categoryOptions={data.categoryOptions} />
    </div>
  );
}
