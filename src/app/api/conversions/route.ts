import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { getOwnerCookie } from "@/lib/owner";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "public";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "30", 10), 100);

  if (scope === "mine") {
    const owner = await getOwnerCookie();
    if (!owner) return NextResponse.json({ items: [] });
    const items = await db
      .select({
        id: conversions.id,
        imageUrl: conversions.imageUrl,
        title: conversions.title,
        status: conversions.status,
        createdAt: conversions.createdAt,
      })
      .from(conversions)
      .where(eq(conversions.ownerCookie, owner))
      .orderBy(desc(conversions.createdAt))
      .limit(limit);
    return NextResponse.json({ items });
  }

  const items = await db
    .select({
      id: conversions.id,
      imageUrl: conversions.imageUrl,
      title: conversions.title,
      status: conversions.status,
      createdAt: conversions.createdAt,
    })
    .from(conversions)
    .where(and(eq(conversions.isPublic, true), eq(conversions.status, "done")))
    .orderBy(desc(conversions.createdAt))
    .limit(limit);
  return NextResponse.json({ items });
}
