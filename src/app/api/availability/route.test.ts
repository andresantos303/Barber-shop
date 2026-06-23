import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/availability", () => ({
  ANY_BARBER: "any",
  getAvailableSlots: vi.fn(),
  getAvailableSlotsAnyBarber: vi.fn(),
}));

import { getAvailableSlots, getAvailableSlotsAnyBarber } from "@/lib/availability";
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/availability");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return new NextRequest(url);
}

describe("GET /api/availability", () => {
  it("returns 400 when serviceId is missing", async () => {
    const res = await GET(makeRequest({ date: "2026-07-01" }));
    expect(res.status).toBe(400);
    expect(getAvailableSlots).not.toHaveBeenCalled();
    expect(getAvailableSlotsAnyBarber).not.toHaveBeenCalled();
  });

  it("returns 400 when date is malformed", async () => {
    const res = await GET(makeRequest({ serviceId: "svc1", date: "07-01-2026" }));
    expect(res.status).toBe(400);
  });

  it("delegates to getAvailableSlots for a specific barber", async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue(["09:00", "09:30"]);

    const res = await GET(makeRequest({ serviceId: "svc1", barberId: "b1", date: "2026-07-01" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ slots: ["09:00", "09:30"] });
    expect(getAvailableSlots).toHaveBeenCalledWith({ barberId: "b1", serviceId: "svc1", date: "2026-07-01" });
    expect(getAvailableSlotsAnyBarber).not.toHaveBeenCalled();
  });

  it("delegates to getAvailableSlotsAnyBarber when barberId is omitted or 'any'", async () => {
    vi.mocked(getAvailableSlotsAnyBarber).mockResolvedValue(["10:00"]);

    const res = await GET(makeRequest({ serviceId: "svc1", date: "2026-07-01" }));
    const body = await res.json();

    expect(body).toEqual({ slots: ["10:00"] });
    expect(getAvailableSlotsAnyBarber).toHaveBeenCalledWith({ serviceId: "svc1", date: "2026-07-01" });
    expect(getAvailableSlots).not.toHaveBeenCalled();
  });
});
