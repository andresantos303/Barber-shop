import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const BARBERS = [
  { name: "André Coelho", slug: "andre-coelho" },
  { name: "Diogo Pimentel", slug: "diogo-pimentel" },
  { name: "Ruben Gomes", slug: "ruben-gomes" },
  { name: "Pedro Castro", slug: "pedro-castro" },
];

const SERVICES: {
  name: string;
  slug: string;
  category: string;
  durationMin: number;
}[] = [
  { name: "Corte e Barba", slug: "corte-e-barba", category: "Corte", durationMin: 45 },
  { name: "Corte de Cabelo", slug: "corte-de-cabelo", category: "Corte", durationMin: 30 },
  { name: "Corte com Lavagem", slug: "corte-com-lavagem", category: "Corte", durationMin: 45 },
  { name: "Platinar", slug: "platinar", category: "Corte", durationMin: 30 },
  { name: "Corte Máquina Uniforme", slug: "corte-maquina-uniforme", category: "Corte", durationMin: 15 },
  { name: "Corte Infantil (até 8 anos)", slug: "corte-infantil", category: "Corte", durationMin: 30 },
  { name: "Corte + Coloração", slug: "corte-coloracao", category: "Corte", durationMin: 60 },
  { name: "Barba", slug: "barba", category: "Barba", durationMin: 20 },
  { name: "Barboterapia", slug: "barboterapia", category: "Barba", durationMin: 30 },
  { name: "Coloração", slug: "coloracao", category: "Não Categorizado", durationMin: 45 },
];

async function main() {
  const barbers = [];
  for (const [i, b] of BARBERS.entries()) {
    barbers.push(
      await prisma.barber.upsert({
        where: { slug: b.slug },
        update: {},
        create: { ...b, order: i },
      })
    );
  }

  const services = [];
  for (const [i, s] of SERVICES.entries()) {
    services.push(
      await prisma.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: { ...s, priceCents: 0, order: i },
      })
    );
  }

  // Default: every barber performs every service. Adjust per-barber restrictions later via admin panel.
  for (const barber of barbers) {
    for (const service of services) {
      await prisma.barberService.upsert({
        where: { barberId_serviceId: { barberId: barber.id, serviceId: service.id } },
        update: {},
        create: { barberId: barber.id, serviceId: service.id },
      });
    }
  }

  // Placeholder default hours (Mon-Sat 09:00-19:00) for every barber — replace via admin panel.
  for (const barber of barbers) {
    for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
      await prisma.workingHours.upsert({
        where: { id: `${barber.id}-${dayOfWeek}` },
        update: {},
        create: { id: `${barber.id}-${dayOfWeek}`, barberId: barber.id, dayOfWeek, startTime: "09:00", endTime: "19:00" },
      });
    }
  }

  // Placeholder catalog — replace with real names/prices/photos via the admin panel before launch.
  const PRODUCTS = [
    { name: "Óleo de Barba", slug: "oleo-de-barba", priceCents: 1490, brand: "André Cabeleireiro" },
    { name: "Pomada Modeladora", slug: "pomada-modeladora", priceCents: 1290, brand: "André Cabeleireiro" },
    { name: "Champô Anti-Queda", slug: "champo-anti-queda", priceCents: 1690, brand: "André Cabeleireiro" },
    { name: "Cera Matte", slug: "cera-matte", priceCents: 1190, brand: "André Cabeleireiro" },
  ];
  for (const [i, p] of PRODUCTS.entries()) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, order: i },
    });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@andrecabeleireiro.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "changeme123";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  console.log(`Seeded ${barbers.length} barbers, ${services.length} services, admin user ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
