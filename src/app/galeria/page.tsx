import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { GalleryGrid } from "@/components/GalleryGrid";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
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
    .limit(60);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">galeria pública</h1>
        <p className="text-[var(--muted)] mt-1">Sites dos anos 2000 reimaginados por outras pessoas.</p>
      </div>
      <GalleryGrid items={items} emptyMessage="Ainda não há conversões públicas. Seja o primeiro!" />
    </div>
  );
}
