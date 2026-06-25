import type { Category } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";

export function CategoryForm({
  category,
  action,
}: {
  category?: Category;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Nome</label>
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Slug (URL)</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          required
          pattern="[a-z0-9-]+"
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
        />
      </div>

      <Button type="submit" className="h-11 px-8">
        Guardar
      </Button>
    </form>
  );
}
