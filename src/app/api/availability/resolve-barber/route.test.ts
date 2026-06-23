import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/availability", () => ({
  findBarberForSlot: vi.fn(),
}));

import { findBarberForSlot } from "@/lib/availability";
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/availability/resolve-barber");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return new NextRequest(url);
}

describe("GET /api/availability/resolve-barber", () => {
  it("returns 400 when any param is missing", async () => {
    const res = await GET(makeRequest({ serviceId: "svc1", date: "2026-07-01" }));
    expect(res.status).toBe(400);
    expect(findBarberForSlot).not.toHaveBeenCalled();
  });

  it("returns 400 when the time is malformed", async () => {
    const res = await GET(makeRequest({ serviceId: "svc1", date: "2026-07-01", time: "9h30" }));
    expect(res.status).toBe(400);
  });

  it("delegates to findBarberForSlot and returns the resolved barberId", async () => {
    vi.mocked(findBarberForSlot).mockResolvedValue("pedro-castro-id");

    const res = await GET(makeRequest({ serviceId: "svc1", date: "2026-07-01", time: "09:00" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ barberId: "pedro-castro-id" });
    expect(findBarberForSlot).toHaveBeenCalledWith({ serviceId: "svc1", date: "2026-07-01", time: "09:00" });
  });

  it("returns barberId: null when no one is free", async () => {
    vi.mocked(findBarberForSlot).mockResolvedValue(null);

    const res = await GET(makeRequest({ serviceId: "svc1", date: "2026-07-01", time: "09:00" }));
    const body = await res.json();

    expect(body).toEqual({ barberId: null });
  });
});
