import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { getOrCreateOwnerCookie } from "@/lib/owner";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const owner = await getOrCreateOwnerCookie();
  const form = await req.formData();
  const file = form.get("image");
  const title = (form.get("title") as string | null)?.slice(0, 120) ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image field is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "image too large (max 8MB)" }, { status: 400 });
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ error: "unsupported image type" }, { status: 400 });
  }

  const blob = await put(`uploads/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    contentType: file.type,
  });

  const [row] = await db
    .insert(conversions)
    .values({
      ownerCookie: owner,
      imageUrl: blob.url,
      imageMime: file.type,
      title,
    })
    .returning({ id: conversions.id });

  return NextResponse.json({ id: row.id });
}
