import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/availability", () => ({
  ANY_BARBER: "any",
  getClosedDates: vi.fn(),
}));

import { getClosedDates } from "@/lib/availability";
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/availability/closed-dates");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return new NextRequest(url);
}

describe("GET /api/availability/closed-dates", () => {
  it("returns 400 when serviceId, year, or month is missing", async () => {
    const res = await GET(makeRequest({ year: "2026", month: "7" }));
    expect(res.status).toBe(400);
    expect(getClosedDates).not.toHaveBeenCalled();
  });

  it("defaults barberId to ANY_BARBER when omitted", async () => {
    vi.mocked(getClosedDates).mockResolvedValue(["2026-07-05"]);

    const res = await GET(makeRequest({ serviceId: "svc1", year: "2026", month: "7" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ closedDates: ["2026-07-05"] });
    expect(getClosedDates).toHaveBeenCalledWith({ barberId: "any", serviceId: "svc1", year: 2026, month: 7 });
  });

  it("passes through an explicit barberId", async () => {
    vi.mocked(getClosedDates).mockResolvedValue([]);

    await GET(makeRequest({ serviceId: "svc1", barberId: "b1", year: "2026", month: "7" }));

    expect(getClosedDates).toHaveBeenCalledWith({ barberId: "b1", serviceId: "svc1", year: 2026, month: 7 });
  });
});
