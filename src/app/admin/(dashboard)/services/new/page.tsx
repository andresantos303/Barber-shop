import { ServiceForm } from "@/components/admin/service-form";
import { createService } from "@/actions/admin-services";
import { getCategories } from "@/lib/data";

export default async function NewServicePage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo Serviço</h1>
      <ServiceForm categories={categories} action={createService} />
    </div>
  );
}
