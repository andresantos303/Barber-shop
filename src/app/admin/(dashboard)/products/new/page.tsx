import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/actions/admin-products";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo Produto</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
