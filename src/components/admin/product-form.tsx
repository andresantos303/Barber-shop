import type { Product } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";

export function ProductForm({
  product,
  action,
}: {
  product?: Product;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Nome</label>
        <input
          name="name"
          defaultValue={product?.name}
          required
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Slug (URL)</label>
        <input
          name="slug"
          defaultValue={product?.slug}
          required
          pattern="[a-z0-9-]+"
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Marca (opcional)</label>
        <input
          name="brand"
          defaultValue={product?.brand ?? ""}
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={2}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">URL da imagem (opcional)</label>
        <input
          name="imageUrl"
          defaultValue={product?.imageUrl ?? ""}
          placeholder="https://..."
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Preço (€)</label>
        <input
          type="number"
          name="priceEuros"
          min={0}
          step={0.5}
          defaultValue={product ? (product.priceCents / 100).toFixed(2) : "0"}
          required
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4" />
        Ativo (visível no site)
      </label>

      <Button type="submit" className="h-11 px-8">
        Guardar
      </Button>
    </form>
  );
}
