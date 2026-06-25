import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "@/actions/admin-categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar Categoria</h1>
      <CategoryForm category={category} action={updateCategory.bind(null, categoryId)} />
    </div>
  );
}
