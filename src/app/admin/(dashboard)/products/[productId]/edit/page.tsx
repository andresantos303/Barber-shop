import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/actions/admin-products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar Produto</h1>
      <ProductForm product={product} action={updateProduct.bind(null, productId)} />
    </div>
  );
}
