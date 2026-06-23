import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/data";
import { deleteProduct } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Produtos</h1>
        <Link href="/admin/products/new" className="inline-flex">
          <Button className="gap-1.5">
            <Plus className="size-4" /> Novo Produto
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-foreground">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.brand ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatPriceCents(product.priceCents)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.active
                        ? "rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-primary hover:underline">
                      Editar
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="text-destructive hover:underline">
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
    </div>
  );
}
