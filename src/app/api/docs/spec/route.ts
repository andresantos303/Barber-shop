import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getApiDocs } from "@/lib/swagger";

// Not under /admin/**, so proxy.ts's optimistic cookie check doesn't cover this path —
// requireAdmin() here is the only (and therefore authoritative) guard.
export async function GET() {
  await requireAdmin();
  return NextResponse.json(getApiDocs());
}
