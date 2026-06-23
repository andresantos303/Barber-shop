import { NextResponse, type NextRequest } from "next/server";
import { ANY_BARBER, getAvailableSlots, getAvailableSlotsAnyBarber } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const slots =
    !barberId || barberId === ANY_BARBER
      ? await getAvailableSlotsAnyBarber({ serviceId, date })
      : await getAvailableSlots({ barberId, serviceId, date });

  return NextResponse.json({ slots });
}
