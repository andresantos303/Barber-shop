"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const serviceSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  category: z.string().trim().min(1),
  description: z.string().trim().optional(),
  durationMin: z.coerce.number().int().min(5).max(480),
  priceCents: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});

function parseServiceForm(formData: FormData) {
  return serviceSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    durationMin: formData.get("durationMin"),
    priceCents: Math.round(Number(formData.get("priceEuros") ?? 0) * 100),
    active: formData.get("active") === "on",
  });
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const data = parseServiceForm(formData);
  const maxOrder = await prisma.service.aggregate({ _max: { order: true } });
  await prisma.service.create({ data: { ...data, order: (maxOrder._max.order ?? 0) + 1 } });
  revalidatePath("/admin/services");
  revalidatePath("/servicos");
  redirect("/admin/services");
}

export async function updateService(serviceId: string, formData: FormData) {
  await requireAdmin();
  const data = parseServiceForm(formData);
  await prisma.service.update({ where: { id: serviceId }, data });
  revalidatePath("/admin/services");
  revalidatePath("/servicos");
  redirect("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId"));
  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath("/admin/services");
  revalidatePath("/servicos");
}
