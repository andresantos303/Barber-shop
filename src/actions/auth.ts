"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logger } from "@/lib/logger";

export type LoginResult = { error: string } | undefined;

export async function login(_prevState: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha o email e a palavra-passe." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    logger.warn({ email }, "Admin login failed");
    return { error: "Credenciais inválidas." };
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.adminEmail = admin.email;
  await session.save();

  logger.info({ adminId: admin.id, email: admin.email }, "Admin login succeeded");
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  logger.info({ adminId: session.adminId }, "Admin logout");
  session.destroy();
  redirect("/admin/login");
}
