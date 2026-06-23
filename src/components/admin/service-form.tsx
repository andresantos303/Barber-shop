import type { Service } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";

export function ServiceForm({
  service,
  action,
}: {
  service?: Service;
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
        <input
          name="category"
          defaultValue={service?.category}
          required
          list="categories"
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
        <datalist id="categories">
          <option value="Corte" />
          <option value="Barba" />
          <option value="Não Categorizado" />
        </datalist>
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
