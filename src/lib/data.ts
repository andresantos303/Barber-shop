import { prisma } from "@/lib/prisma";

export function getActiveBarbers() {
  return prisma.barber.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getActiveServices() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { category: true },
  });
  // Flattened to a plain `category` string so callers don't need to know the category is a
  // relation — matches the shape this function returned before categories had their own table.
  return services.map((service) => ({ ...service, category: service.category.name }));
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export function getActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export { formatPriceCents } from "@/lib/format";
