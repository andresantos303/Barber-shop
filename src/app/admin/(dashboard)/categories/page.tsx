import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/actions/admin-categories";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Categorias</h1>
        <Link href="/admin/categories/new" className="inline-flex">
          <Button className="gap-1.5">
            <Plus className="size-4" /> Nova Categoria
          </Button>
        </Link>
      </div>

      {error === "in-use" && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Não é possível eliminar uma categoria com serviços associados. Mude esses serviços para outra categoria primeiro.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Serviços</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 text-foreground">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{category._count.services}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categories/${category.id}/edit`} className="text-primary hover:underline">
                      Editar
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <button
                        type="submit"
                        disabled={category._count.services > 0}
                        className="text-destructive hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground/40 disabled:hover:no-underline"
                        title={
                          category._count.services > 0
                            ? "Não é possível eliminar uma categoria com serviços associados"
                            : undefined
                        }
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Nenhuma categoria criada.</p>}
    </div>
  );
}
