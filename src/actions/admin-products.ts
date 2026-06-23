"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const productSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  brand: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});

function parseProductForm(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    brand: formData.get("brand") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    priceCents: Math.round(Number(formData.get("priceEuros") ?? 0) * 100),
    active: formData.get("active") === "on",
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const maxOrder = await prisma.product.aggregate({ _max: { order: true } });
  await prisma.product.create({ data: { ...data, order: (maxOrder._max.order ?? 0) + 1 } });
  revalidatePath("/admin/products");
  revalidatePath("/produtos");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  await prisma.product.update({ where: { id: productId }, data });
  revalidatePath("/admin/products");
  revalidatePath("/produtos");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/produtos");
  revalidatePath("/");
}
