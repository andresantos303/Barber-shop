"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { sendBookingConfirmationEmails } from "@/lib/email";

export async function cancelBookingAdmin(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/bookings");
}

export async function markNoShow(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "NO_SHOW" } });
  revalidatePath("/admin/bookings");
}

export async function markCompleted(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } });
  revalidatePath("/admin/bookings");
}

export async function resendConfirmationEmail(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  await sendBookingConfirmationEmails(bookingId);
  revalidatePath("/admin/bookings");
}
