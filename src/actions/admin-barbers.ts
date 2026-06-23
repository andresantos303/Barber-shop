"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (use HH:mm)");

export async function updateBarber(barberId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const active = formData.get("active") === "on";
  await prisma.barber.update({ where: { id: barberId }, data: { name, bio: bio || null, active } });
  revalidatePath(`/admin/barbers/${barberId}`);
  revalidatePath("/admin/barbers");
  revalidatePath("/equipa");
}

export async function addWorkingHours(barberId: string, formData: FormData) {
  await requireAdmin();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = timeSchema.parse(formData.get("startTime"));
  const endTime = timeSchema.parse(formData.get("endTime"));

  if (startTime >= endTime) {
    throw new Error("A hora de início deve ser anterior à hora de fim.");
  }

  await prisma.workingHours.create({ data: { barberId, dayOfWeek, startTime, endTime } });
  revalidatePath(`/admin/barbers/${barberId}`);
}

export async function deleteWorkingHours(barberId: string, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("workingHoursId"));
  await prisma.workingHours.delete({ where: { id } });
  revalidatePath(`/admin/barbers/${barberId}`);
}

export async function addBlockedSlot(barberId: string, formData: FormData) {
  await requireAdmin();
  const date = String(formData.get("date"));
  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  const reason = (formData.get("reason") as string) || null;

  await prisma.blockedSlot.create({
    data: { barberId, date: new Date(`${date}T00:00:00Z`), startTime, endTime, reason },
  });
  revalidatePath(`/admin/barbers/${barberId}`);
}

export async function deleteBlockedSlot(barberId: string, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("blockedSlotId"));
  await prisma.blockedSlot.delete({ where: { id } });
  revalidatePath(`/admin/barbers/${barberId}`);
}
