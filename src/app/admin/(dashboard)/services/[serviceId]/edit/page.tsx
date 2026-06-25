import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";
import { updateService } from "@/actions/admin-services";
import { getCategories } from "@/lib/data";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    getCategories(),
  ]);
  if (!service) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar Serviço</h1>
      <ServiceForm service={service} categories={categories} action={updateService.bind(null, serviceId)} />
    </div>
  );
}
