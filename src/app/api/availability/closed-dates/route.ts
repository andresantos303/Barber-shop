import { NextResponse, type NextRequest } from "next/server";
import { ANY_BARBER, getClosedDates } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId") || ANY_BARBER;
  const serviceId = searchParams.get("serviceId");
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!serviceId || !year || !month) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const closedDates = await getClosedDates({ barberId, serviceId, year, month });
  return NextResponse.json({ closedDates });
}
