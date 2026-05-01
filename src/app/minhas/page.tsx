import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getOwnerCookie } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function MinhasPage() {
  const owner = await getOwnerCookie();
  const items = owner
    ? await db
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
        .limit(60)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">minhas conversões</h1>
        <p className="text-[var(--muted)] mt-1">Identificadas pelo cookie deste navegador.</p>
      </div>
      <GalleryGrid
        items={items}
        emptyMessage="Você ainda não fez nenhuma conversão. Volte pra home e mande um print."
      />
    </div>
  );
}
