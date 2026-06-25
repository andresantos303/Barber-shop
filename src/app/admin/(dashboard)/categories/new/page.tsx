import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/actions/admin-categories";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nova Categoria</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
