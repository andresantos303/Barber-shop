import { ServiceForm } from "@/components/admin/service-form";
import { createService } from "@/actions/admin-services";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo Serviço</h1>
      <ServiceForm action={createService} />
    </div>
  );
}
