"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
});

function parseCategoryForm(formData: FormData) {
  return categorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const data = parseCategoryForm(formData);
  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  await prisma.category.create({ data: { ...data, order: (maxOrder._max.order ?? 0) + 1 } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  redirect("/admin/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const data = parseCategoryForm(formData);
  await prisma.category.update({ where: { id: categoryId }, data });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  // The category name is flattened into every page that lists services by category.
  revalidatePath("/servicos");
  revalidatePath("/agendar");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId"));

  const serviceCount = await prisma.service.count({ where: { categoryId } });
  if (serviceCount > 0) {
    redirect("/admin/categories?error=in-use");
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}
