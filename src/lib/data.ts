import { prisma } from "@/lib/prisma";

export function getActiveBarbers() {
  return prisma.barber.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export function getActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export { formatPriceCents } from "@/lib/format";
