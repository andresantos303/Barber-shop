import type { Category, Service } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ServiceForm({
  service,
  categories,
  action,
}: {
  service?: Service;
  categories: Category[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Nome</label>
        <input
          name="name"
          defaultValue={service?.name}
          required
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Slug (URL)</label>
        <input
          name="slug"
          defaultValue={service?.slug}
          required
          pattern="[a-z0-9-]+"
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Categoria</label>
        <Select name="categoryId" defaultValue={service?.categoryId} required>
          <SelectTrigger className="mt-1.5 h-10 w-full justify-between rounded-md border-input bg-background px-3 text-sm text-foreground">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
        <textarea
          name="description"
          defaultValue={service?.description ?? ""}
          rows={2}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Duração (min)</label>
          <input
            type="number"
            name="durationMin"
            min={5}
            step={5}
            defaultValue={service?.durationMin ?? 30}
            required
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
            defaultValue={service ? (service.priceCents / 100).toFixed(2) : "0"}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="size-4" />
        Ativo (visível no site)
      </label>

      <Button type="submit" className="h-11 px-8">
        Guardar
      </Button>
    </form>
  );
}
